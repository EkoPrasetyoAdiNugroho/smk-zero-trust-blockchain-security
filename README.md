# 🛡️ SMK Academic Information System (SIA)
### Zero Trust Cloud Security Architecture & EduChain Consortium Blockchain

[![Docker](https://img.shields.io/badge/Docker-Multi--Stage%20Build-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22%20LTS%20Alpine-green?logo=node.js)](https://nodejs.org/)
[![Zero Trust](https://img.shields.io/badge/Security-NIST%20SP%20800--207%20Zero%20Trust-red)](https://csrc.nist.gov/publications/detail/sp/800-207/final)
[![Blockchain](https://img.shields.io/badge/Consortium-EduChain%20QBFT%20PoA-purple)](https://ethereum.org/)
[![Cryptography](https://img.shields.io/badge/Crypto-RS256%20%7C%20SHA--256%20%7C%20RFC%206238-orange)](https://datatracker.ietf.org/doc/html/rfc6238)
[![Language](https://img.shields.io/badge/Languages-Indonesian%20%7C%20English-blueviolet)](#-bilingual-support-id--en)

---

## 🌐 Live Website

👉 https://ais-pre-3aisvnpbatxfycagshwgfk-551530990661.asia-southeast1.run.app

## 📖 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Security & Blockchain Architecture](#-security--blockchain-architecture)
3. [Key System Capabilities & Modules](#-key-system-capabilities--modules)
4. [Bilingual Support (ID / EN)](#-bilingual-support-id--en)
5. [Role-Based Access Control (RBAC) & Demo Credentials](#-role-based-access-control-rbac--demo-credentials)
6. [Automated Security Penetration Testing (20 Scenarios)](#-automated-security-penetration-testing-20-scenarios)
7. [Docker & Containerized Deployment](#-docker--containerized-deployment)
8. [Local Development Setup](#-local-development-setup)
9. [API Specification Summary](#-api-specification-summary)
10. [Academic Submission & Compliance](#-academic-submission--compliance)

---

## 🎯 Executive Summary & Problem Statement

Academic credential fraud, unrecorded grade tampering, and unauthorized administrative access pose significant existential risks to vocational high schools (SMK), higher education institutions, and industrial hiring partners (DUDI).

This application implements a **defense-in-depth, enterprise-grade Academic Information System (SIA)** combining two foundational technological pillars:
1. **Zero Trust Architecture (NIST SP 800-207)**: Enforces *"Never Trust, Always Verify"* across all endpoints, utilizing non-root container isolation, strict Role-Based Access Control (RBAC), asymmetric RS256 cryptographic tokens, RFC 6238 Time-based One-Time Password (TOTP) Multi-Factor Authentication, and rate-limiting security middleware.
2. **EduChain Consortium Blockchain (QBFT / Istanbul PoA)**: Permanently anchors graduation records, high school diplomas (*Ijazah*), transcripts, and Industrial Internship (*PKL*) certifications into an immutable, multi-party verified distributed ledger shared between Schools, Industry Partners (DUDI), Provincial Education Offices (Disdik), and the Ministry of Education (Kemdikbud).

---

## 🏗️ Security & Blockchain Architecture

```
                                  [ Cloudflare / Cloud Armor WAF ]
                                                │
                                  [ HTTPS / TLS 1.3 Termination ]
                                                │
                    ┌───────────────────────────┴───────────────────────────┐
                    ▼                                                       ▼
       [ Public Verification Portal ]                          [ Authenticated Dashboard ]
      (Zero-Knowledge Hash / QR Lookup)                        (Zero Trust Security Gateway)
                    │                                                       │
                    │                                          ┌────────────┴────────────┐
                    │                                          ▼                         ▼
                    │                                   [ TOTP MFA Engine ]      [ RS256 Auth Guard ]
                    │                                  (RFC 6238 6-Digit)       (Role-Based Claims)
                    │                                          │                         │
                    └───────────────────────────┬──────────────┴─────────────────────────┘
                                                ▼
                            [ Container Runtime (Node 22 Alpine) ]
                           (UID 1001: appuser | Non-Root Execution)
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
     [ Core Academic Database ]      [ Multi-Sig Approval Engine ]     [ SIEM Security Audit Trail ]
    (Students, Grades, Records)      (School Admin + Principal + DUDI)  (Immutable Event Logger)
                 │                              │
                 └──────────────────────────────┼──────────────────────────────┘
                                                ▼
                                 [ EduChain Consortium Ledger ]
                            (QBFT / PoA 4-Node Multi-Party Consensus)
                                ├── Node 1: SMK Negeri (School)
                                ├── Node 2: PT Mitra Industri (DUDI)
                                ├── Node 3: Dinas Pendidikan Provinsi
                                └── Node 4: Kemdikbudristek Validator
```

### 1. Zero Trust Principles Implemented
* **Continuous Verification**: Every API request evaluates user role, token expiration, cryptographic signature, and IP reputation.
* **Principle of Least Privilege (PoLP)**: Strict boundary separation preventing teachers from issuing diplomas, students from modifying grades, and administrators from bypassing principal authorization.
* **Multi-Signature (Multi-Sig) Workflow**: Academic diplomas require dual cryptographic signatures (Administrative Drafting by Tata Usaha $\rightarrow$ Asymmetric Approval & Authorization by Kepala Sekolah) before being minted onto the blockchain.
* **Rate Limiting & Anti-Brute Force**: In-memory adaptive throttling protecting authentication, MFA verification, and public query endpoints.

### 2. EduChain Consortium Consensus
* **Consensus Engine**: Istanbul / QBFT Proof-of-Authority (PoA).
* **Block Interval**: Deterministic 5-second block cadence.
* **Transaction Finality**: Instant 1-block finality preventing forks and reorg attacks.
* **Data Privacy**: Only deterministic document hashes (SHA-256), student NISN identifiers, and issuer digital signatures reside on-chain; private student personal data remains securely in the off-chain academic database.

---

## ⚡ Key System Capabilities & Modules

| Module | Features & Capabilities |
| :--- | :--- |
| **🔍 Public Diploma Verification** | Instant verification by SHA-256 document hash or QR code scan. Displays live verification status against the EduChain blockchain with cryptographic proof breakdown. |
| **👥 Student & Graduation Management** | Comprehensive master data for students, NISN records, class assignments, and multi-tier graduation status transitions (`AKTIF` $\rightarrow$ `PENDING_APPROVAL` $\rightarrow$ `LULUS`). |
| **📊 Academic Grades & Transcripts** | Per-subject grading with competency breakdown. Teachers digitally sign score submissions using RS256 asymmetric keys. |
| **📜 Document Issuance & Multi-Sig** | Digital diploma and transcript generator. Integrates multi-tier approval: TU drafts $\rightarrow$ Principal digitally signs and commits to blockchain $\rightarrow$ QR code and verifiable PDF generated. |
| **🏭 DUDI Industrial Internship Portal** | Dedicated portal for industrial partners (PT Industri) to input workplace assessment scores, verify competencies, and co-sign internship certificates (*Sertifikat PKL*). |
| **⛓️ EduChain Consortium Explorer** | Live distributed ledger explorer showing latest blocks, transaction receipts, validator node health metrics, and raw JSON blockchain payload inspection. |
| **🚨 SIEM Security Audit Trail** | Enterprise security event log recording actor identities, timestamp, IP address, user agent, event severity, and state change hashes for forensic auditing. |
| **🧪 Live Security Test Center** | Integrated penetration testing console executing 20 automated attack scenarios covering Zero Trust integrity, RBAC isolation, and tamper resistance. |

---

## 🌐 Bilingual Support (ID / EN)

The application features full, seamless internationalization with support for:
- **Bahasa Indonesia (ID)**: Standard institutional terminology (*Tata Usaha, Kepala Sekolah, Ijazah, Transkrip Nilai, Sertifikat PKL*).
- **English (EN)**: Professional international terminology (*Administration, Principal, Diploma, Academic Transcript, Internship Certificate*).

**How to switch languages**:
- Click the language selector toggle (**🇮🇩 ID / 🇬🇧 EN**) located in the top navigation bar, sidebar, or login screen.
- The language preference is automatically persisted to `localStorage` and persists across sessions and page reloads.

---

## 🔑 Role-Based Access Control (RBAC) & Demo Credentials

All test accounts use the standard password: **`Password123!`**

| Role | Name | Email / Identifier | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **👑 KEPALA_SEKOLAH** | Drs. H. Suryanto, M.Pd. | `kepsek@smk.sch.id` | Executive authorization, multi-sig diploma approval, graduation clearance, blockchain minting. |
| **🏢 TU (Tata Usaha)** | Siti Rahmawati, S.Kom. | `tu@smk.sch.id` | Student master data, drafting academic diplomas & transcripts, initiating verification workflows. |
| **👨‍🏫 GURU (Teacher)** | Ahmad Fauzi, S.T. | `guru.tkj@smk.sch.id` | Grade management, competency score submission, signing academic reports for assigned classes. |
| **🎓 SISWA (Student)** | Budi Pratama | `siswa.budi@smk.sch.id` | View personal academic grades, download verified transcripts, view digital diplomas & QR codes. |
| **🏭 DUDI (Industry)** | PT Industri Digital Nusantara | `dudi.ptint@dudi.id` | Evaluate student internships (PKL), issue industry competency certificates, validator node participation. |
| **🛡️ AUDITOR** | Dr. Hendra Wijaya | `auditor@kemdikbud.go.id` | Read-only compliance auditing, SIEM security logs inspection, validator integrity verification. |

> **Note on MFA**: If MFA is enabled on an account, the TOTP secret and live 6-digit code are automatically displayed on the login modal for seamless testing without external authenticator apps.

---

## 🧪 Automated Security Penetration Testing (20 Scenarios)

The system includes a built-in automated penetration testing suite (`POST /api/test/run-all`) to validate Zero Trust controls and cryptographic integrity:

```
[1]  TC-01: Authentication with Valid Credentials                ──► PASS (JWT Issued)
[2]  TC-02: Authentication with Invalid Password                 ──► PASS (HTTP 401 Blocked)
[3]  TC-03: Brute-Force Rate Limiting Threshold                  ──► PASS (HTTP 429 Enforced)
[4]  TC-04: RBAC Student Trying to Access Admin Data             ──► PASS (HTTP 403 Forbidden)
[5]  TC-05: RBAC Teacher Trying to Authorize Diplomas            ──► PASS (HTTP 403 Forbidden)
[6]  TC-06: Tampered JWT Signature Rejection                     ──► PASS (Invalid Signature Rejected)
[7]  TC-07: Expired JWT Token Rejection                          ──► PASS (Token Expired Blocked)
[8]  TC-08: Time-based OTP (TOTP) RFC 6238 Verification         ──► PASS (Valid TOTP Accepted)
[9]  TC-09: Replay Attack with Expired TOTP Token                ──► PASS (Replay Blocked)
[10] TC-10: SHA-256 Document Hash Integrity Matching             ──► PASS (Hash Matched)
[11] TC-11: Tampered Document Content Hash Mismatch Detection    ──► PASS (Tamper Detected & Flagged)
[12] TC-12: Multi-Sig Approval State Machine Compliance          ──► PASS (Dual Signatures Required)
[13] TC-13: Unauthorized Blockchain Block Injection Attempt      ──► PASS (Consensus Rejection)
[14] TC-14: SQL / NoSQL Injection Payload Sanitization           ──► PASS (Sanitized & Neutralized)
[15] TC-15: Cross-Site Scripting (XSS) Input Sanitization        ──► PASS (HTML Entities Escaped)
[16] TC-16: SIEM Audit Trail Event Immutability Validation       ──► PASS (Log State Verified)
[17] TC-17: Public Verification of Valid Blockchain Hash         ──► PASS (Cryptographic Proof Confirmed)
[18] TC-18: Public Verification of Fake / Modified Hash          ──► PASS (Unregistered Hash Flagged)
[19] TC-19: Principle of Least Privilege Container Non-Root Check──► PASS (appuser UID 1001 Active)
[20] TC-20: Automated Healthcheck Response Compliance            ──► PASS (HTTP 200 OK)
```

---

## 🐳 Docker & Containerized Deployment

The application is packaged following **Cloud Security Architecture Best Practices** using a multi-stage `Dockerfile` based on **Node.js 22 LTS Alpine**.

### 1. Build and Run with Docker Compose (Recommended)
```bash
# Start container in detached mode
docker compose up --build -d

# View real-time container logs
docker compose logs -f

# Stop container
docker compose down
```

### 2. Manual Docker CLI Execution
```bash
# 1. Build the production Docker image
docker build -t smk-zero-trust-blockchain:latest .

# 2. Run container with security options
docker run -d \
  -p 3000:3000 \
  --name smk_zero_trust_app \
  --security-opt no-new-privileges:true \
  smk-zero-trust-blockchain:latest
```

### 3. Container Security Verification
To verify compliance with the **Principle of Least Privilege (PoLP)**:
```bash
# Verify container is executing as non-root 'appuser'
docker exec -it smk_zero_trust_blockchain_app whoami
# Output: appuser
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 20+ LTS
- npm or yarn

### Installation Steps
```bash
# 1. Install project dependencies
npm install

# 2. Start full-stack development server (Express + Vite on port 3000)
npm run dev

# 3. Compile and verify production build
npm run build

# 4. Run TypeScript linter
npm run lint
```

Access the development environment at **`http://localhost:3000`**.

---

## 📡 API Specification Summary

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user; returns JWT token or MFA challenge. |
| `POST` | `/api/auth/verify-mfa` | Public | Validates 6-digit TOTP token against RFC 6238 specification. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current user profile and role claims. |
| `GET` | `/api/students` | Staff / Admin | Lists student master records with graduation statuses. |
| `GET` | `/api/grades` | Teacher / Admin | Retrieves student grades filtered by class or teacher assignment. |
| `POST` | `/api/grades` | Teacher | Submits or updates subject competency grades with signature. |
| `GET` | `/api/documents` | Authenticated | Lists academic documents (diplomas, transcripts, PKL). |
| `POST` | `/api/documents/issue` | Tata Usaha | Drafts new academic document with SHA-256 hash. |
| `POST` | `/api/documents/:id/authorize`| Kepala Sekolah | Authorizes document & commits transaction to EduChain. |
| `GET` | `/api/verify/:hash` | Public | Verifies document hash against blockchain ledger. |
| `GET` | `/api/blockchain/blocks` | Public / Auditor | Lists validated blocks and consensus metrics. |
| `GET` | `/api/audit-logs` | Auditor / Admin | Retrieves SIEM security audit trail records. |
| `POST` | `/api/test/run-all` | Public / Admin | Executes the 20-scenario automated security suite. |
| `GET` | `/api/health` | Public | Container orchestrator healthcheck endpoint. |

---

## 🎓 Academic Submission & Compliance

This codebase serves as the reference implementation for the **Cloud Security Architecture & Blockchain Integrity Final Project**.

* **Course**: Cloud Security & Distributed Systems Architecture
* **Standard Compliance**: NIST SP 800-207 (Zero Trust Architecture), ISO/IEC 27001 (Audit Trail), RFC 6238 (TOTP MFA), OCI Container Specification.
* **Consortium Architecture**: EduChain 4-Node Permissioned PoA Ledger.

---

*Designed and implemented with precision for high-assurance academic integrity and enterprise cloud security.*
