import { User, Student, Teacher, Grade, DocumentRecord, AuditLog, BlockchainBlock, TestResult } from './types';

const TOKEN_KEY = 'smk_zerotrust_jwt_token';
const USER_KEY = 'smk_zerotrust_user';
const REMEMBERED_ID_KEY = 'smk_remembered_identifier';
const TRUSTED_DEVICE_PREFIX = 'smk_trusted_device_';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getRememberedIdentifier(): string | null {
  return localStorage.getItem(REMEMBERED_ID_KEY);
}

export function setRememberedIdentifier(identifier: string) {
  localStorage.setItem(REMEMBERED_ID_KEY, identifier);
}

export function clearRememberedIdentifier() {
  localStorage.removeItem(REMEMBERED_ID_KEY);
}

export function getTrustedDeviceToken(userIdOrIdentifier: string): string | null {
  const normalized = userIdOrIdentifier.toLowerCase().trim();
  return localStorage.getItem(TRUSTED_DEVICE_PREFIX + normalized);
}

export function setTrustedDeviceToken(userIdOrIdentifier: string, token: string) {
  const normalized = userIdOrIdentifier.toLowerCase().trim();
  localStorage.setItem(TRUSTED_DEVICE_PREFIX + normalized, token);
}

export function clearTrustedDeviceToken(userIdOrIdentifier: string) {
  const normalized = userIdOrIdentifier.toLowerCase().trim();
  localStorage.removeItem(TRUSTED_DEVICE_PREFIX + normalized);
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Client-side SHA-256 computation using native browser WebCrypto API
export async function calculateClientSha256(data: ArrayBuffer | string): Promise<string> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Read file as ArrayBuffer
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// API Request Wrapper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string; status: number; message?: string }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const status = response.status;
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (status === 401 && endpoint !== '/api/auth/login') {
        clearAuthStorage();
      }
      return {
        ok: false,
        error: json.error || `HTTP ${status}`,
        message: json.message || json.error || 'Terjadi kesalahan pada server',
        status,
      };
    }

    return {
      ok: true,
      data: json,
      status,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: 'NETWORK_ERROR',
      message: err.message || 'Gagal terhubung ke API server.',
      status: 0,
    };
  }
}

export const api = {
  // Auth
  login: (usernameOrEmail: string, password: string, trustedDeviceToken?: string | null) =>
    apiRequest<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password, trustedDeviceToken }),
    }),

  switchRole: (role: string) =>
    apiRequest<any>('/api/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  verifyMfa: (totpCode: string) =>
    apiRequest<any>('/api/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ totpCode }),
    }),

  logout: () =>
    apiRequest<any>('/api/auth/logout', {
      method: 'POST',
    }),

  getMe: () => apiRequest<User>('/api/auth/me'),

  // Students
  getStudents: (params?: { search?: string; className?: string; graduationStatus?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.className) query.append('className', params.className);
    if (params?.graduationStatus) query.append('graduationStatus', params.graduationStatus);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<{ data: Student[]; count: number }>(`/api/v1/students${qs}`);
  },

  getStudentById: (id: string) => apiRequest<{ data: Student }>(`/api/v1/students/${id}`),

  // Teachers
  getTeachers: () => apiRequest<{ data: Teacher[]; count: number }>('/api/v1/teachers'),

  // Grades
  getGrades: (studentId?: string) => {
    const qs = studentId ? `?studentId=${studentId}` : '';
    return apiRequest<{ data: Grade[]; count: number }>(`/api/v1/grades${qs}`);
  },

  createGrade: (payload: { studentId: string; subject: string; semester: number; score: number; academicYear?: string }) =>
    apiRequest<any>('/api/v1/grades', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateGrade: (payload: { gradeId: string; newScore: number; reason: string }) =>
    apiRequest<any>('/api/v1/grades/update', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Documents
  getDocuments: (params?: { status?: string; type?: string; studentId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.type) query.append('type', params.type);
    if (params?.studentId) query.append('studentId', params.studentId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<{ data: DocumentRecord[]; count: number }>(`/api/documents${qs}`);
  },

  uploadDocument: (payload: {
    documentType: string;
    studentId: string;
    documentNumber: string;
    title: string;
    fileName?: string;
    fileSize?: number;
    fileContent?: string;
    metadata?: any;
  }) =>
    apiRequest<{ success: boolean; data: DocumentRecord; message: string }>('/api/documents/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getDocumentById: (id: string) => apiRequest<{ data: DocumentRecord }>(`/api/documents/${id}`),

  // Blockchain Issuance & Public Verification
  issueDocumentOnChain: (documentId: string, totpConfirmationCode?: string) =>
    apiRequest<{ success: boolean; transactionHash: string; blockNumber: number; document: DocumentRecord }>(
      '/api/blockchain/issue',
      {
        method: 'POST',
        body: JSON.stringify({ documentId, totpConfirmationCode }),
      }
    ),

  verifyDocumentByHash: (hash: string) =>
    apiRequest<{
      status: 'VALID' | 'INVALID / FALSIFIED DOCUMENT';
      message: string;
      record?: any;
      verificationDetails?: any;
      queriedHash?: string;
    }>(`/api/blockchain/verify/${hash}`),

  getBlockchainBlocks: () =>
    apiRequest<{ data: BlockchainBlock[]; totalBlocks: number; network: string; consensus: string }>(
      '/api/blockchain/blocks'
    ),

  // Audit Logs
  getAuditLogs: (params?: { eventType?: string; severity?: string; actorRole?: string }) => {
    const query = new URLSearchParams();
    if (params?.eventType) query.append('eventType', params.eventType);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.actorRole) query.append('actorRole', params.actorRole);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<{ data: AuditLog[]; count: number; totalInDb: number }>(`/api/audit/logs${qs}`);
  },

  // Security Test Runner
  runSecurityTests: () =>
    apiRequest<{
      summary: { total: number; passed: number; failed: number; timestamp: string };
      results: TestResult[];
    }>('/api/test/run-all', {
      method: 'POST',
    }),
};
