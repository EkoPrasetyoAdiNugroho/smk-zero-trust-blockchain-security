import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { verifyJwtToken, JwtPayload } from './crypto.js';
import { UserRole } from './types.js';

// Extend Express Request to hold verified user payload
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  rawToken?: string;
}

// In-memory rate limiting tracker (IP based)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const loginAttemptsMap = new Map<string, { attempts: number; lockUntil?: number }>();

// 1. Security Headers Middleware (Zero Trust defense-in-depth)
export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:;"
  );
  next();
}

// 2. Global Rate Limiter (120 requests per minute per IP)
export function rateLimiter(limit = 120, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    entry.count++;
    if (entry.count > limit) {
      db.addAuditLog({
        eventType: 'RATE_LIMITED',
        severity: 'WARNING',
        ipAddress: ip,
        endpoint: req.originalUrl,
        details: `Rate limit threshold exceeded (${entry.count}/${limit} reqs)`,
      });
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Zero Trust protective throttling activated.',
        retryAfterMs: entry.resetTime - now,
      });
    }

    next();
  };
}

// 3. Login Brute Force Lockout Checker
export function checkLoginLockout(identifier: string): { locked: boolean; remainingSec?: number } {
  const entry = loginAttemptsMap.get(identifier.toLowerCase());
  if (!entry) return { locked: false };
  if (entry.lockUntil && Date.now() < entry.lockUntil) {
    const remainingSec = Math.ceil((entry.lockUntil - Date.now()) / 1000);
    return { locked: true, remainingSec };
  }
  if (entry.lockUntil && Date.now() >= entry.lockUntil) {
    // Reset lockout
    loginAttemptsMap.delete(identifier.toLowerCase());
  }
  return { locked: false };
}

export function recordFailedLogin(identifier: string) {
  const key = identifier.toLowerCase();
  const entry = loginAttemptsMap.get(key) || { attempts: 0 };
  entry.attempts++;
  if (entry.attempts >= 5) {
    entry.lockUntil = Date.now() + 15 * 60 * 1000; // 15 min lockout
  }
  loginAttemptsMap.set(key, entry);
  return entry.attempts;
}

export function recordSuccessfulLogin(identifier: string) {
  loginAttemptsMap.delete(identifier.toLowerCase());
}

// 4. JWT Authentication Middleware
export function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header with Bearer token',
    });
  }

  const token = authHeader.split(' ')[1];
  const { valid, payload, error } = verifyJwtToken(token);

  if (!valid || !payload) {
    db.addAuditLog({
      eventType: 'TOKEN_INVALID',
      severity: 'WARNING',
      ipAddress: req.ip || '127.0.0.1',
      endpoint: req.originalUrl,
      details: `JWT validation rejected: ${error}`,
    });
    return res.status(401).json({
      error: 'Unauthorized',
      message: error || 'Invalid token',
    });
  }

  req.user = payload;
  req.rawToken = token;
  next();
}

// 5. Role-Based Access Control (RBAC) Middleware -> Returns 403 on denial
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      db.addAuditLog({
        eventType: 'AUTHZ_DENIED',
        severity: 'CRITICAL',
        actorId: req.user.sub,
        actorUsername: req.user.username,
        actorRole: userRole,
        ipAddress: req.ip || '127.0.0.1',
        endpoint: req.originalUrl,
        details: `Access denied. Role ${userRole} attempted unauthorized access to restricted resource. Allowed roles: [${allowedRoles.join(', ')}]`,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: `Akses ditolak (HTTP 403). Role '${userRole}' tidak memiliki hak akses pada endpoint ini.`,
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
}

// 6. MFA Enforcement Middleware for Administrative operations (TU, Kepsek, DUDI)
export function requireMfa(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // If user role is TU, KEPALA_SEKOLAH, or DUDI, require completed MFA
  const privilegedRoles: UserRole[] = ['TU', 'KEPALA_SEKOLAH', 'DUDI'];
  if (privilegedRoles.includes(req.user.role as UserRole) && !req.user.mfaAuthenticated) {
    db.addAuditLog({
      eventType: 'AUTHZ_DENIED',
      severity: 'WARNING',
      actorId: req.user.sub,
      actorUsername: req.user.username,
      actorRole: req.user.role,
      ipAddress: req.ip || '127.0.0.1',
      endpoint: req.originalUrl,
      details: 'Akses diblokir karena otentikasi MFA TOTP belum diselesaikan.',
    });

    return res.status(403).json({
      error: 'MFA_REQUIRED',
      message: 'Operasi administratif ini mewajibkan otentikasi bertingkat (TOTP MFA).',
      mfaRequired: true,
    });
  }

  next();
}

// 7. Ownership & IDOR Protection Middleware for Student Scoped Access
export function requireStudentOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const requestedStudentId = req.params.id || req.body.studentId;

  // TU and Kepala Sekolah can access all students
  if (['TU', 'KEPALA_SEKOLAH', 'AUDITOR', 'GURU'].includes(req.user.role)) {
    return next();
  }

  // If role is SISWA, verify the student id matches their own profile
  if (req.user.role === 'SISWA') {
    const student = Array.from(db.students.values()).find((s) => s.userId === req.user?.sub);
    if (!student || (requestedStudentId && student.id !== requestedStudentId)) {
      db.addAuditLog({
        eventType: 'AUTHZ_DENIED',
        severity: 'CRITICAL',
        actorId: req.user.sub,
        actorUsername: req.user.username,
        actorRole: 'SISWA',
        ipAddress: req.ip || '127.0.0.1',
        endpoint: req.originalUrl,
        details: `IDOR Prevention triggered: Siswa attempted to access unauthorized student record (ID: ${requestedStudentId})`,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Akses ditolak (Anti-IDOR): Anda hanya diizinkan mengakses data akademik milik sendiri.',
      });
    }
  }

  next();
}

// 8. Sanitize Input against XSS / SQLi / Event Handlers
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\bon\w+\s*=/gi, 'data-blocked=') // Disarms inline event handlers like onerror=, onclick=
      .replace(/javascript:/gi, 'blocked-scheme:')
      .trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      cleaned[k] = sanitizeInput(v);
    }
    return cleaned;
  }
  return input;
}
