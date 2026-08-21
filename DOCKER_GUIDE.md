# 🐳 PANDUAN LENGKAP SETUP DOCKER & CLOUD SECURITY ARCHITECTURE
**Sistem Informasi Administrasi SMK Berbasis Zero Trust Architecture & EduChain Blockchain**

---

## 1. Arsitektur Kontainer & Zero Trust Compliance

Sesuai dengan dokumen **Tugas Final Cloud Security Architecture**:
1. **Network Segmentation (VPC Private Subnet)**: Aplikasi web dan API berjalan terisolasi di dalam container runtime (AWS ECS Fargate / Google Cloud Run).
2. **Minimal Attack Surface**: Menggunakan base image **Node.js 22 Alpine Linux** super ringan.
3. **Principle of Least Privilege (PoLP)**: Container **tidak dijalankan sebagai `root`**, melainkan menggunakan user non-privilege `appuser` (UID: 1001) untuk mencegah *Container Breakout* dan *Privilege Escalation*.
4. **Automated Health Monitoring**: Dilengkapi directive `HEALTHCHECK` otomatis pada endpoint `/api/health`.
5. **Multi-Stage Build**: Memisahkan layer build (devDependencies, TypeScript compiler, bundler) dengan runtime production, sehingga image akhir bersih tanpa source code mentah ataupun compiler toolchain.

---

## 2. Struktur Berkas Docker di Proyek

| Berkas | Fungsi |
| :--- | :--- |
| `Dockerfile` | Definisi multi-stage build (Builder stage & Runner stage dengan non-root user) |
| `.dockerignore` | Mengabaikan `.git`, `node_modules`, `.env`, dan file lokal agar image ramping dan aman |
| `docker-compose.yml` | Orkestrasi container lokal dengan konfigurasi security `no-new-privileges: true` |

---

## 3. Langkah-Langkah Menjalankan Menggunakan Docker

### Opsi A: Menggunakan Docker Compose (Sangat Direkomendasikan)
Jalankan satu perintah ini di terminal root proyek:
```bash
docker compose up --build -d
```

Untuk melihat log aktivitas real-time container:
```bash
docker compose logs -f
```

Untuk menghentikan container:
```bash
docker compose down
```

---

### Opsi B: Menggunakan Docker CLI Standar
```bash
# 1. Build Docker Image
docker build -t smk-zero-trust-blockchain:latest .

# 2. Jalankan Container
docker run -d \
  -p 3000:3000 \
  --name smk_zero_trust_app \
  --security-opt no-new-privileges:true \
  smk-zero-trust-blockchain:latest

# 3. Cek Status Container & Healthcheck
docker ps
```

Akses aplikasi melalui peramban: **`http://localhost:3000`**

---

## 4. Verifikasi Keamanan Kontainer (Untuk Bahan Uji Bab IV Laporan)

### A. Pembuktian Eksekusi User Non-Root (Least Privilege)
Jalankan perintah ini untuk membuktikan kepada dosen bahwa container tidak berjalan sebagai root:
```bash
docker exec -it smk_zero_trust_blockchain_app whoami
# Output yang dihasilkan: appuser (bukan root)
```

### B. Pengujian Healthcheck Endpoint
```bash
curl -I http://localhost:3000/api/health
# Output: HTTP/1.1 200 OK
```

### C. Pemindaian Celah Keamanan (Vulnerability Scan) dengan Docker Scout / Trivy
```bash
docker scout quickview smk-zero-trust-blockchain:latest
# atau menggunakan Trivy
trivy image smk-zero-trust-blockchain:latest
```

---

## 5. Pemetaan ke Bab Laporan Tugas Akhir

- **BAB II (Perancangan Arsitektur Cloud Security)**:
  - Masukkan arsitektur *Containerized Micro-Monolith* yang berjalan di Private Subnet (Google Cloud Run / AWS Fargate) di belakang WAF (Cloud Armor / AWS WAF).
  - Jelaskan diagram multi-stage build `Dockerfile` yang membuang artefak kompilasi untuk meminimalkan *attack vector*.

- **BAB IV (Pengujian & Analisis Keamanan)**:
  - Sertakan screenshot hasil uji `docker exec ... whoami` (membuktikan kepatuhan terhadap kontrol *Zero Trust Identity & Least Privilege* pada layer OS container).
  - Sertakan hasil eksekusi 20 skenario uji keamanan bawaan di menu **Pusat Pengujian Keamanan & Integritas Nyata**.
