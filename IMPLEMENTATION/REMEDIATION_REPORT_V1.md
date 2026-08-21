# REMEDIATION REPORT (V1)
**Sistem Informasi Akademik SMK Berbasis Zero Trust Architecture & EduChain Consortium**  
**Remediation Date:** 2026-08-18  
**Scope:** Remediation of Forensic V2 Verified Findings (JWT RS256 & TOTP Replay Protection)  
**Status:** Remediated & Regression Verified (100% Tests Passed)

---

## 1. EXECUTIVE SUMMARY OF FINDINGS & REMEDIATION

| Finding ID | Finding Description | Original Status | Remediated Status | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **FINDING-01** | JWT Algorithm HS256 vs Canonical RS256 | Symmetrical HMAC-SHA256 (`HS256`) | Asymmetric 2048-bit RSA Keypair (`RS256`) | ✅ **VERIFIED & PASSED** |
| **FINDING-02** | TOTP Replay Protection in 30s Window | Token could be reused within same 30s step | Single-Use Replay Protection with TTL Cache | ✅ **VERIFIED & PASSED** |

---

## 2. DETAILED REMEDIATION BREAKDOWN

### A. FINDING-01: JWT RS256 ASYMMETRIC MIGRATION
- **Finding:** Implementasi awal menggunakan algoritma simetris `HS256` dengan kunci bersama (`JWT_SECRET`), sedangkan Canonical Architecture v5.18 mensyaratkan token bertanda tangan asimetris `RS256` (RSA-SHA256).
- **Root Cause:** Helper kriptografi JWT sebelumnya mengandalkan `crypto.createHmac('sha256', JWT_SECRET)` tanpa pemisahan kunci privat penerbit (*issuance signing*) dan kunci publik pemverifikasi (*verification*).
- **Files Changed:**
  - `/server/crypto.ts`
  - `/server.ts`
  - `/server/testRunner.ts`
- **Changes Made:**
  1. **Asymmetric Key Generation**: Menghasilkan keypair RSA 2048-bit (`RSA_PRIVATE_KEY` format PKCS#8 dan `RSA_PUBLIC_KEY` format SPKI PEM) via `crypto.generateKeyPairSync`.
  2. **RS256 Token Creation**: `createJwtToken` sekarang menggunakan `crypto.createSign('RSA-SHA256')` dengan RSA Private Key dan header `{ alg: 'RS256', typ: 'JWT' }`.
  3. **Strict RS256 Token Verification**: `verifyJwtToken` memverifikasi tanda tangan menggunakan `crypto.createVerify('RSA-SHA256')` dengan RSA Public Key, menolak keras algoritma selain RS256 (mencegah *algorithm confusion attacks* seperti `HS256` atau `none`), serta memvalidasi `exp`, `iss` (`smk-zero-trust-auth-server`), dan `aud` (`smk-administrasi-api`).
  4. **KMS-Ready Abstraction**: Private key tidak pernah diekspor atau dikirim ke frontend client; public key dapat diakses via `getJwtPublicKey()`.
- **Before vs After:**
  - *Before*: `Header: {"alg":"HS256","typ":"JWT"}` $\rightarrow$ Signed with symmetric secret string.
  - *After*: `Header: {"alg":"RS256","typ":"JWT"}` $\rightarrow$ Signed with RSA-2048 Private Key; verified with RSA-2048 Public Key.

---

### B. FINDING-02: TOTP REPLAY PROTECTION
- **Finding:** Kode OTP 6-digit (RFC 6238) sebelumnya dapat digunakan berulang kali dalam jendela 30 detik yang sama jika disubmit berkali-kali sebelum detik ke-30 berakhir.
- **Root Cause:** Fungsi `verifyTOTP` hanya membandingkan kecocokan kode terhadap delta jendela waktu tanpa menyimpan status penggunaan token (*single-use token blacklist/used nonce cache*).
- **Files Changed:**
  - `/server/crypto.ts`
  - `/server.ts`
  - `/server/testRunner.ts`
- **Changes Made:**
  1. **TotpReplayStore Interface & Implementation**: Membuat abstraksi `TotpReplayStore` dan implementasi in-memory `InMemoryTotpReplayStore` yang melacak key `${userId}:${timeStep}:${token}` dengan TTL 120 detik dan pembersihan otomatis (*auto-prune*).
  2. **Detailed Verification Flow (`verifyTOTPWithDetails`)**: Saat OTP valid untuk timestep tertentu, sistem memeriksa apakah token sudah pernah digunakan untuk identitas pengguna tersebut. Jika sudah, sistem menolak dengan kode error `OTP_REPLAY_DETECTED` (*Replay Protection aktif*). Jika belum, token ditandai sebagai *used*.
  3. **Audit Log & Replay Alert**: Endpoint `/api/auth/mfa/verify` di `server.ts` mencatat event `AUTHZ_DENIED` dengan keparahan `CRITICAL` jika mendeteksi percobaan replay OTP.
- **Before vs After:**
  - *Before*: OTP valid dapat disubmit 5x dalam detik ke 0-29 dan semuanya menghasilkan token login baru.
  - *After*: OTP valid hanya dapat disubmit 1x. Percobaan kedua pada jendela waktu yang sama langsung ditolak dengan `HTTP 400 OTP_REPLAY_DETECTED`.

---

## 3. TESTS ADDED & REGRESSION TEST MATRIX

Semua pengujian dijalankan melalui automated harness `/server/testRunner.ts`:

| Test ID | Test Category | Test Name & Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TEST-001** | RBAC | Siswa Dilarang Update Nilai | HTTP 403 Forbidden | `HTTP 403 Forbidden` | ✅ **PASSED** |
| **TEST-002** | SECURITY | SQLi Resistance & Parameterization | 0 records / sanitized | Sanitized, 0 leak | ✅ **PASSED** |
| **TEST-003** | SECURITY | Stored XSS Defense | HTML entities escaped | Sanitized to entities | ✅ **PASSED** |
| **TEST-004** | SECURITY | Zero Trust Secret Leakage Check | Secrets excluded from payload | No secret fields exposed | ✅ **PASSED** |
| **TEST-JWT-01** | SECURITY | RS256 Asymmetric Token Verification | `alg=RS256`, valid=true | `Algorithm: RS256, Valid: true` | ✅ **PASSED** |
| **TEST-JWT-02** | SECURITY | RS256 Token Expiration Rejection | Expired token rejected | `Rejected: Token expired` | ✅ **PASSED** |
| **TEST-JWT-03** | SECURITY | RS256 Payload Tampering (Privilege Escalation) | Tampered payload rejected | `Rejected: Invalid cryptographic signature` | ✅ **PASSED** |
| **TEST-JWT-04** | SECURITY | RS256 Signature Mutation Detection | Modified signature rejected | `Rejected: Invalid cryptographic signature` | ✅ **PASSED** |
| **TEST-JWT-05** | SECURITY | Anti-Algorithm Confusion (HS256/none denial) | Non-RS256 rejected | `Rejected: Unsupported or rejected algorithm: 'HS256'` | ✅ **PASSED** |
| **TEST-JWT-06** | SECURITY | JWT Issuer Validation (`iss`) | Wrong issuer rejected | `Rejected: Invalid token issuer` | ✅ **PASSED** |
| **TEST-TOTP-01**| SECURITY | RFC 6238 Valid TOTP First Use | OTP accepted, timestep logged | `Valid: true` | ✅ **PASSED** |
| **TEST-TOTP-02**| SECURITY | TOTP Single-Use Replay Protection | Same OTP reused in same step $\rightarrow$ Denied | `Rejected: OTP_REPLAY_DETECTED` | ✅ **PASSED** |
| **TEST-TOTP-03**| SECURITY | Invalid 6-digit OTP Rejection | Wrong digits rejected | `Rejected: INVALID_CODE` | ✅ **PASSED** |
| **TEST-TOTP-04**| SECURITY | TOTP Clock Skew Tolerance ($\pm 30s$) | Code within skew accepted | `Valid: true (Step Offset: -30s)` | ✅ **PASSED** |
| **TEST-TOTP-05**| SECURITY | TOTP Timestep Rotation & Fresh Code Acceptance | Code on next step accepted | `Valid: true (Step Rotated)` | ✅ **PASSED** |
| **TEST-006** | BLOCKCHAIN | Smart Contract Anti-Duplicate Guard | Revert duplicate minting | `Revert: Anti-Duplicate Guard` | ✅ **PASSED** |
| **TEST-007** | INTEGRITY | Grade Audit Trail & On-Chain Anchor | Audit record + txHash emitted | `TxHash generated on Block #1` | ✅ **PASSED** |
| **TEST-018** | BLOCKCHAIN | DUDI PKL Certificate Digital Signature | Signature verified with DUDI role | `Signature Verified (Role: DUDI)` | ✅ **PASSED** |
| **TEST-020A** | INTEGRITY | Public Document Verification (Authentic Hash) | Status VALID with metadata | `Status: VALID` | ✅ **PASSED** |
| **TEST-020B** | SECURITY | Document Tampering Detection (1-char delta) | Status INVALID / FALSIFIED | `Status: INVALID / FALSIFIED DOCUMENT` | ✅ **PASSED** |

---

## 4. REMAINING LIMITATIONS & ARCHITECTURAL CLARIFICATIONS

1. **Local RSA Keypair vs Cloud KMS**:
   - Remediasi ini mengimplementasikan algoritma asimetris `RS256` dengan kunci RSA 2048-bit secara mandiri (*self-contained in-memory keypair*).
   - Pada deployment skala enterprise di AWS, modul ini dirancang untuk disambungkan ke *AWS KMS Asymmetric Key Management (Sign / Verify API)* tanpa mengubah format payload JWT atau kontrak API.
2. **In-Memory Replay Cache vs Distributed Redis**:
   - Replay protection saat ini menggunakan adapter `InMemoryTotpReplayStore` yang cocok untuk single-instance server runtime.
   - Untuk lingkungan multi-instance / cluster container di masa depan, antarmuka `TotpReplayStore` dapat dihubungkan ke Redis / ElastiCache.
3. **Simulated Blockchain Prototype**:
   - Modul ledger blockchain tetap beroperasi sebagai simulasi konsorsium in-memory berbasis pohon Merkle, tanda tangan kriptografis, dan smart contract guard.
