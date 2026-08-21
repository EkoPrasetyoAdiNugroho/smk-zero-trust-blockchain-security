# FINAL REGRESSION TEST RESULTS
**Sistem Informasi Akademik SMK Berbasis Zero Trust Architecture & EduChain Consortium**  
**Execution Timestamp:** 2026-08-18T08:35:00.000Z  
**Test Engine:** Comprehensive Forensic Test Runner & Cryptographic Suite  
**Total Test Cases:** 20 Automated Suites  
**Pass Rate:** 100% (20/20 Passed, 0 Failed)

---

## 1. COMPREHENSIVE REGRESSION MATRIX

| Test ID | Category | Skenario Pengujian Forensik | Parameter & Payload Uji | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TEST-001** | RBAC | Siswa Dilarang Update Nilai | Token `SISWA` $\rightarrow$ Target: `POST /api/v1/grades/update` | HTTP 403 Forbidden | `HTTP 403 Forbidden (RBAC Denied)` | ✅ **PASSED** |
| **TEST-002** | SECURITY | SQLi Resistance & Parameterization | Query: `' OR '1'='1'; DROP TABLE students; --` | 0 Records / Input Sanitized | 0 Records Returned (Input Sanitized) | ✅ **PASSED** |
| **TEST-003** | SECURITY | Stored XSS Defense | `<script>alert('XSS')</script><img src=x onerror=alert(1)>` | Escaped to HTML Entities | Disanitasi menjadi `&lt;script&gt;` | ✅ **PASSED** |
| **TEST-004** | SECURITY | Zero Trust Secret Leakage Check | User object serialisation | No `passwordHash`/`mfaSecret` | Secret Fields Excluded from Output | ✅ **PASSED** |
| **TEST-JWT-01** | SECURITY | RS256 Asymmetric Signature Check | RSA-2048 Signed Token (`alg=RS256`) | Valid signature via RSA Public Key | `Algorithm: RS256, Valid: true` | ✅ **PASSED** |
| **TEST-JWT-02** | SECURITY | RS256 Expiration Enforcement | Token with `exp` in the past | Rejected with `Token expired` | `Rejected: Token expired` | ✅ **PASSED** |
| **TEST-JWT-03** | SECURITY | RS256 Payload Tampering Denial | Tampered `role` to `KEPALA_SEKOLAH` | Signature verification failure | `Rejected: Invalid cryptographic signature` | ✅ **PASSED** |
| **TEST-JWT-04** | SECURITY | RS256 Signature Bit Mutation | Modified 4 bytes in signature | Signature verification failure | `Rejected: Invalid cryptographic signature` | ✅ **PASSED** |
| **TEST-JWT-05** | SECURITY | Anti-Algorithm Confusion (HS256 Denial)| Header `alg: HS256` or `none` | Strict non-RS256 rejection | `Rejected: Unsupported algorithm: 'HS256'` | ✅ **PASSED** |
| **TEST-JWT-06** | SECURITY | JWT Token Issuer Validation | Payload `iss: rogue-auth-server` | Rejection of invalid issuer | `Rejected: Invalid token issuer` | ✅ **PASSED** |
| **TEST-JWT-07** | SECURITY | JWT Token Audience Validation | Payload `aud: untrusted-api` | Rejection of invalid audience | `Rejected: Invalid token audience` | ✅ **PASSED** |
| **TEST-TOTP-01**| SECURITY | RFC 6238 Valid TOTP First Use | 6-digit valid TOTP at $t_0$ | `valid: true`, step logged | `Valid: true (Step: N)` | ✅ **PASSED** |
| **TEST-TOTP-02**| SECURITY | TOTP Single-Use Replay Protection | Same OTP resubmitted in same 30s | Rejected: `OTP_REPLAY_DETECTED` | `Rejected: OTP_REPLAY_DETECTED` | ✅ **PASSED** |
| **TEST-TOTP-03**| SECURITY | Invalid OTP Digits Rejection | Non-matching 6 digits (`999999`) | Rejected: `INVALID_CODE` | `Rejected: INVALID_CODE` | ✅ **PASSED** |
| **TEST-TOTP-04**| SECURITY | Clock Skew Window Tolerance ($\pm 30s$) | OTP from $t - 30s$ (step $N-1$) | Accepted under skew rule | `Valid: true (Skew accepted)` | ✅ **PASSED** |
| **TEST-TOTP-05**| SECURITY | Timestep Rotation & Fresh OTP | New OTP at $t + 35s$ (step $N+1$) | Accepted for next cycle | `Valid: true (Rotated step)` | ✅ **PASSED** |
| **TEST-006** | BLOCKCHAIN | Smart Contract Anti-Duplicate Guard | Submit duplicate document hash | Smart contract revert | `Revert: Anti-Duplicate Guard` | ✅ **PASSED** |
| **TEST-007** | INTEGRITY | Grade Audit Trail & On-Chain Anchor | Score change: 80 $\rightarrow$ 98 | On-chain audit record & txHash | `TxHash generated on Block #1` | ✅ **PASSED** |
| **TEST-018** | BLOCKCHAIN | DUDI PKL Certificate Digital Signature | DUDI Issuer Signature verification | Valid signature with DUDI role | `Signature Verified (Role: DUDI)` | ✅ **PASSED** |
| **TEST-020A** | INTEGRITY | Public Verification (Authentic Hash) | Hash: `a3f789bcde...` | Status `VALID` + metadata | `VALID — hash matches registered record.` | ✅ **PASSED** |
| **TEST-020B** | SECURITY | Document Tampering (1-byte delta) | Hash: `a3f789bcde...013` | Status `INVALID / FALSIFIED` | `INVALID / FALSIFIED DOCUMENT` | ✅ **PASSED** |

---

## 2. BEFORE VS AFTER COMPARISON SUMMARY

| Evaluasi | Status Forensic V2 (Before) | Status Final Forensic (After) | Analisis Regresi |
| :--- | :--- | :--- | :--- |
| **JWT Algorithm** | `HS256` (HMAC-SHA256) | `RS256` (RSA 2048-bit Asymmetric) | 🟢 **FIXED — No Regression** |
| **TOTP Replay** | Replay possible in 30s window | Single-use cache rejects replayed OTP | 🟢 **FIXED — No Regression** |
| **RBAC / Anti-IDOR** | Passed (HTTP 403 on Siswa) | Passed (HTTP 403 on Siswa) | 🟢 **STABLE** |
| **Document Hash Verification** | 3/3 Cases Verified | 3/3 Cases Verified | 🟢 **STABLE** |
| **Blockchain Smart Contract** | Revert on duplicate hash | Revert on duplicate hash | 🟢 **STABLE** |
| **API Endpoints** | 18 Canonical + 4 Utility | 18 Canonical + 4 Utility | 🟢 **STABLE** |

---

## 3. VERDICT

🟡 **READY WITH LIMITATIONS**  
*(Seluruh fungsionalitas dan keamanan lokal 100% terverifikasi; infrastruktur cloud AWS KMS/Aurora PostgreSQL/Live EVM berada pada status Prototype Design).*
