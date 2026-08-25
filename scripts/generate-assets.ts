import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

const imgDir = path.join(process.cwd(), 'scripts', 'assets');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

function createDiagram1() {
  const width = 1200;
  const height = 650;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('DIAGRAM ARSITEKTUR MULTI-TIER VPC & ZERO TRUST CLOUD SECURITY', 40, 45);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('SIA SMK Negeri 1 EduChain - Virtual Private Cloud (VPC: 10.0.0.0/16)', 40, 75);

  // VPC Outer Box
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 95, 1140, 525);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(35, 100, 1130, 30);
  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('VPC 10.0.0.0/16 (Multi-AZ Deployment with Defense-in-Depth)', 45, 120);

  // Tier 1: Public Subnet
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  ctx.fillRect(50, 145, 340, 455);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, 145, 340, 455);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(50, 145, 340, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('1. PUBLIC SUBNET (10.0.1.0/24)', 60, 165);

  drawCard(ctx, 70, 190, 300, 75, '#1e293b', '#38bdf8', 'Cloud WAF & DDoS Shield', ['OWASP Top 10 Core Rules', 'Rate Limiting (100 req/min)', 'IP Reputation Filter']);
  drawCard(ctx, 70, 280, 300, 75, '#1e293b', '#38bdf8', 'Application Load Balancer', ['TLS 1.3 Termination (ECDHE)', 'HTTPS Strict Transport (HSTS)', 'Path-based Routing']);
  drawCard(ctx, 70, 370, 300, 70, '#1e293b', '#38bdf8', 'NAT Gateway', ['Outbound Secure Traffic Only', 'No Inbound Route From Web', 'Elastic IP: 34.101.x.x']);
  drawCard(ctx, 70, 455, 300, 125, '#0f172a', '#64748b', 'Security Protocol (Edge)', ['• Internet Gateway Attached', '• Port 80 -> 443 Redirect', '• Anti-Bot Verification']);

  // Tier 2: Private App Subnet
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  ctx.fillRect(430, 145, 340, 455);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(430, 145, 340, 455);

  ctx.fillStyle = '#059669';
  ctx.fillRect(430, 145, 340, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('2. PRIVATE APP SUBNET (10.0.2.0/24)', 440, 165);

  drawCard(ctx, 450, 190, 300, 75, '#1e293b', '#34d399', 'Node.js Express Compute', ['Docker Non-Root (appuser:1001)', 'RS256 JWT Verification', 'Zero Trust IAM Context']);
  drawCard(ctx, 450, 280, 300, 75, '#1e293b', '#34d399', 'Academic & PKL Modules', ['Grade Input & Transcript Engine', 'DUDI Internship Assessment', 'Two-Tier Multi-Sig Flow']);
  drawCard(ctx, 450, 370, 300, 70, '#1e293b', '#34d399', 'MFA & SIEM Event Engine', ['TOTP RFC 6238 Validator', 'Real-time Security Event Logger', 'Auto-Quarantine Trigger']);
  drawCard(ctx, 450, 455, 300, 125, '#0f172a', '#64748b', 'Security Protocol (App)', ['• Inbound: ALB Port 3000 Only', '• Outbound: NAT Gateway Only', '• No Public IP Assignment']);

  // Tier 3: Isolated Data Subnet
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  ctx.fillRect(810, 145, 340, 455);
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(810, 145, 340, 455);

  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(810, 145, 340, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('3. ISOLATED DATA SUBNET (10.0.3.0/24)', 820, 165);

  drawCard(ctx, 830, 190, 300, 75, '#1e293b', '#a78bfa', 'PostgreSQL Relational DB', ['AES-256-XTS Encryption At-Rest', 'Strict Param Queries (No SQLi)', 'Automated Hourly Snapshot']);
  drawCard(ctx, 830, 280, 300, 75, '#1e293b', '#a78bfa', 'Cloud KMS / Key Vault', ['FIPS 140-2 L3 Hardware HSM', 'RS256 Private Key Isolation', 'Signing via Cryptographic API']);
  drawCard(ctx, 830, 370, 300, 70, '#1e293b', '#a78bfa', 'Immutable WORM Storage', ['Write Once Read Many Policy', 'Retention Lock (No Deletion)', 'Diploma PDF Binary Vault']);
  drawCard(ctx, 830, 455, 300, 125, '#0f172a', '#64748b', 'Security Protocol (Data)', ['• Air-gapped: 0 Internet Route', '• Inbound: Private App Subnet', '• mTLS & SSL DB Connection']);

  // Connectors
  drawArrow(ctx, 390, 225, 430, 225, '#38bdf8');
  drawArrow(ctx, 770, 225, 810, 225, '#34d399');

  fs.writeFileSync(path.join(imgDir, 'figure1_cloud_topology.png'), canvas.toBuffer('image/png'));
  console.log('Gambar 1 Cloud Topology berhasil dibuat.');
}

function createDiagram2() {
  const width = 1200;
  const height = 620;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('ARSITEKTUR KONSORSIUM BLOCKCHAIN EDUCHAIN & SMART CONTRACT', 40, 45);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('4 Independent Validator Nodes (QBFT Consensus / Proof-of-Authority)', 40, 75);

  // Outer Box
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 95, 1140, 495);

  // 4 Nodes Grid
  const nodes = [
    { name: 'Node 1: SMK Negeri 1 (Sekolah)', ip: '10.0.2.10', role: 'Issuer & Grade Ledger', color: '#3b82f6', x: 60, y: 120 },
    { name: 'Node 2: PT Industri Tech (DUDI)', ip: '198.51.100.22', role: 'Co-Signer & PKL Cert', color: '#10b981', x: 620, y: 120 },
    { name: 'Node 3: Disdik Provinsi (Regulator)', ip: '203.0.113.45', role: 'Regional Accreditation', color: '#f59e0b', x: 60, y: 310 },
    { name: 'Node 4: Pusdatin Kemdikbud (Pusat)', ip: '103.10.68.80', role: 'National NISN Anchor', color: '#8b5cf6', x: 620, y: 310 },
  ];

  nodes.forEach(n => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(n.x, n.y, 520, 160);
    ctx.strokeStyle = n.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(n.x, n.y, 520, 160);

    ctx.fillStyle = n.color;
    ctx.fillRect(n.x, n.y, 520, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(n.name, n.x + 15, n.y + 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Arial';
    ctx.fillText(`Role: ${n.role}`, n.x + 15, n.y + 60);
    ctx.fillText(`Validator IP: ${n.ip} | Protocol: QBFT PoA`, n.x + 15, n.y + 85);
    ctx.fillText(`State Sync: Block Height #142,850 | Peers: 3/3`, n.x + 15, n.y + 110);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Cryptographic Signature: ecdsa-secp256k1`, n.x + 15, n.y + 135);
  });

  // Center Consensus Emblem
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(440, 235, 320, 90);
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2;
  ctx.strokeRect(440, 235, 320, 90);
  ctx.fillStyle = '#f3e8ff';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('QBFT Consensus Engine', 500, 265);
  ctx.fillStyle = '#d8b4fe';
  ctx.font = '12px Arial';
  ctx.fillText('Fault Tolerance: f = (4-1)/3 = 1 Node', 480, 290);
  ctx.fillText('Finality: Instant (0 Forking Risk)', 505, 310);

  // Bottom workflow summary
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(50, 490, 1100, 85);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 490, 1100, 85);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('Alur Smart Contract: Draft Ijazah -> Sign Kepsek RS256 -> SHA-256 Digest -> QBFT Consensus -> Permanent Block Mined', 70, 520);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Arial';
  ctx.fillText('Public Zero-Knowledge Verification: Browser Local SHA-256 -> Instant RPC Read to EduChain Consortium -> Status: VERIFIED', 70, 545);

  fs.writeFileSync(path.join(imgDir, 'figure2_blockchain_consortium.png'), canvas.toBuffer('image/png'));
  console.log('Gambar 2 Blockchain Consortium berhasil dibuat.');
}

function createDiagram3() {
  const width = 1200;
  const height = 550;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('ALUR PENERBITAN BERJENJANG (TWO-TIER) & VERIFIKASI ZERO-KNOWLEDGE', 40, 45);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Penerbitan Ijazah Resmi dan Pembuktian Keabsahan Publik Bebas Manipulasi', 40, 75);

  // Step boxes (5 Steps)
  const steps = [
    { num: '01', title: 'Drafting TU', desc: 'Staf TU input data siswa & nilai rapor.', tag: 'State: DRAFT', col: '#3b82f6', x: 50 },
    { num: '02', title: 'Otorisasi Kepsek', desc: 'Login MFA TOTP & sign RS256 Cloud KMS.', tag: 'Key: RS256 HSM', col: '#8b5cf6', x: 280 },
    { num: '03', title: 'Hashing SHA-256', desc: 'Ekstraksi 64-char hex digest dokumen.', tag: 'Digest Kripto', col: '#ec4899', x: 510 },
    { num: '04', title: 'EduChain Mining', desc: 'Konsensus 4 validator & catat di block.', tag: 'Block #142850', col: '#10b981', x: 740 },
    { num: '05', title: 'Verifikasi Publik', desc: 'Client local hash < 1s, Zero-Knowledge.', tag: 'Status: AUTHENTIC', col: '#06b6d4', x: 970 },
  ];

  steps.forEach(s => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(s.x, 130, 180, 240);
    ctx.strokeStyle = s.col;
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x, 130, 180, 240);

    ctx.fillStyle = s.col;
    ctx.fillRect(s.x, 130, 180, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`${s.num}. ${s.title}`, s.x + 10, 154);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Arial';
    wrapText(ctx, s.desc, s.x + 12, 195, 155, 18);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(s.x + 10, 310, 160, 45);
    ctx.fillStyle = s.col;
    ctx.font = 'bold 12px Arial';
    ctx.fillText(s.tag, s.x + 20, 338);
  });

  // Arrows between steps
  for (let i = 0; i < 4; i++) {
    drawArrow(ctx, steps[i].x + 180, 250, steps[i + 1].x, 250, '#94a3b8');
  }

  // Bottom Notice
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(50, 400, 1100, 110);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 400, 1100, 110);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('🛡️ JAMINAN INTEGRITAS MATEMATIS (AVALANCHE EFFECT SHA-256):', 70, 430);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px Arial';
  ctx.fillText('Setiap perubahan pada 1 huruf nama, 1 digit NISN, atau 1 nilai angka di dalam PDF akan mengubah nilai SHA-256 secara drastis.', 70, 460);
  ctx.fillText('Portal Verifikasi Publik langsung mendeteksi ketidakcocokan dengan data pada Ledger EduChain dan menandai dokumen sebagai PALSU.', 70, 485);

  fs.writeFileSync(path.join(imgDir, 'figure3_verification_workflow.png'), canvas.toBuffer('image/png'));
  console.log('Gambar 3 Verification Workflow berhasil dibuat.');
}

function createDiagram4() {
  const width = 1200;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('HASIL UJI PENETRASI (OWASP WSTG & SCSVS) - 100% SECURITY INTEGRITY', 40, 45);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('20/20 Skenario Pengujian Lolos Verifikasi (Web, API, Cloud, dan Smart Contract)', 40, 75);

  // Outer Grid
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, 105, 1120, 360);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 105, 1120, 360);

  // 4 Result Metric Cards
  const cards = [
    { title: 'OWASP Web & API Tests', score: '10/10 PASSED', desc: 'IDOR, SQLi, XSS, Secret Leak, Rate Limit', col: '#10b981', x: 70 },
    { title: 'Blockchain & Smart Contract', score: '6/6 PASSED', desc: 'Unauthorized Mint, Reentrancy, Hash Tamper', col: '#10b981', x: 340 },
    { title: 'Zero Trust IAM & MFA', score: '4/4 PASSED', desc: 'TOTP RFC 6238, Ephemeral JWT, Privilege Esc', col: '#10b981', x: 610 },
    { title: 'Overall Security Score', score: '100% SECURE', desc: 'Zero Critical/High Vulnerabilities Found', col: '#38bdf8', x: 880 },
  ];

  cards.forEach(c => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(c.x, 135, 250, 300);
    ctx.strokeStyle = c.col;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(c.x, 135, 250, 300);

    ctx.fillStyle = c.col;
    ctx.font = 'bold 15px Arial';
    ctx.fillText(c.title, c.x + 15, 175);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial';
    ctx.fillText(c.score, c.x + 15, 230);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Arial';
    wrapText(ctx, c.desc, c.x + 15, 275, 220, 20);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(c.x + 15, 360, 220, 50);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('STATUS: AUDIT VERIFIED', c.x + 30, 390);
  });

  fs.writeFileSync(path.join(imgDir, 'figure4_pentest_results.png'), canvas.toBuffer('image/png'));
  console.log('Gambar 4 Pentest Results berhasil dibuat.');
}

function drawCard(ctx: any, x: number, y: number, w: number, h: number, bg: string, border: string, title: string, items: string[]) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = border;
  ctx.font = 'bold 12px Arial';
  ctx.fillText(title, x + 10, y + 18);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px Arial';
  items.forEach((item, idx) => {
    ctx.fillText(item, x + 10, y + 36 + (idx * 16));
  });
}

function drawArrow(ctx: any, fromX: number, fromY: number, toX: number, toY: number, color: string) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrowhead
  const headlen = 8;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.fill();
}

function wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

createDiagram1();
createDiagram2();
createDiagram3();
createDiagram4();
console.log('Semua aset gambar diagram arsitektur berhasil dibuat.');
