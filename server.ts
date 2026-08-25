import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { blockchain } from './server/blockchain.js';
import {
  computeSha256,
  createJwtToken,
  verifyPassword,
  verifyTOTP,
  verifyTOTPWithDetails,
  generateTOTP,
  generateBase32Secret,
  getJwtPublicKey,
  createDeviceTrustToken,
  verifyDeviceTrustToken,
} from './server/crypto.js';
import {
  applySecurityHeaders,
  rateLimiter,
  authenticateJwt,
  requireRole,
  requireMfa,
  requireStudentOwnership,
  sanitizeInput,
  checkLoginLockout,
  recordFailedLogin,
  recordSuccessfulLogin,
  AuthenticatedRequest,
} from './server/security.js';
import { runAllSecurityAndIntegrityTests } from './server/testRunner.js';
import { DocumentRecord, DocumentStatus, DocumentType } from './server/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with size limit
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security Headers & Global Rate Limiting
  app.use(applySecurityHeaders);
  app.use(rateLimiter(150, 60000));

  // ==========================================
  // 0. HEALTH CHECK
  // ==========================================
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'SMK Zero Trust & EduChain API',
      version: '5.18.0',
      timestamp: new Date().toISOString(),
      blockchainBlocks: blockchain.blocks.length,
      securityStatus: 'ZERO_TRUST_ENFORCED',
    });
  });

  // ==========================================
  // 1. AUTHENTICATION ENDPOINTS (FR-001, FR-003, SR-003)
  // ==========================================

  // POST /api/auth/login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { usernameOrEmail, password } = sanitizeInput(req.body);

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/email dan password wajib diisi.' });
    }

    // Check Lockout Status
    const lockout = checkLoginLockout(usernameOrEmail);
    if (lockout.locked) {
      db.addAuditLog({
        eventType: 'LOGIN_LOCKOUT',
        severity: 'CRITICAL',
        ipAddress: req.ip || '127.0.0.1',
        endpoint: '/api/auth/login',
        details: `Upaya login diblokir karena akun terkunci (${lockout.remainingSec}s tersisa)`,
      });
      return res.status(423).json({
        error: 'ACCOUNT_LOCKED',
        message: `Akun terkunci sementara karena 5 kali kegagalan login. Coba lagi dalam ${lockout.remainingSec} detik.`,
        remainingSec: lockout.remainingSec,
      });
    }

    // Lookup user
    const user = Array.from(db.users.values()).find(
      (u) =>
        u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
        u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      const attempts = recordFailedLogin(usernameOrEmail);
      db.addAuditLog({
        eventType: 'LOGIN_FAILED',
        severity: 'WARNING',
        ipAddress: req.ip || '127.0.0.1',
        endpoint: '/api/auth/login',
        details: `Gagal login untuk identitas '${usernameOrEmail}'. Percobaan ke-${attempts}/5.`,
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        message: `Email/username atau kata sandi tidak cocok. (${attempts}/5 percobaan)`,
      });
    }

    // Successful password authentication
    recordSuccessfulLogin(usernameOrEmail);

    // If role requires MFA (TU, Kepsek, DUDI), check Trusted Device status first
    const requiresMfa = ['TU', 'KEPALA_SEKOLAH', 'DUDI'].includes(user.role) || user.mfaEnabled;

    if (requiresMfa) {
      const { trustedDeviceToken } = sanitizeInput(req.body);

      // Check if this device is trusted (Remember Me 30-day bypass)
      if (trustedDeviceToken && verifyDeviceTrustToken(trustedDeviceToken, user.id)) {
        const fullToken = createJwtToken({
          sub: user.id,
          username: user.username,
          role: user.role,
          mfaAuthenticated: true,
        });

        db.addAuditLog({
          eventType: 'LOGIN_SUCCESS',
          severity: 'INFO',
          actorId: user.id,
          actorUsername: user.username,
          actorRole: user.role,
          ipAddress: req.ip || '127.0.0.1',
          endpoint: '/api/auth/login',
          details: `Login berhasil melalui Perangkat Terpercaya (Trusted Device). Verifikasi TOTP MFA dilewati untuk user '${user.username}'.`,
        });

        return res.json({
          mfaRequired: false,
          token: fullToken,
          trustedDeviceBypassed: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            organization: user.organization,
            nipOrNisn: user.nipOrNisn,
          },
          message: 'Login berhasil. Perangkat ini dikenali sebagai Perangkat Terpercaya.',
        });
      }

      const tempMfaToken = createJwtToken(
        {
          sub: user.id,
          username: user.username,
          role: user.role,
          mfaAuthenticated: false,
        },
        300 // 5 minutes validity to complete MFA
      );

      db.addAuditLog({
        eventType: 'LOGIN_SUCCESS',
        severity: 'INFO',
        actorId: user.id,
        actorUsername: user.username,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        endpoint: '/api/auth/login',
        details: 'Kata sandi valid. Memerlukan verifikasi langkah kedua (TOTP MFA).',
      });

      return res.json({
        mfaRequired: true,
        tempToken: tempMfaToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          organization: user.organization,
          nipOrNisn: user.nipOrNisn,
          demoTotpSecret: user.mfaSecret,
        },
        message: 'Otentikasi password berhasil. Silakan masukkan kode TOTP dari aplikasi Authenticator Anda.',
      });
    }

    // Direct token for non-MFA roles (e.g. Siswa, Guru, Auditor)
    const token = createJwtToken({
      sub: user.id,
      username: user.username,
      role: user.role,
      mfaAuthenticated: true,
    });

    db.addAuditLog({
      eventType: 'LOGIN_SUCCESS',
      severity: 'INFO',
      actorId: user.id,
      actorUsername: user.username,
      actorRole: user.role,
      ipAddress: req.ip || '127.0.0.1',
      endpoint: '/api/auth/login',
      details: 'Login berhasil (Direct Auth). Token sesi diterbitkan.',
    });

    return res.json({
      mfaRequired: false,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization,
        nipOrNisn: user.nipOrNisn,
      },
    });
  });

  // POST /api/auth/mfa/verify
  app.post('/api/auth/mfa/verify', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
    const { totpCode } = sanitizeInput(req.body);
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = db.users.get(userId);
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ error: 'MFA tidak aktif untuk akun ini.' });
    }

    const mfaResult = verifyTOTPWithDetails(totpCode, user.mfaSecret, user.id);
    if (!mfaResult.valid) {
      const isReplay = mfaResult.error === 'OTP_REPLAY_DETECTED';
      db.addAuditLog({
        eventType: isReplay ? 'AUTHZ_DENIED' : 'MFA_FAILED',
        severity: isReplay ? 'CRITICAL' : 'WARNING',
        actorId: user.id,
        actorUsername: user.username,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        endpoint: '/api/auth/mfa/verify',
        details: isReplay
          ? `Percobaan Replay OTP terdeteksi dan diblokir untuk user '${user.username}'.`
          : 'Kode TOTP salah atau telah kedaluwarsa.',
      });

      return res.status(400).json({
        error: mfaResult.error || 'INVALID_TOTP',
        message:
          mfaResult.message ||
          'Kode autentikasi 6 digit tidak valid atau sudah kedaluwarsa. Periksa jam perangkat Anda.',
      });
    }

    // Issue fully authenticated token
    const fullToken = createJwtToken({
      sub: user.id,
      username: user.username,
      role: user.role,
      mfaAuthenticated: true,
    });

    // Create 30-day device trust token for "Remember Me"
    const trustedDeviceToken = createDeviceTrustToken(user.id, 30);

    db.addAuditLog({
      eventType: 'MFA_VERIFIED',
      severity: 'INFO',
      actorId: user.id,
      actorUsername: user.username,
      actorRole: user.role,
      ipAddress: req.ip || '127.0.0.1',
      endpoint: '/api/auth/mfa/verify',
      details: 'Otentikasi TOTP MFA berhasil diselesaikan. Hak akses administratif & token perangkat terpercaya diberikan.',
    });

    return res.json({
      success: true,
      token: fullToken,
      trustedDeviceToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization,
        nipOrNisn: user.nipOrNisn,
      },
    });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
    db.addAuditLog({
      eventType: 'LOGIN_SUCCESS',
      severity: 'INFO',
      actorId: req.user?.sub,
      actorUsername: req.user?.username,
      actorRole: req.user?.role,
      ipAddress: req.ip || '127.0.0.1',
      endpoint: '/api/auth/logout',
      details: 'Sesi pengguna berhasil diakhiri (Logout).',
    });

    res.json({ success: true, message: 'Logout berhasil. Sesi telah diakhiri.' });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
    const user = db.users.get(req.user?.sub || '');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine current live TOTP code for easy demo testing
    const currentTotp = user.mfaSecret ? generateTOTP(user.mfaSecret) : undefined;

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      mfaAuthenticated: req.user?.mfaAuthenticated ?? false,
      organization: user.organization,
      nipOrNisn: user.nipOrNisn,
      demoTotpSecret: user.mfaSecret,
      demoCurrentTotp: currentTotp,
    });
  });

  // POST /api/auth/switch-role (Role simulation switch endpoint)
  app.post('/api/auth/switch-role', (req: Request, res: Response) => {
    const { role } = sanitizeInput(req.body);
    let targetEmail = 'tu@smk.sch.id';
    if (role === 'KEPALA_SEKOLAH') targetEmail = 'kepsek@smk.sch.id';
    else if (role === 'GURU') targetEmail = 'guru.tkj@smk.sch.id';
    else if (role === 'SISWA') targetEmail = 'siswa.budi@smk.sch.id';
    else if (role === 'DUDI') targetEmail = 'dudi.ptint@dudi.id';
    else if (role === 'AUDITOR') targetEmail = 'auditor@kemdikbud.go.id';

    const user = Array.from(db.users.values()).find((u) => u.email === targetEmail);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = createJwtToken({
      sub: user.id,
      username: user.username,
      role: user.role,
      mfaAuthenticated: true,
    });

    db.addAuditLog({
      eventType: 'LOGIN_SUCCESS',
      severity: 'INFO',
      actorId: user.id,
      actorUsername: user.username,
      actorRole: user.role,
      ipAddress: req.ip || '127.0.0.1',
      endpoint: '/api/auth/switch-role',
      details: `Simulasi ganti peran aktif: ${user.fullName} (${user.role}).`,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization,
        nipOrNisn: user.nipOrNisn,
      },
    });
  });

  // ==========================================
  // 2. STUDENTS API (FR-004)
  // ==========================================

  // GET /api/v1/students
  app.get(
    '/api/v1/students',
    authenticateJwt,
    requireRole(['TU', 'KEPALA_SEKOLAH', 'GURU', 'AUDITOR', 'DUDI', 'SISWA']),
    (req: AuthenticatedRequest, res: Response) => {
      let students = Array.from(db.students.values());

      // If Siswa role, only return their own profile
      if (req.user?.role === 'SISWA') {
        students = students.filter((s) => s.userId === req.user?.sub || s.nisn === req.user?.username);
      }

      // Filter query parameters (parameterized / safe filter)
      const { search, className, major, graduationStatus } = req.query;
      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        students = students.filter(
          (s) =>
            s.fullName.toLowerCase().includes(query) ||
            s.nisn.includes(query) ||
            s.nis.includes(query)
        );
      }
      if (className && typeof className === 'string') {
        students = students.filter((s) => s.className === className);
      }
      if (major && typeof major === 'string') {
        students = students.filter((s) => s.major === major);
      }
      if (graduationStatus && typeof graduationStatus === 'string') {
        students = students.filter((s) => s.graduationStatus === graduationStatus);
      }

      res.json({ data: students, count: students.length });
    }
  );

  // GET /api/v1/students/:id
  app.get(
    '/api/v1/students/:id',
    authenticateJwt,
    requireStudentOwnership,
    (req: AuthenticatedRequest, res: Response) => {
      const student = db.students.get(req.params.id);
      if (!student) {
        return res.status(404).json({ error: 'Student record not found' });
      }

      // Fetch student grades and documents
      const grades = Array.from(db.grades.values()).filter((g) => g.studentId === student.id);
      const documents = Array.from(db.documents.values()).filter((d) => d.studentId === student.id);

      res.json({
        data: {
          ...student,
          grades,
          documents,
        },
      });
    }
  );

  // ==========================================
  // 3. TEACHERS API (FR-004)
  // ==========================================

  // GET /api/v1/teachers
  app.get(
    '/api/v1/teachers',
    authenticateJwt,
    requireRole(['TU', 'KEPALA_SEKOLAH', 'GURU', 'AUDITOR']),
    (req: Request, res: Response) => {
      const teachers = Array.from(db.teachers.values());
      res.json({ data: teachers, count: teachers.length });
    }
  );

  // GET /api/v1/teachers/:id
  app.get(
    '/api/v1/teachers/:id',
    authenticateJwt,
    requireRole(['TU', 'KEPALA_SEKOLAH', 'GURU', 'AUDITOR']),
    (req: Request, res: Response) => {
      const teacher = db.teachers.get(req.params.id);
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher record not found' });
      }
      res.json({ data: teacher });
    }
  );

  // ==========================================
  // 4. GRADES API & AUDIT TRAIL (FR-004, FR-011, BR-006)
  // ==========================================

  // GET /api/v1/grades
  app.get(
    '/api/v1/grades',
    authenticateJwt,
    requireRole(['TU', 'KEPALA_SEKOLAH', 'GURU', 'SISWA', 'AUDITOR']),
    (req: AuthenticatedRequest, res: Response) => {
      let grades = Array.from(db.grades.values());

      if (req.user?.role === 'SISWA') {
        const student = Array.from(db.students.values()).find((s) => s.userId === req.user?.sub);
        if (!student) {
          return res.json({ data: [], count: 0 });
        }
        grades = grades.filter((g) => g.studentId === student.id);
      }

      const { studentId } = req.query;
      if (studentId && typeof studentId === 'string') {
        grades = grades.filter((g) => g.studentId === studentId);
      }

      // Attach student and teacher details
      const enriched = grades.map((g) => {
        const student = db.students.get(g.studentId);
        const teacher = db.teachers.get(g.teacherId);
        return {
          ...g,
          studentName: student?.fullName || 'N/A',
          studentNisn: student?.nisn || 'N/A',
          className: student?.className || 'N/A',
          teacherName: teacher?.fullName || 'N/A',
        };
      });

      res.json({ data: enriched, count: enriched.length });
    }
  );

  // POST /api/v1/grades (Create Grade)
  app.post(
    '/api/v1/grades',
    authenticateJwt,
    requireRole(['GURU', 'TU']),
    (req: AuthenticatedRequest, res: Response) => {
      const { studentId, subject, semester, score, academicYear } = sanitizeInput(req.body);

      if (!studentId || !subject || score === undefined) {
        return res.status(400).json({ error: 'Data nilai tidak lengkap.' });
      }

      const teacher = Array.from(db.teachers.values()).find((t) => t.userId === req.user?.sub) ||
        Array.from(db.teachers.values())[0];

      const newGrade = {
        id: `grd-${Date.now()}`,
        studentId,
        teacherId: teacher.id,
        subject,
        semester: Number(semester) || 5,
        score: Number(score),
        academicYear: academicYear || '2025/2026',
        updatedAt: new Date().toISOString(),
      };

      db.grades.set(newGrade.id, newGrade);

      db.addAuditLog({
        eventType: 'GRADE_UPDATED',
        severity: 'INFO',
        actorId: req.user?.sub,
        actorUsername: req.user?.username,
        actorRole: req.user?.role,
        ipAddress: req.ip || '127.0.0.1',
        endpoint: '/api/v1/grades',
        details: `Nilai baru dimasukkan untuk siswa ID ${studentId}: ${subject} (${score})`,
      });

      res.status(201).json({ success: true, data: newGrade });
    }
  );

  // POST /api/v1/grades/update (Update Grade with Mandatory Reason & Blockchain Anchoring)
  app.post(
    '/api/v1/grades/update',
    authenticateJwt,
    requireRole(['GURU', 'TU', 'KEPALA_SEKOLAH']),
    (req: AuthenticatedRequest, res: Response) => {
      const { gradeId, newScore, reason } = sanitizeInput(req.body);

      if (!gradeId || newScore === undefined || !reason) {
        return res.status(400).json({
          error: 'Parameter tidak lengkap. gradeId, newScore, dan reason (alasan perubahan) wajib disertakan.',
        });
      }

      const grade = db.grades.get(gradeId);
      if (!grade) {
        return res.status(404).json({ error: 'Grade record not found' });
      }

      const student = db.students.get(grade.studentId);
      const teacher = db.teachers.get(grade.teacherId) || { fullName: req.user?.username || 'Staff' };
      const oldScore = grade.score;

      // Update grade in DB
      grade.score = Number(newScore);
      grade.updatedAt = new Date().toISOString();
      db.grades.set(grade.id, grade);

      // Create immutable Grade Audit record
      const gradeAuditRecord = {
        id: `aud-grd-${Date.now()}`,
        gradeId: grade.id,
        studentId: grade.studentId,
        studentName: student?.fullName || 'N/A',
        teacherId: grade.teacherId,
        teacherName: teacher.fullName,
        subject: grade.subject,
        oldScore,
        newScore: Number(newScore),
        reason,
        transactionHash: '',
        createdAt: new Date().toISOString(),
      };

      // Anchor to Blockchain Smart Contract (recordGradeChange)
      const txHash = blockchain.recordGradeChangeOnChain(gradeAuditRecord);
      db.gradeAudits.unshift(gradeAuditRecord);

      db.addAuditLog({
        eventType: 'GRADE_UPDATED',
        severity: 'WARNING',
        actorId: req.user?.sub,
        actorUsername: req.user?.username,
        actorRole: req.user?.role,
        ipAddress: req.ip || '127.0.0.1',
        endpoint: '/api/v1/grades/update',
        details: `Perubahan nilai disetujui: ${grade.subject} (${oldScore} -> ${newScore}). Alasan: ${reason}. TxHash: ${txHash}`,
      });

      res.json({
        success: true,
        message: 'Nilai berhasil diperbarui dan bukti audit telah dicatat secara immutable pada blockchain.',
        data: grade,
        auditTrail: {
          ...gradeAuditRecord,
          transactionHash: txHash,
          blockNumber: blockchain.blocks.length - 1,
        },
      });
    }
  );

  // ==========================================
  // 5. DOCUMENTS API (FR-005, FR-009, FR-010)
  // ==========================================

  // POST /api/documents/hash (Compute SHA-256 server-side hash)
  app.post('/api/documents/hash', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
    const { fileContent, metadata } = req.body;
    if (!fileContent && !metadata) {
      return res.status(400).json({ error: 'File content or metadata is required to compute cryptographic hash.' });
    }

    const payload = fileContent || JSON.stringify(metadata);
    const hash = computeSha256(payload);

    res.json({
      hash,
      algorithm: 'SHA-256',
      timestamp: new Date().toISOString(),
    });
  });

  // POST /api/documents/upload (TU / DUDI upload document draft)
  app.post(
    '/api/documents/upload',
    authenticateJwt,
    requireRole(['TU', 'DUDI', 'KEPALA_SEKOLAH']),
    (req: AuthenticatedRequest, res: Response) => {
      const {
        documentType,
        studentId,
        documentNumber,
        title,
        fileName,
        fileSize,
        fileContent,
        metadata,
      } = sanitizeInput(req.body);

      if (!documentType || !studentId || !documentNumber || !title) {
        return res.status(400).json({ error: 'Form data dokumen belum lengkap.' });
      }

      const student = db.students.get(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Siswa tidak ditemukan.' });
      }

      // Determine SHA-256 hash: use client-computed SHA-256 directly if provided (64 hex characters)
      let fileHash = '';
      if (fileContent && typeof fileContent === 'string' && /^[a-fA-F0-9]{64}$/.test(fileContent.trim())) {
        fileHash = fileContent.trim().toLowerCase();
      } else {
        const docPayload = fileContent || `${documentType}:${student.nisn}:${documentNumber}:${title}:${Date.now()}`;
        fileHash = computeSha256(docPayload);
      }

      // Check anti-duplicate hash on database
      const existingDoc = Array.from(db.documents.values()).find((d) => d.fileHash === fileHash);
      if (existingDoc && existingDoc.status === 'ISSUED') {
        return res.status(409).json({
          error: 'DUPLICATE_HASH',
          message: 'Dokumen dengan hash SHA-256 ini sudah pernah diterbitkan resmi on-chain.',
        });
      }

      const newDoc: DocumentRecord = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        documentType: documentType as DocumentType,
        studentId: student.id,
        studentName: student.fullName,
        studentNisn: student.nisn,
        documentNumber,
        title,
        fileName: fileName || `${documentType}_${student.nisn}.pdf`,
        fileSize: fileSize || 1024 * 512,
        fileHash,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          schoolName: 'SMK Negeri 1 Educhain Teknologi',
          major: student.major,
          ...metadata,
        },
      };

      db.documents.set(newDoc.id, newDoc);

      db.addAuditLog({
        eventType: 'DOC_UPLOADED',
        severity: 'INFO',
        actorId: req.user?.sub,
        actorUsername: req.user?.username,
        actorRole: req.user?.role,
        ipAddress: req.ip || '127.0.0.1',
        endpoint: '/api/documents/upload',
        details: `Dokumen ${documentType} (No: ${documentNumber}) berhasil diunggah dengan status DRAFT. Hash: ${fileHash}`,
      });

      res.status(201).json({
        success: true,
        message: 'Draft dokumen berhasil dibuat dan siap untuk proses otorisasi digital.',
        data: newDoc,
      });
    }
  );

  // GET /api/documents/:id
  app.get('/api/documents/:id', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
    const doc = db.documents.get(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Siswa can only view their own document
    if (req.user?.role === 'SISWA') {
      const student = Array.from(db.students.values()).find((s) => s.userId === req.user?.sub);
      if (!student || student.id !== doc.studentId) {
        return res.status(403).json({ error: 'Forbidden (Anti-IDOR)' });
      }
    }

    res.json({ data: doc });
  });

  // GET /api/documents (List documents)
  app.get('/api/documents', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
    let docs = Array.from(db.documents.values());

    if (req.user?.role === 'SISWA') {
      const student = Array.from(db.students.values()).find((s) => s.userId === req.user?.sub);
      if (!student) return res.json({ data: [] });
      docs = docs.filter((d) => d.studentId === student.id);
    }

    const { status, type, studentId } = req.query;
    if (status && typeof status === 'string') {
      docs = docs.filter((d) => d.status === status);
    }
    if (type && typeof type === 'string') {
      docs = docs.filter((d) => d.documentType === type);
    }
    if (studentId && typeof studentId === 'string') {
      docs = docs.filter((d) => d.studentId === studentId);
    }

    res.json({ data: docs, count: docs.length });
  });

  // ==========================================
  // 6. BLOCKCHAIN ISSUANCE & VERIFICATION (FR-007, FR-008, BR-001..BR-005)
  // ==========================================

  // POST /api/blockchain/issue (Kepsek / DUDI Digital Signature & Issuance on-chain)
  app.post(
    '/api/blockchain/issue',
    authenticateJwt,
    requireRole(['KEPALA_SEKOLAH', 'DUDI']),
    requireMfa,
    (req: AuthenticatedRequest, res: Response) => {
      const { documentId, totpConfirmationCode } = sanitizeInput(req.body);

      if (!documentId) {
        return res.status(400).json({ error: 'documentId wajib disertakan.' });
      }

      const doc = db.documents.get(documentId);
      if (!doc) {
        return res.status(404).json({ error: 'Dokumen tidak ditemukan.' });
      }

      const user = db.users.get(req.user?.sub || '');
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Extra TOTP check if provided during issuance step
      if (totpConfirmationCode && user.mfaSecret) {
        const isTotpValid = verifyTOTP(totpConfirmationCode, user.mfaSecret);
        if (!isTotpValid) {
          return res.status(400).json({ error: 'Kode konfirmasi TOTP tidak valid.' });
        }
      }

      const isDudi = req.user?.role === 'DUDI';
      const issuerRole = isDudi ? 'DUDI' : 'SEKOLAH';
      const issuerAddress = isDudi ? blockchain.DUDI_ISSUER_ADDRESS : blockchain.SCHOOL_ISSUER_ADDRESS;

      // Smart Contract Call: issueCertificate()
      const issueResult = blockchain.issueCertificate({
        documentId: doc.id,
        documentHash: doc.fileHash,
        recipientNisn: doc.studentNisn,
        documentType: doc.documentType,
        issuerRole,
        issuerAddress,
        metadata: {
          title: doc.title,
          studentName: doc.studentName,
          documentNumber: doc.documentNumber,
          academicYear: '2025/2026',
        },
      });

      if (!issueResult.success) {
        db.addAuditLog({
          eventType: 'AUTHZ_DENIED',
          severity: 'CRITICAL',
          actorId: user.id,
          actorUsername: user.username,
          actorRole: user.role,
          ipAddress: req.ip || '127.0.0.1',
          endpoint: '/api/blockchain/issue',
          details: `Kegagalan Smart Contract saat menerbitkan dokumen ${doc.documentNumber}: ${issueResult.error}`,
        });

        return res.status(400).json({
          error: 'SMART_CONTRACT_REVERT',
          message: issueResult.error,
        });
      }

      // Update Document status in relational database
      doc.status = 'ISSUED';
      doc.transactionHash = issueResult.transactionHash;
      doc.blockNumber = issueResult.blockNumber;
      doc.authorizedBy = user.fullName;
      doc.issuedBy = user.fullName;
      doc.updatedAt = new Date().toISOString();
      db.documents.set(doc.id, doc);

      // If document is IJAZAH, update student graduationStatus to LULUS
      if (doc.documentType === 'IJAZAH') {
        const student = db.students.get(doc.studentId);
        if (student) {
          student.graduationStatus = 'LULUS';
          db.students.set(student.id, student);
        }
      }

      db.addAuditLog({
        eventType: 'BLOCKCHAIN_ISSUED',
        severity: 'INFO',
        actorId: user.id,
        actorUsername: user.username,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        endpoint: '/api/blockchain/issue',
        details: `Dokumen ${doc.documentType} (${doc.documentNumber}) berhasil diterbitkan on-chain. TxHash: ${issueResult.transactionHash} (Block #${issueResult.blockNumber})`,
      });

      res.json({
        success: true,
        message: 'Dokumen berhasil ditandatangani secara kriptografis dan diterbitkan pada blockchain.',
        transactionHash: issueResult.transactionHash,
        blockNumber: issueResult.blockNumber,
        document: doc,
      });
    }
  );

  // GET /api/blockchain/verify/:hash (Public Verification Portal - NO AUTH REQUIRED)
  app.get('/api/blockchain/verify/:hash', (req: Request, res: Response) => {
    const hash = req.params.hash;

    if (!hash || hash.length < 10) {
      return res.status(400).json({ error: 'Valid cryptographic SHA-256 hash is required.' });
    }

    const verification = blockchain.verifyCertificate(hash);

    if (verification.status !== 'VALID') {
      db.addAuditLog({
        eventType: 'TAMPER_DETECTED',
        severity: 'WARNING',
        ipAddress: req.ip || '127.0.0.1',
        endpoint: `/api/blockchain/verify/${hash}`,
        details: `Verifikasi publik mendeteksi dokumen tidak terdaftar atau telah dimanipulasi. Hash: ${hash}`,
      });

      // EXACT canonical specification format for tampered/invalid document
      return res.json({
        status: 'INVALID / FALSIFIED DOCUMENT',
        message:
          'DOKUMEN TIDAK VALID ATAU TELAH MENGALAMI MANIPULASI / PEMALSUAN. Hash kriptografis tidak cocok dengan catatan blockchain konsorsium resmi.',
        queriedHash: hash,
        timestamp: new Date().toISOString(),
      });
    }

    // Authentic document response
    res.json({
      status: 'VALID',
      message: 'DOKUMEN ASLI & TERVERIFIKASI. Catatan keabsahan terdaftar secara permanen pada blockchain.',
      record: verification.record,
      verificationDetails: verification.verificationDetails,
    });
  });

  // GET /api/blockchain/transaction/:id (Get transaction details)
  app.get('/api/blockchain/transaction/:id', authenticateJwt, (req: Request, res: Response) => {
    const tx = blockchain.getTransaction(req.params.id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found on blockchain ledger.' });
    }
    res.json({ data: tx });
  });

  // GET /api/blockchain/blocks (For Blockchain Explorer UI)
  app.get('/api/blockchain/blocks', (req: Request, res: Response) => {
    res.json({
      data: blockchain.blocks,
      totalBlocks: blockchain.blocks.length,
      network: 'SMK EduChain Consortium (EVM Compatible)',
      consensus: 'QBFT Proof of Authority',
    });
  });

  // ==========================================
  // 7. AUDIT LOGS API (FR-014, SR-010)
  // ==========================================

  // GET /api/audit/logs (Kepsek & Auditor only)
  app.get(
    '/api/audit/logs',
    authenticateJwt,
    requireRole(['KEPALA_SEKOLAH', 'AUDITOR', 'TU']),
    (req: AuthenticatedRequest, res: Response) => {
      let logs = [...db.auditLogs];

      const { eventType, severity, actorRole } = req.query;
      if (eventType && typeof eventType === 'string') {
        logs = logs.filter((l) => l.eventType === eventType);
      }
      if (severity && typeof severity === 'string') {
        logs = logs.filter((l) => l.severity === severity);
      }
      if (actorRole && typeof actorRole === 'string') {
        logs = logs.filter((l) => l.actorRole === actorRole);
      }

      res.json({
        data: logs,
        count: logs.length,
        totalInDb: db.auditLogs.length,
      });
    }
  );

  // GET /api/download/report
  app.get('/api/download/report', (req: Request, res: Response) => {
    const filePath = path.join(process.cwd(), 'public', 'Laporan_Tugas_Akhir_Cloud_Security_Architecture.docx');
    res.download(filePath, 'Laporan_Tugas_Akhir_Cloud_Security_Architecture.docx', (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ error: 'File laporan belum digenerate.' });
      }
    });
  });

  // ==========================================
  // 8. AUTOMATED SECURITY TEST SUITE (TEST-001..TEST-020)
  // ==========================================
  app.post('/api/test/run-all', async (req: Request, res: Response) => {
    try {
      const testReport = await runAllSecurityAndIntegrityTests();
      res.json(testReport);
    } catch (err: any) {
      res.status(500).json({ error: 'Test execution failed', details: err.message });
    }
  });

  // ==========================================
  // 9. VITE MIDDLEWARE (Development & Production)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Zero Trust API] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[EduChain Node] Genesis & Block 1 loaded with ${blockchain.recordsByHash.size} verified certificates.`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
});
