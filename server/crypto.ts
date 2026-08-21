import crypto from 'crypto';

// Asymmetric RSA Keypair for RS256 JWT Signing & Verification (Zero Trust Architecture)
// In production with AWS KMS, the Private Key is held in KMS HSM, and Public Key is distributed.
const { privateKey: RSA_PRIVATE_KEY, publicKey: RSA_PUBLIC_KEY } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const SYSTEM_SIGNING_KEY = process.env.SYSTEM_SIGNING_KEY || 'smk-kepsek-dudi-educhain-secp256k1-simulator-key';

// Export Public Key (SPKI PEM) for Verifiers
export function getJwtPublicKey(): string {
  return RSA_PUBLIC_KEY;
}

// Base32 decoding for TOTP
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Decode(base32: string): Buffer {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (let i = 0; i < cleanBase32.length; i++) {
    const val = BASE32_CHARS.indexOf(cleanBase32.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateBase32Secret(length = 16): string {
  let secret = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[randomBytes[i] % 32];
  }
  return secret;
}

// Generate RFC 6238 TOTP Code for a given step
export function generateTOTPForStep(secretBase32: string, timeStep: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(timeStep));

  const key = base32Decode(secretBase32);
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(buffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

// Generate RFC 6238 TOTP Code from current timestamp
export function generateTOTP(secretBase32: string, timeStepSeconds = 30, time = Date.now()): string {
  const epoch = Math.floor(time / 1000);
  const timeStep = Math.floor(epoch / timeStepSeconds);
  return generateTOTPForStep(secretBase32, timeStep);
}

// -------------------------------------------------------------
// TOTP Replay Protection Store Interface & In-Memory Adapter
// -------------------------------------------------------------
export interface TotpReplayStore {
  isTokenUsed(identifier: string, token: string, timeStep: number): boolean;
  markTokenUsed(identifier: string, token: string, timeStep: number, ttlMs?: number): void;
  reset(): void;
}

class InMemoryTotpReplayStore implements TotpReplayStore {
  private usedTokens = new Map<string, number>();

  private makeKey(identifier: string, token: string, timeStep: number): string {
    return `${identifier.toLowerCase()}:${timeStep}:${token}`;
  }

  isTokenUsed(identifier: string, token: string, timeStep: number): boolean {
    this.prune();
    const key = this.makeKey(identifier, token, timeStep);
    const expiresAt = this.usedTokens.get(key);
    return expiresAt !== undefined && expiresAt > Date.now();
  }

  markTokenUsed(identifier: string, token: string, timeStep: number, ttlMs = 120000): void {
    this.prune();
    const key = this.makeKey(identifier, token, timeStep);
    this.usedTokens.set(key, Date.now() + ttlMs);
  }

  reset(): void {
    this.usedTokens.clear();
  }

  private prune(): void {
    const now = Date.now();
    for (const [k, exp] of this.usedTokens.entries()) {
      if (exp <= now) {
        this.usedTokens.delete(k);
      }
    }
  }
}

export const totpReplayStore: TotpReplayStore = new InMemoryTotpReplayStore();

export interface VerifyTotpResult {
  valid: boolean;
  error?: 'INVALID_CODE' | 'OTP_REPLAY_DETECTED' | 'EXPIRED_CODE';
  message?: string;
  timeStep?: number;
}

// Verify TOTP with +/- 1 time step window (clock skew tolerance) and Replay Protection
export function verifyTOTPWithDetails(
  token: string,
  secretBase32: string,
  identifier?: string,
  time = Date.now()
): VerifyTotpResult {
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token.trim())) {
    return { valid: false, error: 'INVALID_CODE', message: 'Kode OTP harus berupa 6 digit angka.' };
  }

  const stepSeconds = 30;
  const epoch = Math.floor(time / 1000);
  const currentTimeStep = Math.floor(epoch / stepSeconds);
  const cleanToken = token.trim();

  // Test current (0), previous (-1), and next (+1) time windows for skew tolerance
  for (const delta of [0, -1, 1]) {
    const targetStep = currentTimeStep + delta;
    const expected = generateTOTPForStep(secretBase32, targetStep);

    if (expected === cleanToken) {
      if (identifier) {
        if (totpReplayStore.isTokenUsed(identifier, cleanToken, targetStep)) {
          return {
            valid: false,
            error: 'OTP_REPLAY_DETECTED',
            message: 'Kode OTP telah digunakan (Replay Protection aktif). Silakan tunggu siklus 30 detik berikutnya untuk kode baru.',
            timeStep: targetStep,
          };
        }
        totpReplayStore.markTokenUsed(identifier, cleanToken, targetStep);
      }
      return { valid: true, timeStep: targetStep };
    }
  }

  return { valid: false, error: 'INVALID_CODE', message: 'Kode autentikasi 6 digit tidak valid atau telah kedaluwarsa.' };
}

// Backward-compatible verifyTOTP
export function verifyTOTP(token: string, secretBase32: string, identifier?: string, time = Date.now()): boolean {
  return verifyTOTPWithDetails(token, secretBase32, identifier, time).valid;
}

// Compute SHA-256 hash (hex)
export function computeSha256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Compute Merkle Root of an array of transaction hashes
export function computeMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return computeSha256('EMPTY_MERKLE_TREE');
  let layer = hashes.map((h) => (h.startsWith('0x') ? h.slice(2) : h));
  while (layer.length > 1) {
    if (layer.length % 2 !== 0) {
      layer.push(layer[layer.length - 1]);
    }
    const nextLayer: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const combined = computeSha256(layer[i] + layer[i + 1]);
      nextLayer.push(combined);
    }
    layer = nextLayer;
  }
  return '0x' + layer[0];
}

// Digital Signature simulator (produces EVM-like 65-byte 0x... signature)
export function signDocumentHash(hash: string, issuerPrivateKey = SYSTEM_SIGNING_KEY): string {
  const hmac = crypto.createHmac('sha256', issuerPrivateKey);
  hmac.update(`EDUCHAIN_ISSUANCE:${hash}`);
  const r = hmac.digest('hex');
  const s = crypto.createHash('sha256').update(r + issuerPrivateKey).digest('hex');
  const v = '1b'; // 27 in hex
  return `0x${r}${s}${v}`;
}

// Verify Digital Signature
export function verifySignature(hash: string, signature: string, issuerPrivateKey = SYSTEM_SIGNING_KEY): boolean {
  if (!signature || !signature.startsWith('0x')) return false;
  const expected = signDocumentHash(hash, issuerPrivateKey);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Password hashing using PBKDF2 (salt + iterations)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  return `pbkdf2$10000$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];
    const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
  } catch {
    return false;
  }
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  mfaAuthenticated: boolean;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// -------------------------------------------------------------
// RS256 Asymmetric JWT Implementation (Zero Trust RFC 7519)
// -------------------------------------------------------------

// Create Signed RS256 JWT token with RSA Private Key
export function createJwtToken(
  payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
  expiresInSeconds = 3600
): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    iss: 'smk-zero-trust-auth-server',
    aud: 'smk-administrasi-api',
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signatureInput = `${b64Header}.${b64Payload}`;

  // Sign using RSA-SHA256 (RS256)
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(RSA_PRIVATE_KEY, 'base64url');

  return `${signatureInput}.${signature}`;
}

// Verify RS256 JWT token with RSA Public Key
export function verifyJwtToken(token: string): { valid: boolean; payload?: JwtPayload; error?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token missing or invalid type' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed token structure (expected 3 parts)' };
    }

    const [b64Header, b64Payload, signature] = parts;

    // 1. Decode & Verify Header Algorithm (Strictly RS256 only)
    let header: any;
    try {
      header = JSON.parse(Buffer.from(b64Header, 'base64url').toString('utf8'));
    } catch {
      return { valid: false, error: 'Invalid JWT header JSON' };
    }

    if (!header || header.alg !== 'RS256') {
      return { valid: false, error: `Unsupported or rejected algorithm: '${header?.alg}' (Strictly RS256 required)` };
    }

    // 2. Verify Cryptographic Asymmetric Signature using RSA Public Key
    const signatureInput = `${b64Header}.${b64Payload}`;
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signatureInput);
    const isSignatureValid = verifier.verify(RSA_PUBLIC_KEY, signature, 'base64url');

    if (!isSignatureValid) {
      return { valid: false, error: 'Invalid cryptographic signature (tampered token or signature mismatch)' };
    }

    // 3. Decode & Verify Payload Claims
    let payload: JwtPayload;
    try {
      payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    } catch {
      return { valid: false, error: 'Invalid JWT payload JSON' };
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token expired' };
    }

    if (payload.iss !== 'smk-zero-trust-auth-server') {
      return { valid: false, error: `Invalid token issuer: '${payload.iss}' (expected 'smk-zero-trust-auth-server')` };
    }

    if (payload.aud !== 'smk-administrasi-api') {
      return { valid: false, error: `Invalid token audience: '${payload.aud}' (expected 'smk-administrasi-api')` };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: `Token verification exception: ${err.message || 'Unknown error'}` };
  }
}

// -------------------------------------------------------------
// Trusted Device Token (Remember Me / 30-Day MFA Bypass)
// -------------------------------------------------------------

export function createDeviceTrustToken(userId: string, expiresInDays = 30): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 86400;
  const payload = `${userId}:${exp}`;
  const hmac = crypto.createHmac('sha256', SYSTEM_SIGNING_KEY).update(`TRUSTED_DEVICE:${payload}`).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

export function verifyDeviceTrustToken(token: string, expectedUserId: string): boolean {
  try {
    if (!token || typeof token !== 'string') return false;
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 3) return false;
    const [userId, expStr, hmac] = parts;
    if (userId !== expectedUserId) return false;
    const exp = parseInt(expStr, 10);
    if (isNaN(exp) || exp < Math.floor(Date.now() / 1000)) return false;
    const expectedHmac = crypto.createHmac('sha256', SYSTEM_SIGNING_KEY).update(`TRUSTED_DEVICE:${userId}:${exp}`).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}
