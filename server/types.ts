export type UserRole = 'TU' | 'KEPALA_SEKOLAH' | 'GURU' | 'SISWA' | 'DUDI' | 'AUDITOR';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  passwordHash: string; // argon2/sha256 representation
  mfaSecret?: string;
  mfaEnabled: boolean;
  isLocked: boolean;
  failedAttempts: number;
  lockUntil?: number;
  organization?: string;
  nipOrNisn?: string;
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  fullName: string;
  className: string;
  major: string; // e.g. "Teknik Komputer dan Jaringan", "Rekayasa Perangkat Lunak"
  birthPlace: string;
  birthDate: string;
  address: string;
  graduationStatus: 'AKTIF' | 'LULUS' | 'PENDING_APPROVAL';
  graduationYear: number;
  userId?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  fullName: string;
  subject: string;
  userId?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  teacherId: string;
  subject: string;
  semester: number;
  score: number; // 0 - 100
  academicYear: string;
  updatedAt: string;
}

export type DocumentType = 'IJAZAH' | 'TRANSKRIP' | 'SERTIFIKAT_PKL';
export type DocumentStatus = 'DRAFT' | 'AUTHORIZED' | 'ISSUED' | 'REJECTED';

export interface DocumentRecord {
  id: string;
  documentType: DocumentType;
  studentId: string;
  studentName: string;
  studentNisn: string;
  documentNumber: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileHash: string; // SHA-256
  status: DocumentStatus;
  issuedBy?: string;
  authorizedBy?: string;
  dudiName?: string;
  transactionHash?: string;
  blockNumber?: number;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    gpa?: number;
    major?: string;
    pklCompany?: string;
    pklDuration?: string;
    pklScore?: string;
    schoolName?: string;
  };
}

export interface BlockchainRecord {
  id: string;
  documentId: string;
  documentHash: string;
  transactionHash: string;
  blockNumber: number;
  issuerAddress: string;
  issuerRole: 'SEKOLAH' | 'DUDI';
  recipientNisn: string;
  documentType: DocumentType;
  timestamp: number;
  signature: string;
  status: 'VALID' | 'REVOKED';
  metadata: {
    title: string;
    studentName: string;
    documentNumber: string;
    academicYear: string;
  };
}

export interface GradeAudit {
  id: string;
  gradeId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  oldScore: number;
  newScore: number;
  reason: string;
  transactionHash: string;
  createdAt: string;
}

export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGIN_LOCKOUT'
  | 'MFA_VERIFIED'
  | 'MFA_FAILED'
  | 'AUTHZ_DENIED'
  | 'GRADE_UPDATED'
  | 'DOC_UPLOADED'
  | 'DOC_AUTHORIZED'
  | 'BLOCKCHAIN_ISSUED'
  | 'TAMPER_DETECTED'
  | 'TOKEN_INVALID'
  | 'RATE_LIMITED';

export interface AuditLog {
  id: string;
  eventType: AuditEventType;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  actorId?: string;
  actorUsername?: string;
  actorRole?: string;
  ipAddress: string;
  userAgent?: string;
  endpoint: string;
  details: string;
  timestamp: string;
}

export interface BlockchainBlock {
  blockNumber: number;
  previousHash: string;
  blockHash: string;
  timestamp: number;
  merkleRoot: string;
  transactionsCount: number;
  transactions: BlockchainRecord[];
  gradeAudits: GradeAudit[];
  miner: string;
}
