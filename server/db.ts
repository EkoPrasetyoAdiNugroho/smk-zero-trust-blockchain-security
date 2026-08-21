import {
  User,
  Student,
  Teacher,
  Grade,
  DocumentRecord,
  BlockchainRecord,
  GradeAudit,
  AuditLog,
} from './types.js';
import { hashPassword, computeSha256 } from './crypto.js';

class InMemoryDatabase {
  users: Map<string, User> = new Map();
  students: Map<string, Student> = new Map();
  teachers: Map<string, Teacher> = new Map();
  grades: Map<string, Grade> = new Map();
  documents: Map<string, DocumentRecord> = new Map();
  blockchainRecords: Map<string, BlockchainRecord> = new Map();
  gradeAudits: GradeAudit[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Users
    const defaultPasswordHash = hashPassword('Password123!');
    // Unique Base32 TOTP secrets per user (Zero Trust RFC 6238 isolation)
    const usersData: User[] = [
      {
        id: 'usr-tu-01',
        username: 'tu_staff',
        email: 'tu@smk.sch.id',
        fullName: 'Dra. Endang Sulastri (Staf TU)',
        role: 'TU',
        passwordHash: defaultPasswordHash,
        mfaSecret: 'JBSWY3DPEHPK3PXP', // Staf TU Unique Secret
        mfaEnabled: true,
        isLocked: false,
        failedAttempts: 0,
        organization: 'SMK Negeri 1 Educhain Teknologi',
      },
      {
        id: 'usr-kepsek-01',
        username: 'kepala_sekolah',
        email: 'kepsek@smk.sch.id',
        fullName: 'Dr. Ir. Hendro Wibowo, M.T. (Kepala Sekolah)',
        role: 'KEPALA_SEKOLAH',
        passwordHash: defaultPasswordHash,
        mfaSecret: 'KREU4TBNK5XWK33P', // Kepala Sekolah Unique Secret
        mfaEnabled: true,
        isLocked: false,
        failedAttempts: 0,
        organization: 'SMK Negeri 1 Educhain Teknologi',
      },
      {
        id: 'usr-guru-01',
        username: 'guru_tkj',
        email: 'guru.tkj@smk.sch.id',
        fullName: 'Drs. H. Bambang Subagyo, M.Kom (Guru TKJ)',
        role: 'GURU',
        passwordHash: defaultPasswordHash,
        mfaSecret: 'OBZGC2DMMFWS43TH',
        mfaEnabled: false,
        isLocked: false,
        failedAttempts: 0,
        organization: 'SMK Negeri 1 Educhain Teknologi',
        nipOrNisn: '197508122000031001',
      },
      {
        id: 'usr-siswa-01',
        username: 'siswa_budi',
        email: 'siswa.budi@smk.sch.id',
        fullName: 'Budi Santoso',
        role: 'SISWA',
        passwordHash: defaultPasswordHash,
        mfaSecret: 'PEXWGY3VO5UXK43I',
        mfaEnabled: false,
        isLocked: false,
        failedAttempts: 0,
        nipOrNisn: '0051234567',
      },
      {
        id: 'usr-dudi-01',
        username: 'dudi_partner',
        email: 'dudi.ptint@dudi.id',
        fullName: 'Raden Satria, S.T. (Head of Talent Dev PT Industri Nusantara Tech)',
        role: 'DUDI',
        passwordHash: defaultPasswordHash,
        mfaSecret: 'N5XWGY3YONSWK33P', // Mitra Industri DUDI Unique Secret
        mfaEnabled: true,
        isLocked: false,
        failedAttempts: 0,
        organization: 'PT Industri Nusantara Tech',
      },
      {
        id: 'usr-auditor-01',
        username: 'auditor_kemdikbud',
        email: 'auditor@kemdikbud.go.id',
        fullName: 'M. Yusuf Arifin, S.E., Ak. (Auditor Inspektorat)',
        role: 'AUDITOR',
        passwordHash: defaultPasswordHash,
        mfaSecret: 'QEZSGY3XN5UWK43U',
        mfaEnabled: false,
        isLocked: false,
        failedAttempts: 0,
        organization: 'Inspektorat Jenderal Kemdikbudristek',
      },
    ];

    usersData.forEach((u) => this.users.set(u.id, u));

    // 2. Teachers
    const teachersData: Teacher[] = [
      {
        id: 'tch-01',
        nip: '197508122000031001',
        fullName: 'Drs. H. Bambang Subagyo, M.Kom',
        subject: 'Administrasi Infrastruktur Jaringan',
        userId: 'usr-guru-01',
      },
      {
        id: 'tch-02',
        nip: '198204152005012003',
        fullName: 'Sri Wahyuni, S.Pd., M.T.',
        subject: 'Pemrograman Web dan Perangkat Bergerak',
      },
    ];
    teachersData.forEach((t) => this.teachers.set(t.id, t));

    // 3. Students
    const studentsData: Student[] = [
      {
        id: 'std-01',
        nisn: '0051234567',
        nis: '20230101',
        fullName: 'Budi Santoso',
        className: 'XII TKJ 1',
        major: 'Teknik Komputer dan Jaringan',
        birthPlace: 'Bandung',
        birthDate: '2005-04-12',
        address: 'Jl. Merdeka No. 45, Bandung',
        graduationStatus: 'LULUS',
        graduationYear: 2026,
        userId: 'usr-siswa-01',
      },
      {
        id: 'std-02',
        nisn: '0051234568',
        nis: '20230102',
        fullName: 'Siti Rahmawati',
        className: 'XII TKJ 1',
        major: 'Teknik Komputer dan Jaringan',
        birthPlace: 'Cimahi',
        birthDate: '2005-08-20',
        address: 'Jl. Cihanjuang No. 12, Cimahi',
        graduationStatus: 'LULUS',
        graduationYear: 2026,
      },
      {
        id: 'std-03',
        nisn: '0051234569',
        nis: '20230201',
        fullName: 'Ahmad Fauzi',
        className: 'XII RPL 2',
        major: 'Rekayasa Perangkat Lunak',
        birthPlace: 'Jakarta',
        birthDate: '2005-01-15',
        address: 'Jl. Kebon Jeruk No. 8, Jakarta Barat',
        graduationStatus: 'LULUS',
        graduationYear: 2026,
      },
      {
        id: 'std-04',
        nisn: '0051234570',
        nis: '20230202',
        fullName: 'Dewi Lestari',
        className: 'XII RPL 2',
        major: 'Rekayasa Perangkat Lunak',
        birthPlace: 'Bogor',
        birthDate: '2005-11-03',
        address: 'Jl. Pajajaran No. 90, Bogor',
        graduationStatus: 'PENDING_APPROVAL',
        graduationYear: 2026,
      },
      {
        id: 'std-05',
        nisn: '0051234571',
        nis: '20240101',
        fullName: 'Rizky Pratama',
        className: 'XI TKJ 1',
        major: 'Teknik Komputer dan Jaringan',
        birthPlace: 'Depok',
        birthDate: '2006-03-22',
        address: 'Jl. Margonda No. 104, Depok',
        graduationStatus: 'AKTIF',
        graduationYear: 2027,
      },
      {
        id: 'std-06',
        nisn: '0051234572',
        nis: '20240201',
        fullName: 'Nabila Putri',
        className: 'XI RPL 1',
        major: 'Rekayasa Perangkat Lunak',
        birthPlace: 'Tangerang',
        birthDate: '2006-07-19',
        address: 'Jl. Sudirman No. 33, Tangerang',
        graduationStatus: 'AKTIF',
        graduationYear: 2027,
      },
      {
        id: 'std-07',
        nisn: '0051234573',
        nis: '20230301',
        fullName: 'Eko Kurniawan',
        className: 'XII DKV 1',
        major: 'Desain Komunikasi Visual',
        birthPlace: 'Semarang',
        birthDate: '2005-05-30',
        address: 'Jl. Pemuda No. 11, Semarang',
        graduationStatus: 'LULUS',
        graduationYear: 2026,
      },
      {
        id: 'std-08',
        nisn: '0051234574',
        nis: '20230401',
        fullName: 'Maya Anggraini',
        className: 'XII MM 1',
        major: 'Multimedia',
        birthPlace: 'Surabaya',
        birthDate: '2005-09-14',
        address: 'Jl. Basuki Rahmat No. 7, Surabaya',
        graduationStatus: 'PENDING_APPROVAL',
        graduationYear: 2026,
      },
      {
        id: 'std-09',
        nisn: '0051234575',
        nis: '20240102',
        fullName: 'Fajar Nugraha',
        className: 'XI TKJ 2',
        major: 'Teknik Komputer dan Jaringan',
        birthPlace: 'Bekasi',
        birthDate: '2006-12-05',
        address: 'Jl. Ahmad Yani No. 50, Bekasi',
        graduationStatus: 'AKTIF',
        graduationYear: 2027,
      },
      {
        id: 'std-10',
        nisn: '0051234576',
        nis: '20230203',
        fullName: 'Zahra Amanda',
        className: 'XII RPL 1',
        major: 'Rekayasa Perangkat Lunak',
        birthPlace: 'Yogyakarta',
        birthDate: '2005-02-18',
        address: 'Jl. Malioboro No. 20, Yogyakarta',
        graduationStatus: 'LULUS',
        graduationYear: 2026,
      },
    ];
    studentsData.forEach((s) => this.students.set(s.id, s));

    // 4. Grades
    const gradesData: Grade[] = [
      {
        id: 'grd-01',
        studentId: 'std-01',
        teacherId: 'tch-01',
        subject: 'Administrasi Infrastruktur Jaringan',
        semester: 5,
        score: 92,
        academicYear: '2025/2026',
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'grd-02',
        studentId: 'std-01',
        teacherId: 'tch-01',
        subject: 'Keamanan Jaringan & Cloud',
        semester: 5,
        score: 95,
        academicYear: '2025/2026',
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'grd-03',
        studentId: 'std-02',
        teacherId: 'tch-01',
        subject: 'Administrasi Infrastruktur Jaringan',
        semester: 5,
        score: 88,
        academicYear: '2025/2026',
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'grd-04',
        studentId: 'std-03',
        teacherId: 'tch-02',
        subject: 'Pemrograman Web dan Cloud Native',
        semester: 5,
        score: 94,
        academicYear: '2025/2026',
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'grd-05',
        studentId: 'std-04',
        teacherId: 'tch-02',
        subject: 'Pemrograman Web dan Cloud Native',
        semester: 5,
        score: 85,
        academicYear: '2025/2026',
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'grd-06',
        studentId: 'std-05',
        teacherId: 'tch-01',
        subject: 'Dasar Komputer dan Jaringan',
        semester: 3,
        score: 82,
        academicYear: '2025/2026',
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];
    gradesData.forEach((g) => this.grades.set(g.id, g));

    // Seed initial Audit logs
    this.addAuditLog({
      eventType: 'LOGIN_SUCCESS',
      severity: 'INFO',
      actorId: 'usr-tu-01',
      actorUsername: 'tu_staff',
      actorRole: 'TU',
      ipAddress: '192.168.1.50',
      endpoint: '/api/auth/login',
      details: 'Petugas TU berhasil login dan menyelesaikan otentikasi MFA TOTP',
    });
  }

  // Audit Logger helper
  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.auditLogs.unshift(newLog);
    // Keep max 500 audit logs
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return newLog;
  }
}

export const db = new InMemoryDatabase();
