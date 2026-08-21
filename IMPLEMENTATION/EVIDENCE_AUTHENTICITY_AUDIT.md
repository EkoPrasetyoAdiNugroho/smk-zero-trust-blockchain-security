# EVIDENCE AUTHENTICITY & SOURCE-OF-TRUTH FORENSIC AUDIT
**Sistem Informasi Akademik SMK Berbasis Zero Trust Architecture & EduChain Consortium**  
**Document Classification:** Source-of-Truth Forensic Audit & Empirical Evidence Verification  
**Audit Execution Date:** 2026-08-18T08:45:00.000Z  
**Canonical Specification Reference:** Canonical Project Specification v5.18  
**Audit Directives:** Zero code changes, strictly objective verification of Real Evidence vs Simulated/Seeded Data vs Hardcoded Claims.

---

## 1. EXECUTIVE SUMMARY

Audit forensik keaslian bukti (*Evidence Authenticity Audit*) ini dilakukan untuk menguji apakah seluruh klaim, metrik kelulusan tes, dan bukti verifikasi pada laporan audit sebelumnya (`FINAL_FORENSIC_AUDIT.md` & `FINAL_REGRESSION_TEST_RESULTS.md`) didukung oleh artefak dan eksekusi empiris nyata atau merupakan hasil simulasi/seeded test harness.

### Ringkasan Temuan Utama:
1. **Kriptografi Nyata (Empirical Cryptography)**:
   - Modul JWT RS256 dan TOTP RFC 6238 mengeksekusi komputasi kriptografis riil (`crypto.generateKeyPairSync`, `crypto.createSign('RSA-SHA256')`, `crypto.createVerify('RSA-SHA256')`, dan HMAC-SHA1).
   - Seluruh pengujian JWT (JWT-01 s/d JWT-07) dan TOTP (TOTP-01 s/d TOTP-05) menghasilkan verifikasi nyata melalui algoritma `crypto.ts`.
2. **Karakteristik Test Harness (`testRunner.ts`)**:
   - Sebagian besar pengujian di `testRunner.ts` adalah **Function-Level / Module-Level Integration Tests**, bukan simulasi jaringan HTTP end-to-end melalui socket jaringan.
   - Variabel database yang diuji adalah struktur data `Map<string, T>` in-memory (`/server/db.ts`), bukan database relasional terpisah (seperti AWS Aurora PostgreSQL).
3. **Status Bukti Dokumen SHA-256**:
   - Hash `a3f789bcde41209384756192837465abc12345def67890123456789abcdef012` merupakan *seeded cryptographic fixture string* yang didaftarkan di ledger blok #1 in-memory, bukan hasil bacaan file biner PDF fisik di disk (`/assets` atau filesystem).
   - Pengujian 1-byte delta (`...013`) menguji perbedaan hash string deterministik pada `verifyCertificate()`.
4. **Status Ledger Blockchain**:
   - `BlockchainEngine` di `/server/blockchain.ts` menghitung Block Hash, TxHash, dan Merkle Root secara dinamis saat runtime dengan `crypto.createHash('sha256')`, namun beroperasi secara lokal dalam memori (*In-Memory Consortium Simulation*), bukan node EVM jaringan eksternal.

---

## 2. TEST HARNESS FORENSIC AUDIT (`/server/testRunner.ts`)

| Test ID | Sifat Eksekusi Aktual | Komputasi / Pemanggilan Fungsi Nyata | Klasifikasi Bukti |
| :--- | :--- | :--- | :---: |
| **TEST-001** | Function-Level RBAC Check | `createJwtToken()` $\rightarrow$ `verifyJwtToken()` $\rightarrow$ role array check | 🟡 **MODULE-LEVEL REAL CRYPTO** |
| **TEST-002** | Input Sanitization & Map Search | `sanitizeInput(maliciousPayload)` $\rightarrow$ `db.students.values().find()` | 🟡 **MODULE-LEVEL EMPIRICAL** |
| **TEST-003** | XSS Sanitizer Execution | `sanitizeInput('<script>...')` $\rightarrow$ entity escape verification | 🟢 **REAL COMPUTATION** |
| **TEST-004** | Object Serialization Filter | Object clone & delete field verification | 🟢 **REAL LOGIC CHECK** |
| **TEST-JWT-01** | Asymmetric RSA-2048 Signing | `createJwtToken()` $\rightarrow$ `verifyJwtToken()` with RSA Public Key | 🟢 **REAL CRYPTO (RS256)** |
| **TEST-JWT-02** | Token Expiration Logic | Generates token with `exp = now - 10s` $\rightarrow$ verify rejection | 🟢 **REAL CRYPTO (RS256)** |
| **TEST-JWT-03** | Tampered Payload Rejection | Modifies base64 payload segment $\rightarrow$ RSA signature verify fails | 🟢 **REAL CRYPTO (RS256)** |
| **TEST-JWT-04** | Bit Mutation Rejection | Mutates 4 characters in RSA signature $\rightarrow$ verification fails | 🟢 **REAL CRYPTO (RS256)** |
| **TEST-JWT-05** | Anti-Algorithm Confusion | Injects `alg: HS256` $\rightarrow$ strict verification guard rejection | 🟢 **REAL CRYPTO (RS256)** |
| **TEST-JWT-06** | Issuer Validation | Injects `iss: rogue-auth-server` $\rightarrow$ verification guard rejection | 🟢 **REAL CRYPTO (RS256)** |
| **TEST-TOTP-01**| RFC 6238 TOTP Generation | `generateTOTP()` with HMAC-SHA1 $\rightarrow$ `verifyTOTPWithDetails()` | 🟢 **REAL CRYPTO (RFC 6238)** |
| **TEST-TOTP-02**| Replay Cache Rejection | Submits same OTP twice to `totpReplayStore` $\rightarrow$ `OTP_REPLAY_DETECTED` | 🟢 **REAL STATEFUL CHECK** |
| **TEST-TOTP-03**| Invalid Digits Rejection | Submits `'999999'` to `verifyTOTPWithDetails()` $\rightarrow$ `INVALID_CODE` | 🟢 **REAL CRYPTO (RFC 6238)** |
| **TEST-TOTP-04**| Clock Skew Window | Computes OTP for timestep $N-1$ $\rightarrow$ accepts within $\pm 30s$ | 🟢 **REAL CRYPTO (RFC 6238)** |
| **TEST-TOTP-05**| Timestep Rotation | Computes OTP for timestep $N+1$ $\rightarrow$ accepts fresh OTP | 🟢 **REAL CRYPTO (RFC 6238)** |
| **TEST-006** | Anti-Duplicate Smart Contract | `blockchain.issueCertificate()` on existing hash $\rightarrow$ REVERT | 🟡 **IN-MEMORY SMART CONTRACT** |
| **TEST-007** | Grade Audit & On-Chain Anchor| `blockchain.recordGradeChangeOnChain()` $\rightarrow$ computes txHash on Block | 🟡 **IN-MEMORY LEDGER REAL SHA256**|
| **TEST-018** | DUDI Digital Signature | `verifySignature(dudiCertHash, sig)` with HMAC/RSA verification | 🟢 **REAL CRYPTO VERIFY** |
| **TEST-020A** | Public Document Verification | `blockchain.verifyCertificate(authenticHash)` $\rightarrow$ lookup & record match | 🟡 **SEEDED FIXTURE LOOKUP** |
| **TEST-020B** | Tampering Detection | `blockchain.verifyCertificate(tamperedHash)` $\rightarrow$ returns INVALID | 🟡 **FIXTURE DELTA LOOKUP** |

---

## 3. SHA-256 EVIDENCE FORENSIC AUDIT (TEST A, B, C)

Audit forensik filesystem menemukan fakta empiris berikut:
- **Filesystem Audit**: Tidak ada berkas PDF fisik `Ijazah_SMK_Budi_Santoso_2026.pdf` yang disimpan secara fisik di direktori server.
- **Mekanisme Penyimpanan**: Hash dokumen `a3f789bcde41209384756192837465abc12345def67890123456789abcdef012` didaftarkan secara terprogram (*seeded cryptographic ledger record*) di `/server/blockchain.ts` baris 36–58 dan `/server/db.ts` baris 61–84.

### Rincian Evaluasi Hash:
1. **Dokumen Asli (TEST A)**:
   - *Seeded Hash Record*: `a3f789bcde41209384756192837465abc12345def67890123456789abcdef012`
   - *Status Runtime*: Terdaftar di Block #1 dengan TxHash `0x8f4d92a1c7b3e5f609123456789abcdef0123456789abcdef0123456789abcde`.
   - *Klasifikasi Bukti*: **SEEDED CRYPTOGRAPHIC RECORD IN LEDGER**.
2. **Dokumen Dimodifikasi 1 Karakter (TEST B)**:
   - *Queried Hash*: `a3f789bcde41209384756192837465abc12345def67890123456789abcdef013`
   - *Hashes Identical*: `FALSE` (Perbedaan pada karakter terakhir: `2` vs `3`).
   - *Respon Sistem*: `INVALID / FALSIFIED DOCUMENT`
   - *Klasifikasi Bukti*: **DETERMINISTIC CRYPTOGRAPHIC FIXTURE DELTA**.
3. **Dokumen Tidak Terdaftar (TEST C)**:
   - *Queried Hash*: `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`
   - *Respon Sistem*: `INVALID / FALSIFIED DOCUMENT (Hash Tidak Ditemukan)`.

---

## 4. BLOCKCHAIN EVIDENCE FORENSIC AUDIT

Audit terhadap `/server/blockchain.ts` membuktikan:
- **Block #0 (Genesis)**: Dibuat secara deterministik saat startup dengan previousHash `0x000...`.
- **Block #1**: Ditambang saat inisialisasi dengan memproses 2 transaksi sertifikat awal (`tx1Hash` dan `tx2Hash`).
- **Komputasi Kriptografis Nyata**:
  - `computeSha256()` dipanggil secara dinamis untuk menghitung `blockHash = 0x + sha256(prevBlock.blockHash + txHash + now)`.
  - `computeMerkleRoot()` menghitung akar Merkle pohon biner secara rekursif dari seluruh daftar `transactionHash`.
  - `issueCertificate()` memverifikasi duplikasi dan aturan wewenang penerbit (*anti-duplicate & role boundary guards*).
- **Klasifikasi Forensik**: **IN-MEMORY SIMULATED CONSORTIUM BLOCKCHAIN WITH REAL CRYPTOGRAPHIC HASHING**. (Bukan jaringan node EVM terdistribusi eksternal).

---

## 5. DATABASE EVIDENCE FORENSIC AUDIT

- **Database Engine Aktual**: `InMemoryDatabase` di `/server/db.ts` yang mengelola JavaScript `Map` (`users`, `students`, `teachers`, `grades`, `documents`, `blockchainRecords`, `gradeAudits`, `auditLogs`).
- **Karakteristik Operasi**: Seluruh operasi CRUD (Insert, Read, Update, Filter) dieksekusi secara in-memory.
- **Klasifikasi Forensik**: **IN-MEMORY PROTOTYPE EVIDENCE**. (Bukan instans PostgreSQL / AWS Aurora live).

---

## 6. API EVIDENCE FORENSIC AUDIT (TEST LEVEL CLASSIFICATION)

- **Express Server Runtime (`/server.ts`)**: Mendefinisikan rute HTTP Express aktif pada port 3000.
- **Test Runner (`/server/testRunner.ts`)**:
  - Sebagian besar suite (`TEST-001` s/d `TEST-020`) mengeksekusi logika fungsi, helper kriptografi, dan manipulasi objek secara langsung (*Module/Function-Level Integration Tests*).
  - Test runner dipanggil melalui endpoint HTTP `POST /api/test/run-all`.
- **Klasifikasi Forensik**: **FUNCTION & MODULE INTEGRATION TEST EVIDENCE**.

---

## 7. RBAC & ANTI-IDOR EVIDENCE

1. **Uji Token Role Siswa**:
   - `createJwtToken({ sub: 'usr-siswa-01', role: 'SISWA' })` menghasilkan token asimetris RS256 riil.
   - Evaluasi hak akses memverifikasi bahwa `SISWA` tidak termasuk dalam daftar yang diizinkan untuk update nilai (`['GURU', 'TU', 'KEPALA_SEKOLAH']`).
   - Kode mengembalikan status simulasi `HTTP 403 Forbidden`.
2. **Anti-IDOR Dokumen & Profil Siswa**:
   - Di `/server.ts` rute `GET /api/documents/:id` dan `GET /api/v1/students/:id`, middleware `requireStudentOwnership` secara aktif membandingkan `req.user.sub` dengan pemilik record.
- **Klasifikasi Forensik**: **EMPIRICAL LOGIC & PERMISSION MATRIX VERIFICATION**.

---

## 8. JWT EVIDENCE AUTHENTICITY

Audit terhadap `/server/crypto.ts` membuktikan bahwa seluruh pengujian JWT menggunakan library kriptografi bawaan Node.js (`crypto`):
- `createJwtToken`: Mengeksekusi `crypto.createSign('RSA-SHA256')` menggunakan kunci privat RSA 2048-bit.
- `verifyJwtToken`: Mengeksekusi `crypto.createVerify('RSA-SHA256')` menggunakan kunci publik RSA 2048-bit.
- Pengujian penolakan tampering, expired, non-RS256 algorithm, wrong issuer, dan wrong audience dieksekusi melalui pemanggilan fungsi verifikasi riil.
- **Klasifikasi Forensik**: **100% REAL CRYPTOGRAPHIC EVIDENCE**.

---

## 9. TOTP EVIDENCE AUTHENTICITY

Audit terhadap algoritma TOTP di `/server/crypto.ts`:
- `generateTOTP` & `verifyTOTPWithDetails`: Menghitung counter waktu `Math.floor(Date.now() / 30000)` dan komputasi HMAC-SHA1 riil dari Base32 decoded secret.
- `totpReplayStore`: Menyimpan kunci `${userId}:${timeStep}:${token}` pada `Map`.
- Percobaan pengiriman ulang kode yang sama pada timestep yang sama menghasilkan penolakan riil `OTP_REPLAY_DETECTED`.
- **Klasifikasi Forensik**: **100% REAL CRYPTOGRAPHIC & STATEFUL EVIDENCE**.

---

## 10. REQUIREMENTS TRACEABILITY MATRIX (RTM) RE-EVALUATION

| Requirement ID | Deskripsi Kebutuhan | Status Implementasi | Status Bukti Forensik |
| :--- | :--- | :---: | :---: |
| **FR-001 / SR-001** | Multi-Factor Authentication (TOTP RFC 6238) | `IMPLEMENTED` | 🟢 **REAL CRYPTO** |
| **FR-002 / SR-002** | Role-Based Access Control (RBAC 6 Roles) | `IMPLEMENTED` | 🟢 **REAL LOGIC CHECK** |
| **FR-003 / SR-004** | Asymmetric JWT Authentication (RS256) | `IMPLEMENTED` | 🟢 **REAL CRYPTO** |
| **FR-004 / BR-006** | Grade Management & On-Chain Audit Trail | `IMPLEMENTED` | 🟡 **IN-MEMORY LEDGER REAL SHA256** |
| **FR-005 / BR-004** | DUDI PKL Certificate Digital Signing | `IMPLEMENTED` | 🟢 **REAL CRYPTO VERIFY** |
| **FR-008 / BR-008** | Public SHA-256 Document Verification | `IMPLEMENTED` | 🟡 **SEEDED LEDGER FIXTURE** |
| **TR-002** | SQL Injection Defense & Parameterization | `IMPLEMENTED` | 🟡 **SANITIZER REAL LOGIC** |
| **TR-003** | Stored XSS Sanitization | `IMPLEMENTED` | 🟢 **REAL COMPUTATION** |
| **TR-004 / SR-009** | Secret & Key Leakage Prevention | `IMPLEMENTED` | 🟢 **REAL LOGIC CHECK** |
| **BR-001 / BR-003** | Smart Contract Anti-Duplicate Guard | `IMPLEMENTED` | 🟡 **IN-MEMORY SMART CONTRACT** |

---

## 11. API CONTRACT RECONCILIATION

| No | Canonical Path (v5.18 Specs) | Canonical Method | Actual Path di `server.ts` | Actual Method | Status Keselarasan |
| :---: | :--- | :---: | :--- | :---: | :---: |
| 1 | `/api/health` | `GET` | `/api/health` | `GET` | 🟢 MATCH |
| 2 | `/api/auth/login` | `POST` | `/api/auth/login` | `POST` | 🟢 MATCH |
| 3 | `/api/auth/mfa/verify` / `/api/auth/verify-mfa` | `POST` | `/api/auth/mfa/verify` | `POST` | 🟢 MATCH |
| 4 | `/api/auth/logout` | `POST` | `/api/auth/logout` | `POST` | 🟢 MATCH |
| 5 | `/api/auth/me` | `GET` | `/api/auth/me` | `GET` | 🟢 MATCH |
| 6 | `/api/v1/students` | `GET` | `/api/v1/students` | `GET` | 🟢 MATCH |
| 7 | `/api/v1/students/:id` | `GET` | `/api/v1/students/:id` | `GET` | 🟢 MATCH |
| 8 | `/api/v1/teachers` | `GET` | `/api/v1/teachers` | `GET` | 🟢 MATCH |
| 9 | `/api/v1/teachers/:id` | `GET` | `/api/v1/teachers/:id` | `GET` | 🟢 MATCH |
| 10 | `/api/v1/grades` | `GET` | `/api/v1/grades` | `GET` | 🟢 MATCH |
| 11 | `/api/v1/grades` | `POST` | `/api/v1/grades` | `POST` | 🟢 MATCH |
| 12 | `/api/v1/grades/update` | `POST` | `/api/v1/grades/update` | `POST` | 🟢 MATCH |
| 13 | `/api/documents/upload` | `POST` | `/api/documents/upload` | `POST` | 🟢 MATCH |
| 14 | `/api/documents/:id` | `GET` | `/api/documents/:id` | `GET` | 🟢 MATCH |
| 15 | `/api/documents` | `GET` | `/api/documents` | `GET` | 🟢 MATCH |
| 16 | `/api/blockchain/issue` | `POST` | `/api/blockchain/issue` | `POST` | 🟢 MATCH |
| 17 | `/api/blockchain/verify/:hash` | `GET` | `/api/blockchain/verify/:hash` | `GET` | 🟢 MATCH |
| 18 | `/api/blockchain/blocks` | `GET` | `/api/blockchain/blocks` | `GET` | 🟢 MATCH |
| 19 | `/api/audit/logs` | `GET` | `/api/audit/logs` | `GET` | 🟢 MATCH |
| 20 | `/api/test/run-all` (Utility) | `POST` | `/api/test/run-all` | `POST` | 🔵 UTILITY HARNESS |

---

## 12. DATABASE SCHEMA RECONCILIATION

### Perbandingan Sumber Kebenaran (Source-of-Truth Comparison):
1. **Canonical Spesifikasi Awal (`05_ARCHITECTURE_SPEC.md` / `06_DESIGN_SPECIFICATIONS.md`)**:
   - Skema relasional konseptual untuk database PostgreSQL:
     - `users`, `students`, `teachers`, `grades`, `documents`, `blockchain_records`, `grade_audit`, `audit_logs`.
2. **Implementasi In-Memory Aktual (`/server/db.ts`)**:
   - Struktur data in-memory diorganisir sebagai instance `InMemoryDatabase`:
     - `users` (`Map<string, User>`)
     - `students` (`Map<string, Student>`)
     - `teachers` (`Map<string, Teacher>`)
     - `grades` (`Map<string, Grade>`)
     - `documents` (`Map<string, DocumentRecord>`)
     - `blockchainRecords` (`Map<string, BlockchainRecord>`)
     - `gradeAudits` (`GradeAudit[]`)
     - `auditLogs` (`AuditLog[]`)
3. **Kesimpulan Rekonsiliasi**:
   - Tidak ada kontradiksi esensial. Penamaan `gradeAudits` dan `auditLogs` pada `db.ts` adalah representasi properti JavaScript CamelCase dari tabel relasional canonical `grade_audit` dan `audit_logs`.
   - Modul `lockouts` di `/server/security.ts` dikelola sebagai map state sementara in-memory untuk brute-force throttling.

---

## 13. EVIDENCE REGISTER AUDIT (E-001 s/d E-021)

| Evidence ID | Deskripsi Bukti | Artefak Kode / Runtime | Keberadaan Fisik | Status Otentisitas |
| :--- | :--- | :--- | :---: | :---: |
| **E-001** | PBKDF2 Password Hashing | `/server/crypto.ts` (`hashPassword`) | ADA | 🟢 REAL CRYPTO |
| **E-002** | TOTP RFC 6238 Generation | `/server/crypto.ts` (`generateTOTP`) | ADA | 🟢 REAL CRYPTO |
| **E-003** | Merkle Tree Root Computation| `/server/crypto.ts` (`computeMerkleRoot`) | ADA | 🟢 REAL CRYPTO |
| **E-007** | On-Chain Grade Audit Anchor | `/server/blockchain.ts` (`recordGradeChangeOnChain`)| ADA | 🟡 IN-MEMORY REAL SHA256 |
| **E-009** | RBAC Role Access Enforcement| `/server/security.ts` (`requireRole`) | ADA | 🟢 REAL LOGIC |
| **E-010** | SQLi Input Parameterization | `/server/security.ts` (`sanitizeInput`)| ADA | 🟢 REAL LOGIC |
| **E-011** | XSS HTML Entity Encoding | `/server/security.ts` (`sanitizeInput`)| ADA | 🟢 REAL LOGIC |
| **E-012** | Secret Filtering in Output | `/server.ts` (`safeUser` payload filtering) | ADA | 🟢 REAL LOGIC |
| **E-013** | Anti-Duplicate Smart Contract| `/server/blockchain.ts` (`issueCertificate` guard) | ADA | 🟡 IN-MEMORY REAL LOGIC |
| **E-014** | Public Verification Matching | `/server/blockchain.ts` (`verifyCertificate`)| ADA | 🟡 SEEDED FIXTURE MATCH |
| **E-018** | DUDI Digital Signature Verify | `/server/crypto.ts` (`verifySignature`) | ADA | 🟢 REAL CRYPTO |
| **E-021** | 1-Byte Tamper Detection Hash | `/server/blockchain.ts` (`recordsByHash.get`)| ADA | 🟡 DETERMINISTIC DELTA |
| **E-JWT-01**| RS256 RSA-2048 Asymmetric Sign| `/server/crypto.ts` (`createJwtToken`)| ADA | 🟢 REAL CRYPTO |
| **E-TOTP-02**| TOTP Replay Cache Denial | `/server/crypto.ts` (`InMemoryTotpReplayStore`)| ADA | 🟢 REAL STATEFUL CHECK |

---

## 14. AUDIT KLAIM VS BUKTI PENDUKUNG AKTUAL

| Klaim Terdahulu | Bukti Pendukung Aktual | Evaluasi Forensik |
| :--- | :--- | :---: |
| **"100% Tests Passed"** | 20/20 test suites di `testRunner.ts` mengeksekusi logika dan mengembalikan status PASSED. | 🟢 **SUPPORTED** (Pada scope test runner) |
| **"Real SHA-256"** | Fungsi `computeSha256` mengeksekusi `crypto.createHash('sha256')` Node.js asli. Namun data ijazah Budi Santoso diuji via seeded string hash, bukan pembacaan file PDF disk. | 🟡 **PARTIALLY SUPPORTED** (Algoritma asli, input data seeded fixture) |
| **"Blockchain Verified"** | Struktur blok, Merkle root, dan anti-duplicate check berjalan secara nyata di kelas `BlockchainEngine` in-memory. | 🟡 **SUPPORTED AS IN-MEMORY CONSORTIUM SIMULATION** (Bukan jaringan EVM publik/eksternal) |
| **"Production-Ready / Cloud-Ready"**| Arsitektur telah dirancang sesuai standar Zero Trust dan KMS, namun infrastruktur cloud AWS KMS HSM, Aurora PostgreSQL, dan AWS S3 Object Lock belum live-tested. | 🟡 **DESIGNED FOR CLOUD (PROTOTYPE STATUS)** |

---

## 15. CRITICAL FINDINGS

1. **Test Runner Execution Scope**:
   - `testRunner.ts` menjalankan integrasi level fungsi/modul internal. Pengujian ini valid secara logika bisnis dan kriptografi, namun bukan pengujian beban jaringan HTTP end-to-end melalui network interface eksternal.
2. **Seeded Document Hash vs Binary Disk File**:
   - Verifikasi keaslian dokumen bekerja secara akurat dengan mencocokkan string hash SHA-256 64-karakter ke dalam database/ledger in-memory. Tidak ada file PDF biner statis di disk yang dibaca secara I/O selama pengujian otomatis.

---

## 16. FINAL EVIDENCE VERDICT

🟡 **PARTIALLY VERIFIED (HIGH-FIDELITY PROTOTYPE WITH REAL CRYPTOGRAPHY)**

**Justifikasi Penetapan Verdict:**
1. **Komponen yang Terbukti Nyata (Empirically Real)**:
   - Tanda tangan digital asimetris RSA 2048-bit (`RS256`), mitigasi *algorithm confusion*, verifikasi *issuer/audience*, algoritma OTP RFC 6238, *replay protection cache*, mitigasi XSS/SQLi, serta komputasi Merkle root dan SHA-256 adalah **100% komputasi riil menggunakan modul kriptografi Node.js asli**.
2. **Komponen Berbasis Simulasi / In-Memory Fixture**:
   - Ledger konsorsium blockchain dan database tersimpan dalam memori proses (`Map<string, T>`), dan berkas dokumen diuji menggunakan *seeded cryptographic hash fixtures*.
   - Tidak ada klaim berlebih (*no false confidence*); batasan prototype dinyatakan secara transparan dan tepat sasaran.
