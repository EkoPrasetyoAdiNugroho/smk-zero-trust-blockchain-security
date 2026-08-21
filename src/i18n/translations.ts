export type Language = 'id' | 'en';

export interface Translations {
  common: {
    appName: string;
    appSubtitle: string;
    systemTag: string;
    zeroTrustBadge: string;
    loading: string;
    save: string;
    cancel: string;
    close: string;
    search: string;
    filter: string;
    status: string;
    actions: string;
    verified: string;
    unverified: string;
    active: string;
    pending: string;
    graduated: string;
    rejected: string;
    download: string;
    view: string;
    details: string;
    copy: string;
    copied: string;
    error: string;
    success: string;
    login: string;
    logout: string;
    loginToAccount: string;
    switchRole: string;
    backToHome: string;
    refresh: string;
    print: string;
    date: string;
    all: string;
    language: string;
    indonesian: string;
    english: string;
  };
  nav: {
    verify: string;
    publicVerify: string;
    students: string;
    grades: string;
    documents: string;
    dudi: string;
    blockchain: string;
    audit: string;
    auditLogs: string;
    securityTests: string;
    academicPortal: string;
    consortiumSecurity: string;
    quickDemoAccount: string;
    login: string;
    logout: string;
  };
  roles: {
    KEPALA_SEKOLAH: string;
    TU: string;
    GURU: string;
    SISWA: string;
    DUDI: string;
    AUDITOR: string;
    GUEST: string;
  };
  landing: {
    badge: string;
    tagline: string;
    title: string;
    subtitle: string;
    heroDesc: string;
    bullet1Title: string;
    bullet1Desc: string;
    bullet2Title: string;
    bullet2Desc: string;
    bullet3Title: string;
    bullet3Desc: string;
    bullet4Title: string;
    bullet4Desc: string;
    stats1Value: string;
    stats1Label: string;
    stats2Value: string;
    stats2Label: string;
    stats3Value: string;
    stats3Label: string;
    stats4Value: string;
    stats4Label: string;
    loginCardTitle: string;
    loginCardSubtitle: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    identifierHelp: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    rememberDevice: string;
    rememberDeviceHelp: string;
    forgotPassword: string;
    loginButton: string;
    authenticating: string;
    quickLoginTitle: string;
    quickLoginDesc: string;
    verifyPublicCta: string;
    verifyPublicDesc: string;
    verifyButton: string;
    securityFooter: string;
  };
  mfa: {
    title: string;
    subtitle: string;
    modalTitle: string;
    modalSubtitle: string;
    alertInfo: string;
    codeLabel: string;
    totpLabel: string;
    totpPlaceholder: string;
    verifyButton: string;
    verifyBtn: string;
    verifying: string;
    verified: string;
    enterCode: string;
    refreshIn: string;
    demoKeyLabel: string;
    demoCurrentCodeLabel: string;
    trustDeviceCheckbox: string;
    trustDeviceHelp: string;
    invalidCode: string;
  };
  verify: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    hashLabel: string;
    uploadInstruction: string;
    zeroUploadNotice: string;
    verifying: string;
    validBadge: string;
    invalidBadge: string;
    invalidTitle: string;
    invalidDesc: string;
    orManualHash: string;
    orScanQr: string;
    quickExamples: string;
    demoHash1: string;
    demoHash2: string;
    demoHash3: string;
    resultValidTitle: string;
    resultValidSubtitle: string;
    resultInvalidTitle: string;
    resultInvalidSubtitle: string;
    docNumber: string;
    studentName: string;
    nisn: string;
    school: string;
    major: string;
    issuer: string;
    issueDate: string;
    issuedAt: string;
    authorizedBy: string;
    txHash: string;
    blockNumber: string;
    consensusStatus: string;
    viewCertificate: string;
    tamperProofProof: string;
  };
  students: {
    title: string;
    subtitle: string;
    totalStudents: string;
    activeStudents: string;
    graduatedStudents: string;
    filterClass: string;
    filterMajor: string;
    searchPlaceholder: string;
    allClasses: string;
    allStatuses: string;
    empty: string;
    viewDetail: string;
    tableNisn: string;
    tableName: string;
    tableClass: string;
    tableMajor: string;
    tableStatus: string;
    tableGraduationYear: string;
    tableActions: string;
    viewProfile: string;
    issueDoc: string;
    gradStatusActive: string;
    gradStatusGraduated: string;
    gradStatusPending: string;
    statusActive: string;
    statusGraduated: string;
    statusPending: string;
  };
  grades: {
    title: string;
    subtitle: string;
    tabList: string;
    tabAudit: string;
    empty: string;
    tableStudent: string;
    tableSubject: string;
    tableSemester: string;
    tableTeacher: string;
    tableScore: string;
    tableActions: string;
    editScore: string;
    newScoreLabel: string;
    reasonLabel: string;
    saveAnchor: string;
    selectClass: string;
    selectSemester: string;
    selectSubject: string;
    subjectList: string;
    studentName: string;
    nisn: string;
    score: string;
    gradeLetter: string;
    predicate: string;
    signatureStatus: string;
    signedByTeacher: string;
    saveGrades: string;
    saving: string;
    gradeUpdated: string;
    noPermission: string;
  };
  documents: {
    title: string;
    subtitle: string;
    preview: string;
    draftDocButton: string;
    uploadDraft: string;
    empty: string;
    pendingApprovalTab: string;
    issuedTab: string;
    rejectedTab: string;
    tableType: string;
    tableDoc: string;
    tableNumber: string;
    tableStudent: string;
    tableHash: string;
    tableStatus: string;
    tableCreated: string;
    tableActions: string;
    statusIssued: string;
    statusDraft: string;
    signIssue: string;
    authorizeAndSign: string;
    authorizing: string;
    verifyOnChain: string;
    revokeDoc: string;
    downloadPdf: string;
    multiSigNotice: string;
  };
  dudi: {
    title: string;
    subtitle: string;
    activeInterns: string;
    completedCertificates: string;
    issueNew: string;
    empty: string;
    tableTitle: string;
    tableStudent: string;
    tableScore: string;
    tableStatus: string;
    tableActions: string;
    internName: string;
    internNisn: string;
    schoolName: string;
    duration: string;
    companySupervisor: string;
    technicalScore: string;
    softskillScore: string;
    finalGrade: string;
    issueCertificate: string;
    issuing: string;
    coSignedNotice: string;
  };
  blockchain: {
    title: string;
    subtitle: string;
    refresh: string;
    networkStatus: string;
    consensusAlgorithm: string;
    consensusMechanism: string;
    totalBlocks: string;
    totalTransactions: string;
    activeValidators: string;
    validatorNode: string;
    blockTime: string;
    blockHistory: string;
    blockDetail: string;
    latestBlocks: string;
    blockHeight: string;
    blockHash: string;
    prevHash: string;
    previousHash: string;
    merkleRoot: string;
    txPayload: string;
    selectBlock: string;
    transactionsCount: string;
    validatorNodes: string;
    nodeSchool: string;
    nodeDudi: string;
    nodeDisdik: string;
    nodeKemdikbud: string;
    verifyHashInBlock: string;
  };
  audit: {
    title: string;
    subtitle: string;
    empty: string;
    totalEvents: string;
    criticalEvents: string;
    warningEvents: string;
    filterSeverity: string;
    filterAction: string;
    tableTime: string;
    tableEvent: string;
    tableActor: string;
    tableRole: string;
    tableAction: string;
    tableIp: string;
    tableSeverity: string;
    tableStatus: string;
    tableDetails: string;
    exportJson: string;
    exportLogs: string;
  };
  tests: {
    title: string;
    subtitle: string;
    runAll: string;
    running: string;
    totalScenarios: string;
    passed: string;
    failed: string;
    integrityScore: string;
  };
  securityTests: {
    title: string;
    subtitle: string;
    runAllTests: string;
    runningTests: string;
    testResults: string;
    passed: string;
    failed: string;
    summaryScore: string;
    testCaseCol: string;
    categoryCol: string;
    threatMitigationCol: string;
    statusCol: string;
    executionLog: string;
  };
}

export const translations: Record<Language, Translations> = {
  id: {
    common: {
      appName: 'SIA SMK EduChain',
      appSubtitle: 'Sistem Informasi Akademik & Verifikasi Berbasis Blockchain',
      systemTag: 'SMK Pusat Keunggulan',
      zeroTrustBadge: 'Zero Trust & RS256 Active',
      loading: 'Memuat...',
      save: 'Simpan',
      cancel: 'Batal',
      close: 'Tutup',
      search: 'Cari data...',
      filter: 'Filter',
      status: 'Status',
      actions: 'Aksi',
      verified: 'Terverifikasi Asli',
      unverified: 'Tidak Terverifikasi',
      active: 'Aktif',
      pending: 'Menunggu',
      graduated: 'Lulus',
      rejected: 'Ditolak',
      download: 'Unduh',
      view: 'Lihat',
      details: 'Rincian',
      copy: 'Salin',
      copied: 'Tersalin!',
      error: 'Terjadi Kesalahan',
      success: 'Berhasil',
      login: 'Masuk Akun',
      logout: 'Keluar Akun',
      loginToAccount: 'Masuk ke Akun',
      switchRole: 'Ganti Hak Akses Akun',
      backToHome: 'Kembali ke Beranda',
      refresh: 'Perbarui',
      print: 'Cetak Dokumen',
      date: 'Tanggal',
      all: 'Semua',
      language: 'Bahasa',
      indonesian: 'Bahasa Indonesia',
      english: 'English',
    },
    nav: {
      verify: 'Verifikasi Publik',
      publicVerify: 'Verifikasi Ijazah Publik',
      students: 'Data Siswa & Kelulusan',
      grades: 'Manajemen Nilai & Transkrip',
      documents: 'Manajemen Dokumen & Ijazah',
      dudi: 'Portal Mitra Industri (DUDI)',
      blockchain: 'EduChain Explorer',
      audit: 'SIEM & Audit Trail',
      auditLogs: 'SIEM & Audit Trail',
      securityTests: 'Live Security Tests',
      academicPortal: 'Portal Akademik & Administrasi',
      consortiumSecurity: 'Konsorsium & Keamanan Sistem',
      quickDemoAccount: 'Pilih Akun Cepat (Demo)',
      login: 'Masuk Akun',
      logout: 'Keluar',
    },
    roles: {
      KEPALA_SEKOLAH: 'Kepala Sekolah',
      TU: 'Tata Usaha',
      GURU: 'Guru Pengampu',
      SISWA: 'Siswa',
      DUDI: 'Mitra Industri DUDI',
      AUDITOR: 'Auditor Pengawas',
      GUEST: 'Tamu / Verifikator',
    },
    landing: {
      badge: 'SMK Pusat Keunggulan',
      tagline: 'Next-Gen Academic Security',
      title: 'Sistem Informasi Akademik Berbasis Zero Trust & EduChain',
      subtitle: 'Integritas Ijazah & Transkrip Tanpa Pemalsuan dengan Protokol Konsorsium Terdesentralisasi',
      heroDesc: 'Menjamin keaslian data kelulusan, transkrip nilai, dan sertifikat kompetensi siswa secara permanen dengan kriptografi asimetris RS256 dan konsensus multi-pihak.',
      bullet1Title: 'Zero Trust Security (NIST SP 800-207)',
      bullet1Desc: 'Tidak ada entitas yang dipercaya secara default. Setiap permintaan diverifikasi dengan otentikasi ketat, token ephemeral, dan pembatasan hak akses berbasis peran (RBAC).',
      bullet2Title: 'Konsorsium Blockchain EduChain (QBFT PoA)',
      bullet2Desc: 'Hash ijazah ditambang secara permanen pada 4 node konsorsium (Sekolah, Mitra Industri DUDI, Dinas Pendidikan, dan Kemdikbud).',
      bullet3Title: 'Otorisasi Multi-Signature Kepala Sekolah',
      bullet3Desc: 'Ijazah hanya sah dan tercatat di blockchain setelah melalui persetujuan berjenjang (Draft oleh TU dan Tanda Tangan Digital Asimetris oleh Kepala Sekolah).',
      bullet4Title: 'Audit Trail SIEM Real-Time & Forensik',
      bullet4Desc: 'Setiap percobaan akses, modifikasi nilai, dan penerbitan dokumen dicatat ke dalam log anti-tamper dengan hashing SHA-256.',
      stats1Value: '100%',
      stats1Label: 'Anti-Pemalsuan Ijazah',
      stats2Value: '4 Nodes',
      stats2Label: 'Konsorsium EduChain',
      stats3Value: '< 1 Detik',
      stats3Label: 'Verifikasi Publik',
      stats4Value: '20/20',
      stats4Label: 'Uji Penetrasi Lolos',
      loginCardTitle: 'Masuk ke Portal Akademik',
      loginCardSubtitle: 'Pilih peran akun di bawah atau masukkan kredensial institusi Anda:',
      identifierLabel: 'Email Institusi, Username, atau NISN',
      identifierPlaceholder: 'contoh: kepsek@smk.sch.id atau nisn: 0051234567',
      identifierHelp: 'Gunakan email terdaftar untuk staf/guru atau NISN untuk siswa.',
      passwordLabel: 'Kata Sandi Akun',
      passwordPlaceholder: 'Masukkan kata sandi...',
      rememberDevice: 'Ingat perangkat ini selama 30 hari',
      rememberDeviceHelp: 'Mengaktifkan token perangkat tepercaya untuk melewati tantangan MFA selama 30 hari.',
      forgotPassword: 'Lupa kata sandi?',
      loginButton: 'Masuk ke Sistem',
      authenticating: 'Memverifikasi Kredensial...',
      quickLoginTitle: 'Pilih Akun Demo Instan (1-Klik)',
      quickLoginDesc: 'Klik kartu peran di bawah untuk mengisi formulir login secara otomatis:',
      verifyPublicCta: 'Ingin Memverifikasi Keaslian Ijazah?',
      verifyPublicDesc: 'Masyarakat umum dan HRD perusahaan dapat memvalidasi keaslian dokumen tanpa perlu login.',
      verifyButton: 'Buka Portal Verifikasi Publik',
      securityFooter: 'Dilindungi oleh Zero Trust Policy, RS256 Asymmetric Keys, dan Konsorsium EduChain.',
    },
    mfa: {
      title: 'Verifikasi Multi-Factor MFA',
      subtitle: 'Zero Trust Security Mandatory Policy',
      modalTitle: 'Verifikasi Dua Faktor (MFA TOTP)',
      modalSubtitle: 'Masukkan 6-digit kode keamanan berbasis waktu (RFC 6238) dari aplikasi autentikator Anda.',
      alertInfo: 'Protokol Zero Trust mewajibkan verifikasi ganda untuk akun dengan hak istimewa tinggi.',
      codeLabel: 'Kode Otentikasi 6 Digit',
      totpLabel: 'Kode Verifikasi 6-Digit',
      totpPlaceholder: '000000',
      verifyButton: 'Konfirmasi & Masuk',
      verifyBtn: 'Verifikasi & Masuk',
      verifying: 'Memverifikasi...',
      verified: 'Kredensial Terverifikasi!',
      enterCode: 'Masukkan 6 digit kode autentikasi.',
      refreshIn: 'Refresh dalam',
      demoKeyLabel: 'Kunci Rahasia (Secret Key):',
      demoCurrentCodeLabel: 'Kode TOTP Aktif Saat Ini:',
      trustDeviceCheckbox: 'Jadikan perangkat ini Tepercaya selama 30 hari (Bypass MFA)',
      trustDeviceHelp: 'Menyimpan token kriptografis unik di browser ini untuk keamanan praktis.',
      invalidCode: 'Kode MFA tidak valid atau telah kedaluwarsa.',
    },
    verify: {
      title: 'Portal Verifikasi Ijazah & Transkrip Publik',
      subtitle: 'Validasi keaslian dokumen kelulusan SMK secara instan dan matematis terhadap Konsorsium EduChain Blockchain.',
      searchPlaceholder: 'Masukkan SHA-256 Dokumen Hash atau Nomor Ijazah...',
      searchButton: 'Verifikasi Dokumen',
      hashLabel: 'Atau Masukkan Dokumen Digest SHA-256:',
      uploadInstruction: 'Klik untuk memilih atau seret file PDF / Ijazah / Sertifikat PKL ke sini',
      zeroUploadNotice: 'Zero-Knowledge: File di-hash di browser Anda; file asli tidak pernah diunggah ke server.',
      verifying: 'Memverifikasi Dokumen di Ledger...',
      validBadge: 'DOKUMEN TERVERIFIKASI ASLI',
      invalidBadge: 'PERINGATAN: DOKUMEN TIDAK TERDAFTAR / PALSU',
      invalidTitle: 'Integritas Dokumen Tidak Terverifikasi di Blockchain',
      invalidDesc: 'Hash digest atau nomor dokumen ini TIDAK ditemukan pada konsensus ledger EduChain. Dokumen ini terindikasi hasil rekayasa, pemalsuan, atau belum pernah diterbitkan secara sah oleh institusi.',
      orManualHash: 'Atau Masukkan Hash SHA-256 Manual',
      orScanQr: 'Atau unggah / seret file ijazah/transkrip atau pindai QR code',
      quickExamples: 'Contoh Hash Ijazah Terdaftar:',
      demoHash1: 'Ijazah Budi Pratama (TKJ)',
      demoHash2: 'Ijazah Siti Nurhaliza (RPL)',
      demoHash3: 'Sertifikat PKL PT Industri',
      resultValidTitle: 'DOKUMEN DINYATAKAN ASLI & TERDAFTAR RESMI',
      resultValidSubtitle: 'Tercatat abadi di Konsorsium EduChain Blockchain dengan konsensus multi-validator.',
      resultInvalidTitle: 'DOKUMEN TIDAK DITEMUKAN ATAU TELAH DIMANIPULASI',
      resultInvalidSubtitle: 'Hash dokumen tidak cocok dengan catatan blockchain konsorsium mana pun.',
      docNumber: 'Nomor Dokumen',
      studentName: 'Nama Lengkap Siswa',
      nisn: 'Nomor Induk Siswa Nasional (NISN)',
      school: 'Institusi Penerbit',
      major: 'Program Keahlian',
      issuer: 'Penerbit & Otoritas',
      issueDate: 'Tanggal Diterbitkan',
      issuedAt: 'Tanggal Diterbitkan',
      authorizedBy: 'Diotorisasi Oleh (Digital Signature)',
      txHash: 'Transaction Hash (EduChain)',
      blockNumber: 'Nomor Blok',
      consensusStatus: 'Status Konsensus',
      viewCertificate: 'Lihat Pratinjau Dokumen Digital',
      tamperProofProof: 'Bukti Kriptografis SHA-256',
    },
    students: {
      title: 'Data Induk Siswa & Kelulusan',
      subtitle: 'Manajemen master data siswa, NISN, kelas, dan status kelulusan untuk penerbitan dokumen.',
      totalStudents: 'Total Siswa Terdaftar',
      activeStudents: 'Siswa Aktif',
      graduatedStudents: 'Siswa Lulus',
      filterClass: 'Semua Kelas',
      filterMajor: 'Semua Jurusan',
      searchPlaceholder: 'Cari berdasarkan nama, NISN, atau kelas...',
      allClasses: 'Semua Kelas',
      allStatuses: 'Semua Status Kelulusan',
      empty: 'Tidak ada data siswa yang cocok dengan filter.',
      viewDetail: 'Rincian Siswa',
      tableNisn: 'NISN / NIS',
      tableName: 'Nama Lengkap Siswa',
      tableClass: 'Kelas',
      tableMajor: 'Program Keahlian',
      tableStatus: 'Status Siswa',
      tableGraduationYear: 'Tahun Kelulusan',
      tableActions: 'Aksi',
      viewProfile: 'Lihat Profil',
      issueDoc: 'Terbitkan Ijazah',
      gradStatusActive: 'Siswa Aktif',
      gradStatusGraduated: 'Telah Lulus',
      gradStatusPending: 'Menunggu Verifikasi',
      statusActive: 'Siswa Aktif',
      statusGraduated: 'Telah Lulus',
      statusPending: 'Menunggu Verifikasi',
    },
    grades: {
      title: 'Manajemen & Transkrip Nilai Siswa',
      subtitle: 'Pencatatan nilai per mata pelajaran dengan tanda tangan digital guru pengampu (RS256).',
      tabList: 'Daftar Nilai Siswa',
      tabAudit: 'Audit Trail Perubahan Nilai',
      empty: 'Tidak ada data nilai yang sesuai dengan pilihan kelas & semester.',
      tableStudent: 'Nama Siswa & NISN',
      tableSubject: 'Mata Pelajaran',
      tableSemester: 'Semester',
      tableTeacher: 'Guru Pengampu',
      tableScore: 'Nilai & Predikat',
      tableActions: 'Aksi',
      editScore: 'Edit Nilai',
      newScoreLabel: 'Nilai Baru (0-100)',
      reasonLabel: 'Alasan Revisi / Pembaruan Nilai',
      saveAnchor: 'Simpan & Tanda Tangani (RS256)',
      selectClass: 'Pilih Kelas',
      selectSemester: 'Pilih Semester',
      selectSubject: 'Pilih Mata Pelajaran',
      subjectList: 'Daftar Mata Pelajaran',
      studentName: 'Nama Siswa',
      nisn: 'NISN',
      score: 'Nilai Angka (0-100)',
      gradeLetter: 'Predikat Huruf',
      predicate: 'Keterangan Capaian',
      signatureStatus: 'Status Digital Signature',
      signedByTeacher: 'Telah Ditandatangani Guru Pengampu',
      saveGrades: 'Simpan & Tanda Tangani Nilai',
      saving: 'Menyimpan & Menandatangani...',
      gradeUpdated: 'Nilai berhasil disimpan dan ditandatangani!',
      noPermission: 'Anda tidak memiliki hak untuk mengubah nilai.',
    },
    documents: {
      title: 'Manajemen Penerbitan Dokumen Resmi & Ijazah',
      subtitle: 'Workflow penerbitan berjenjang (Draft TU -> Multi-Signature Kepala Sekolah -> Pencatatan Blok EduChain).',
      preview: 'Pratinjau Dokumen Resmi',
      draftDocButton: 'Draft Dokumen Baru',
      uploadDraft: 'Unggah / Buat Draft Dokumen',
      empty: 'Belum ada dokumen yang tersedia.',
      pendingApprovalTab: 'Menunggu Otorisasi Kepsek',
      issuedTab: 'Dokumen Terbit (Di-Blockchain)',
      rejectedTab: 'Dokumen Ditolak / Direvisi',
      tableType: 'Tipe Dokumen',
      tableDoc: 'Nama & Tipe Dokumen',
      tableNumber: 'Nomor Dokumen',
      tableStudent: 'Penerima (Siswa)',
      tableHash: 'Digest SHA-256 Dokumen',
      tableStatus: 'Status Otorisasi',
      tableCreated: 'Tanggal Draft',
      tableActions: 'Aksi',
      statusIssued: 'Terbit Resmi',
      statusDraft: 'Draft TU',
      signIssue: 'Otorisasi & Terbitkan ke Blockchain',
      authorizeAndSign: 'Otorisasi & Tanda Tangan Kepsek',
      authorizing: 'Menandatangani & Menambang ke Ledger...',
      verifyOnChain: 'Verifikasi di Ledger',
      revokeDoc: 'Cabut / Batalkan',
      downloadPdf: 'Unduh PDF',
      multiSigNotice: 'Zero Trust Policy: Dokumen hanya sah setelah tanda tangan digital asimetris Kepala Sekolah terkonfirmasi di blockchain.',
    },
    dudi: {
      title: 'Portal Sertifikasi PKL Industri (DUDI)',
      subtitle: 'Penerbitan sertifikat Praktik Kerja Lapangan dengan co-signature ganda Mitra Industri & Sekolah.',
      activeInterns: 'Siswa Magang Aktif',
      completedCertificates: 'Sertifikat PKL Diterbitkan',
      issueNew: 'Terbitkan Sertifikat PKL',
      empty: 'Belum ada data sertifikat PKL yang diterbitkan.',
      tableTitle: 'Judul Sertifikat',
      tableStudent: 'Nama Siswa',
      tableScore: 'Nilai Akhir',
      tableStatus: 'Status Blockchain',
      tableActions: 'Aksi',
      internName: 'Nama Siswa Magang',
      internNisn: 'NISN Siswa',
      schoolName: 'Sekolah Asal',
      duration: 'Durasi PKL',
      companySupervisor: 'Pembimbing Industri',
      technicalScore: 'Nilai Kompetensi Teknis (60%)',
      softskillScore: 'Nilai Soft Skill & Disiplin (40%)',
      finalGrade: 'Nilai Akhir & Predikat',
      issueCertificate: 'Terbitkan Sertifikat PKL Resmi',
      issuing: 'Menerbitkan ke Blockchain...',
      coSignedNotice: 'Sertifikat ini diakui secara industri dan terdaftar dengan hash kriptografi di EduChain Consortium.',
    },
    blockchain: {
      title: 'EduChain Consortium Blockchain Explorer',
      subtitle: 'Transparansi ledger konsorsium terdesentralisasi dengan algoritma konsensus QBFT Proof-of-Authority.',
      refresh: 'Perbarui Status Rantai',
      networkStatus: 'Status Jaringan Konsorsium',
      consensusAlgorithm: 'Algoritma Konsensus',
      consensusMechanism: 'Mekanisme Konsensus',
      totalBlocks: 'Total Blok Tertambang',
      totalTransactions: 'Total Transaksi Dokumen',
      activeValidators: 'Node Validator Aktif',
      validatorNode: 'Node Validator',
      blockTime: 'Rata-rata Block Time',
      blockHistory: 'Riwayat Blok Rantai',
      blockDetail: 'Rincian Blok Terpilih',
      latestBlocks: 'Blok Terbaru dalam Ledger',
      blockHeight: 'Tinggi Blok',
      blockHash: 'Block Hash SHA-256',
      prevHash: 'Parent Hash',
      previousHash: 'Parent Block Hash',
      merkleRoot: 'Merkle Root Digest',
      txPayload: 'Payload Transaksi',
      selectBlock: 'Pilih blok untuk melihat detail transaksi',
      transactionsCount: 'Jumlah Transaksi',
      validatorNodes: 'Daftar Node Validator Konsorsium',
      nodeSchool: 'SMK Negeri 1 Educhain (Node Sekolah)',
      nodeDudi: 'PT Industri Nusantara Tech (Node DUDI)',
      nodeDisdik: 'Dinas Pendidikan Jawa Barat (Node Regulator)',
      nodeKemdikbud: 'Pusdatin Kemdikbudristek (Node Pusat)',
      verifyHashInBlock: 'Periksa Transaksi',
    },
    audit: {
      title: 'Sistem Audit Trail & Security Event Logs',
      subtitle: 'Pencatatan real-time terhadap seluruh aktivitas autentikasi, otorisasi RBAC, deteksi manipulasi, dan perubahan data.',
      empty: 'Tidak ada log aktivitas yang cocok dengan kriteria filter.',
      totalEvents: 'Total Aktivitas SIEM',
      criticalEvents: 'Insiden Kritis',
      warningEvents: 'Peringatan Keamanan',
      filterSeverity: 'Semua Severity',
      filterAction: 'Semua Tipe Event',
      tableTime: 'Waktu & Severity',
      tableEvent: 'Event Type & Endpoint',
      tableActor: 'Aktor & Role',
      tableRole: 'Role',
      tableAction: 'Aksi',
      tableIp: 'IP Address',
      tableSeverity: 'Severity',
      tableStatus: 'Status',
      tableDetails: 'Detail Peristiwa',
      exportJson: 'Ekspor JSON',
      exportLogs: 'Ekspor Log Audit',
    },
    tests: {
      title: 'Pusat Pengujian Keamanan & Integritas Nyata',
      subtitle: 'Eksekusi nyata terhadap kontrol RBAC/IDOR, SQLi, XSS, kebocoran secret, smart contract guard, audit nilai, dan deteksi manipulasi.',
      runAll: 'Jalankan Semua Pengujian Keamanan',
      running: 'Mengeksekusi Pengujian...',
      totalScenarios: 'Total Skenario Uji',
      passed: 'Lolos Pengujian',
      failed: 'Gagal Pengujian',
      integrityScore: 'Integritas Keamanan',
    },
    securityTests: {
      title: 'Live Penetration Testing & Zero Trust Audit',
      subtitle: 'Pengujian otomatis terhadap 20 vektor serangan siber dan integritas konsorsium blockchain.',
      runAllTests: 'Jalankan Semua Uji Penetrasi',
      runningTests: 'Menjalankan Suite Uji...',
      testResults: 'Hasil Uji Ketahanan Keamanan',
      passed: 'Lolos (Aman)',
      failed: 'Gagal (Rentan)',
      summaryScore: 'Skor Ketahanan Sistem',
      testCaseCol: 'Skenario Uji Keamanan',
      categoryCol: 'Kategori OWASP / Zero Trust',
      threatMitigationCol: 'Mitigasi & Kontrol Kriptografi',
      statusCol: 'Status Uji',
      executionLog: 'Log Eksekusi Pengujian',
    },
  },
  en: {
    common: {
      appName: 'SIA SMK EduChain',
      appSubtitle: 'Academic Information System & Blockchain-Based Verification',
      systemTag: 'Vocational Center of Excellence',
      zeroTrustBadge: 'Zero Trust & RS256 Active',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      search: 'Search data...',
      filter: 'Filter',
      status: 'Status',
      actions: 'Actions',
      verified: 'Verified Authentic',
      unverified: 'Unverified',
      active: 'Active',
      pending: 'Pending',
      graduated: 'Graduated',
      rejected: 'Rejected',
      download: 'Download',
      view: 'View',
      details: 'Details',
      copy: 'Copy',
      copied: 'Copied!',
      error: 'An Error Occurred',
      success: 'Success',
      login: 'Sign In',
      logout: 'Sign Out',
      loginToAccount: 'Sign In to Account',
      switchRole: 'Switch Role Access',
      backToHome: 'Back to Home',
      refresh: 'Refresh',
      print: 'Print Document',
      date: 'Date',
      all: 'All',
      language: 'Language',
      indonesian: 'Bahasa Indonesia',
      english: 'English',
    },
    nav: {
      verify: 'Public Verification',
      publicVerify: 'Public Diploma Verification',
      students: 'Students & Graduation',
      grades: 'Grade Management & Transcript',
      documents: 'Document & Diploma Management',
      dudi: 'Industry Partner Portal (DUDI)',
      blockchain: 'EduChain Explorer',
      audit: 'SIEM & Audit Trail',
      auditLogs: 'SIEM & Audit Trail',
      securityTests: 'Live Security Tests',
      academicPortal: 'Academic & Administration Portal',
      consortiumSecurity: 'Consortium & System Security',
      quickDemoAccount: 'Quick Demo Account Switcher',
      login: 'Sign In',
      logout: 'Sign Out',
    },
    roles: {
      KEPALA_SEKOLAH: 'School Principal',
      TU: 'Administration Staff',
      GURU: 'Teacher / Instructor',
      SISWA: 'Student',
      DUDI: 'Industry Partner (DUDI)',
      AUDITOR: 'Supervisory Auditor',
      GUEST: 'Guest / Verifier',
    },
    landing: {
      badge: 'Vocational Center of Excellence',
      tagline: 'Next-Gen Academic Security',
      title: 'Zero Trust & EduChain Academic Information System',
      subtitle: 'Tamper-Proof Diplomas & Transcripts with Decentralized Consortium Governance',
      heroDesc: 'Permanently guarantee graduation authenticity, academic transcripts, and competency certificates using RS256 asymmetric cryptography and multi-party consensus.',
      bullet1Title: 'Zero Trust Security (NIST SP 800-207)',
      bullet1Desc: 'No entity is trusted by default. Every request is verified with strict authentication, ephemeral JWT tokens, and fine-grained RBAC authorization.',
      bullet2Title: 'EduChain Blockchain Consortium (QBFT PoA)',
      bullet2Desc: 'Document hashes are permanently committed across 4 consortium nodes (School, Industry Partner, Regional Education Office, and Ministry of Education).',
      bullet3Title: 'Multi-Signature Principal Authorization',
      bullet3Desc: 'Diplomas are valid and recorded on-chain only after two-tier approval (Staff drafting followed by Principal RS256 digital signature).',
      bullet4Title: 'Real-Time SIEM Audit Trail & Forensics',
      bullet4Desc: 'Every authentication attempt, grade alteration, and issuance event is logged to a tamper-evident audit store with SHA-256 hash chaining.',
      stats1Value: '100%',
      stats1Label: 'Anti-Forgery Assurance',
      stats2Value: '4 Nodes',
      stats2Label: 'EduChain Consortium',
      stats3Value: '< 1 Sec',
      stats3Label: 'Public Verification',
      stats4Value: '20/20',
      stats4Label: 'Penetration Tests Passed',
      loginCardTitle: 'Sign In to Academic Portal',
      loginCardSubtitle: 'Select a demo role below or enter your institutional credentials:',
      identifierLabel: 'Institutional Email, Username, or NISN',
      identifierPlaceholder: 'e.g. principal@smk.sch.id or nisn: 0051234567',
      identifierHelp: 'Use registered email for staff/teachers or student NISN.',
      passwordLabel: 'Account Password',
      passwordPlaceholder: 'Enter your password...',
      rememberDevice: 'Trust this device for 30 days',
      rememberDeviceHelp: 'Saves a secure cryptographic device token to bypass secondary MFA challenges for 30 days.',
      forgotPassword: 'Forgot password?',
      loginButton: 'Sign In to System',
      authenticating: 'Verifying Credentials...',
      quickLoginTitle: 'Instant Demo Accounts (1-Click)',
      quickLoginDesc: 'Click any role badge below to pre-fill credentials automatically:',
      verifyPublicCta: 'Need to Verify a Diploma or Certificate?',
      verifyPublicDesc: 'The general public, universities, and corporate recruiters can verify document validity without logging in.',
      verifyButton: 'Open Public Verification Portal',
      securityFooter: 'Secured by Zero Trust Policy, RS256 Asymmetric Cryptography, and EduChain Consortium.',
    },
    mfa: {
      title: 'Multi-Factor MFA Verification',
      subtitle: 'Zero Trust Security Mandatory Policy',
      modalTitle: 'Two-Factor Authentication (MFA TOTP)',
      modalSubtitle: 'Enter the 6-digit time-based security code (RFC 6238) from your authenticator app.',
      alertInfo: 'Zero Trust protocol requires secondary multi-factor verification for elevated administrative roles.',
      codeLabel: '6-Digit Authentication Code',
      totpLabel: '6-Digit Verification Code',
      totpPlaceholder: '000000',
      verifyButton: 'Confirm & Sign In',
      verifyBtn: 'Verify & Sign In',
      verifying: 'Verifying Code...',
      verified: 'Credentials Verified!',
      enterCode: 'Please enter the 6-digit authentication code.',
      refreshIn: 'Refreshes in',
      demoKeyLabel: 'Secret Key:',
      demoCurrentCodeLabel: 'Current Active TOTP Code:',
      trustDeviceCheckbox: 'Trust this device for 30 days (Bypass MFA)',
      trustDeviceHelp: 'Stores a unique cryptographically signed device token in this browser for seamless security.',
      invalidCode: 'Invalid or expired MFA code.',
    },
    verify: {
      title: 'Public Diploma & Transcript Verification Portal',
      subtitle: 'Instantly and mathematically validate vocational diplomas and certificates against the EduChain Blockchain Consortium.',
      searchPlaceholder: 'Enter document SHA-256 hash or diploma registration number...',
      searchButton: 'Verify Document',
      hashLabel: 'Or Enter Document SHA-256 Digest:',
      uploadInstruction: 'Click to choose or drag & drop PDF / Diploma / Certificate file here',
      zeroUploadNotice: 'Zero-Knowledge: Files are hashed in your browser; the actual file is never uploaded to any server.',
      verifying: 'Verifying Document on Consortium Ledger...',
      validBadge: 'DOCUMENT OFFICIALLY VERIFIED AS AUTHENTIC',
      invalidBadge: 'WARNING: UNREGISTERED / FALSIFIED DOCUMENT',
      invalidTitle: 'Document Integrity Not Verified on Blockchain',
      invalidDesc: 'This document hash or registration number was NOT found on the EduChain consortium ledger. This indicates potential forgery, alteration, or that it was never officially issued.',
      orManualHash: 'Or Enter SHA-256 Hash Manually',
      orScanQr: 'Or drag & drop document file or scan official QR code',
      quickExamples: 'Example Registered Hashes:',
      demoHash1: 'Budi Pratama Diploma (TKJ)',
      demoHash2: 'Siti Nurhaliza Diploma (RPL)',
      demoHash3: 'PT Industri Tech Internship Certificate',
      resultValidTitle: 'DOCUMENT DECLARED GENUINE & OFFICIALLY REGISTERED',
      resultValidSubtitle: 'Permanently recorded in the EduChain Consortium Blockchain under multi-validator consensus.',
      resultInvalidTitle: 'DOCUMENT NOT FOUND OR HAS BEEN ALTERED',
      resultInvalidSubtitle: 'Document hash does not match any consortium blockchain records.',
      docNumber: 'Document Number',
      studentName: 'Student Full Name',
      nisn: 'National Student Identification (NISN)',
      school: 'Issuing Institution',
      major: 'Vocational Major',
      issuer: 'Issuer Authority',
      issueDate: 'Issued Date',
      issuedAt: 'Issued Date',
      authorizedBy: 'Authorized By (Digital Signature)',
      txHash: 'Transaction Hash (EduChain)',
      blockNumber: 'Block Height',
      consensusStatus: 'Consensus Status',
      viewCertificate: 'View Digital Document Preview',
      tamperProofProof: 'SHA-256 Cryptographic Proof',
    },
    students: {
      title: 'Student Master Data & Graduation Records',
      subtitle: 'Manage student records, NISN, classes, and graduation status for official credential issuance.',
      totalStudents: 'Total Registered Students',
      activeStudents: 'Active Students',
      graduatedStudents: 'Graduated Students',
      filterClass: 'All Classes',
      filterMajor: 'All Majors',
      searchPlaceholder: 'Search by student name, NISN, or class...',
      allClasses: 'All Classes',
      allStatuses: 'All Graduation Statuses',
      empty: 'No student records match the selected filter.',
      viewDetail: 'Student Details',
      tableNisn: 'NISN / Student ID',
      tableName: 'Full Name',
      tableClass: 'Class',
      tableMajor: 'Vocational Major',
      tableStatus: 'Student Status',
      tableGraduationYear: 'Graduation Year',
      tableActions: 'Actions',
      viewProfile: 'View Profile',
      issueDoc: 'Issue Diploma',
      gradStatusActive: 'Active Student',
      gradStatusGraduated: 'Graduated',
      gradStatusPending: 'Pending Verification',
      statusActive: 'Active Student',
      statusGraduated: 'Graduated',
      statusPending: 'Pending Verification',
    },
    grades: {
      title: 'Student Grade Management & Transcripts',
      subtitle: 'Subject grade tracking secured with subject teacher asymmetric digital signatures (RS256).',
      tabList: 'Student Grade List',
      tabAudit: 'Grade Change Audit Trail',
      empty: 'No grade records match the selected class & semester filter.',
      tableStudent: 'Student Name & NISN',
      tableSubject: 'Subject',
      tableSemester: 'Semester',
      tableTeacher: 'Teacher',
      tableScore: 'Score & Predicate',
      tableActions: 'Actions',
      editScore: 'Edit Score',
      newScoreLabel: 'New Score (0-100)',
      reasonLabel: 'Reason for Revision / Update',
      saveAnchor: 'Save & Sign (RS256)',
      selectClass: 'Select Class',
      selectSemester: 'Select Semester',
      selectSubject: 'Select Subject',
      subjectList: 'Subject List',
      studentName: 'Student Name',
      nisn: 'NISN',
      score: 'Numeric Score (0-100)',
      gradeLetter: 'Letter Grade',
      predicate: 'Competency Achievement',
      signatureStatus: 'Digital Signature Status',
      signedByTeacher: 'Signed by Subject Teacher',
      saveGrades: 'Save & Sign Grades',
      saving: 'Saving & Digitally Signing...',
      gradeUpdated: 'Grades successfully saved and signed!',
      noPermission: 'You do not have permission to modify grades.',
    },
    documents: {
      title: 'Official Document & Diploma Issuance Management',
      subtitle: 'Multi-stage approval workflow (Staff Draft -> Principal Multi-Sig -> EduChain Blockchain Commitment).',
      preview: 'Preview Official Document',
      draftDocButton: 'Draft New Document',
      uploadDraft: 'Upload / Draft Document',
      empty: 'No documents available.',
      pendingApprovalTab: 'Pending Principal Authorization',
      issuedTab: 'Issued Documents (On-Chain)',
      rejectedTab: 'Rejected / Revision Required',
      tableType: 'Document Type',
      tableDoc: 'Document Name & Type',
      tableNumber: 'Document Number',
      tableStudent: 'Recipient (Student)',
      tableHash: 'SHA-256 Digest',
      tableStatus: 'Authorization Status',
      tableCreated: 'Drafted Date',
      tableActions: 'Actions',
      statusIssued: 'Officially Issued',
      statusDraft: 'Staff Draft',
      signIssue: 'Authorize & Issue to Blockchain',
      authorizeAndSign: 'Authorize & Sign (Principal)',
      authorizing: 'Signing & Committing to Ledger...',
      verifyOnChain: 'Verify On-Chain',
      revokeDoc: 'Revoke / Invalidate',
      downloadPdf: 'Download PDF',
      multiSigNotice: 'Zero Trust Policy: Documents are legally valid only after the Principal RS256 signature is verified on-chain.',
    },
    dudi: {
      title: 'Industry Partner Internship Portal (DUDI)',
      subtitle: 'Industrial internship certificate issuance with dual co-signatures between Industry & School.',
      activeInterns: 'Active Interns',
      completedCertificates: 'Internship Certificates Issued',
      issueNew: 'Issue Internship Certificate',
      empty: 'No internship certificates issued yet.',
      tableTitle: 'Certificate Title',
      tableStudent: 'Student Name',
      tableScore: 'Final Score',
      tableStatus: 'Blockchain Status',
      tableActions: 'Actions',
      internName: 'Intern Student Name',
      internNisn: 'Student NISN',
      schoolName: 'Origin School',
      duration: 'Internship Duration',
      companySupervisor: 'Industry Mentor',
      technicalScore: 'Technical Competency (60%)',
      softskillScore: 'Soft Skills & Discipline (40%)',
      finalGrade: 'Final Grade & Predicate',
      issueCertificate: 'Issue Official Internship Certificate',
      issuing: 'Committing to Blockchain...',
      coSignedNotice: 'This certificate is industry-recognized and permanently cryptographically registered on EduChain.',
    },
    blockchain: {
      title: 'EduChain Consortium Blockchain Explorer',
      subtitle: 'Decentralized consortium ledger transparency with QBFT Proof-of-Authority consensus algorithm.',
      refresh: 'Refresh Chain State',
      networkStatus: 'Consortium Network Status',
      consensusAlgorithm: 'Consensus Algorithm',
      consensusMechanism: 'Consensus Mechanism',
      totalBlocks: 'Total Mined Blocks',
      totalTransactions: 'Total Document Transactions',
      activeValidators: 'Active Validator Nodes',
      validatorNode: 'Validator Node',
      blockTime: 'Average Block Time',
      blockHistory: 'Chain Block History',
      blockDetail: 'Selected Block Details',
      latestBlocks: 'Latest Blocks on Ledger',
      blockHeight: 'Block Height',
      blockHash: 'SHA-256 Block Hash',
      prevHash: 'Parent Hash',
      previousHash: 'Parent Block Hash',
      merkleRoot: 'Merkle Root Digest',
      txPayload: 'Transaction Payload',
      selectBlock: 'Select a block to view transaction payload',
      transactionsCount: 'Transaction Count',
      validatorNodes: 'Consortium Validator Node Directory',
      nodeSchool: 'SMK Negeri 1 Educhain (School Node)',
      nodeDudi: 'PT Industri Nusantara Tech (DUDI Node)',
      nodeDisdik: 'West Java Education Board (Regulator Node)',
      nodeKemdikbud: 'Ministry of Education Center (National Node)',
      verifyHashInBlock: 'Inspect Transaction',
    },
    audit: {
      title: 'SIEM Audit Trail & Security Event Logs',
      subtitle: 'Real-time tamper-evident event logging for authentication, RBAC authorization, tamper detection, and ledger state changes.',
      empty: 'No activity logs match the selected filter criteria.',
      totalEvents: 'Total SIEM Events',
      criticalEvents: 'Critical Incidents',
      warningEvents: 'Security Warnings',
      filterSeverity: 'All Severity Levels',
      filterAction: 'All Event Types',
      tableTime: 'Timestamp & Severity',
      tableEvent: 'Event Type & Endpoint',
      tableActor: 'Actor & Role',
      tableRole: 'Role',
      tableAction: 'Action',
      tableIp: 'IP Address',
      tableSeverity: 'Severity',
      tableStatus: 'Status',
      tableDetails: 'Event Details',
      exportJson: 'Export JSON',
      exportLogs: 'Export Audit Logs',
    },
    tests: {
      title: 'Live Security & Cryptographic Integrity Verification Suite',
      subtitle: 'Real automated test execution against RBAC/IDOR controls, SQLi, XSS, secret exposure, smart contract guards, grade audit, and tamper detection.',
      runAll: 'Execute All Security & Penetration Tests',
      running: 'Executing Security Test Suite...',
      totalScenarios: 'Total Test Scenarios',
      passed: 'Tests Passed',
      failed: 'Tests Failed',
      integrityScore: 'Security Integrity Score',
    },
    securityTests: {
      title: 'Live Penetration Testing & Zero Trust Audit',
      subtitle: 'Automated test execution across 20 cyber attack vectors and blockchain consortium integrity controls.',
      runAllTests: 'Run Full Penetration Test Suite',
      runningTests: 'Executing Test Suite...',
      testResults: 'Security Resilience Results',
      passed: 'Passed (Secure)',
      failed: 'Failed (Vulnerable)',
      summaryScore: 'System Resilience Score',
      testCaseCol: 'Security Test Scenario',
      categoryCol: 'OWASP / Zero Trust Category',
      threatMitigationCol: 'Cryptographic Mitigation',
      statusCol: 'Test Status',
      executionLog: 'Execution Audit Log',
    },
  },
};
