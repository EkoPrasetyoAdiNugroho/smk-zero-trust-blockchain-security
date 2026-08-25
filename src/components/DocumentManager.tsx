import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Upload,
  ShieldCheck,
  Award,
  Clock,
  Eye,
  RefreshCw,
  Plus,
  AlertCircle,
  Cpu,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
  FileText,
  Search,
  Check,
  Info,
} from 'lucide-react';
import { api, calculateClientSha256, readFileAsArrayBuffer } from '../api';
import { DocumentRecord, User, Student, UserRole } from '../types';
import { AnimatedCheckmark } from './AnimatedCheckmark';
import { useLanguage } from '../i18n/LanguageContext';

interface DocumentManagerProps {
  currentUser: User | null;
  onOpenPreview: (doc: DocumentRecord) => void;
  onVerifyInPortal: (hash: string) => void;
  onQuickSwitchRole?: (role: UserRole) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  currentUser,
  onOpenPreview,
  onVerifyInPortal,
  onQuickSwitchRole,
}) => {
  const { t, language } = useLanguage();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'DRAFT' | 'ISSUED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState<DocumentRecord | null>(null);
  const [totpInput, setTotpInput] = useState('');
  const [signing, setSigning] = useState(false);
  const [signVerified, setSignVerified] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  // Upload Form State (TU ONLY)
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [docType, setDocType] = useState('IJAZAH');
  const [docNumber, setDocNumber] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [computedFileHash, setComputedFileHash] = useState<string | null>(null);
  const [calculatingHash, setCalculatingHash] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [docsRes, studentsRes] = await Promise.all([
        api.getDocuments(),
        api.getStudents(),
      ]);
      if (docsRes.ok && docsRes.data?.data) {
        setDocuments(docsRes.data.data);
      } else if (!docsRes.ok) {
        setFetchError(docsRes.message || (language === 'id' ? 'Gagal memuat daftar dokumen.' : 'Failed to load document list.'));
      }
      if (studentsRes.ok && studentsRes.data?.data) {
        setStudents(studentsRes.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setFetchError(language === 'id' ? 'Gagal terhubung ke server.' : 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [currentUser]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !docNumber || !docTitle) {
      setUploadError(language === 'id' ? 'Lengkapi semua kolom formulir.' : 'Please fill in all form fields.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      let calculatedHash: string | undefined;

      if (uploadFile) {
        const buffer = await readFileAsArrayBuffer(uploadFile);
        calculatedHash = await calculateClientSha256(buffer);
      }

      const res = await api.uploadDocument({
        documentType: docType,
        studentId: selectedStudentId,
        documentNumber: docNumber,
        title: docTitle,
        fileName: uploadFile?.name,
        fileSize: uploadFile?.size,
        fileContent: calculatedHash,
      });

      if (res.ok && res.data?.data) {
        setShowUploadModal(false);
        setDocNumber('');
        setDocTitle('');
        setUploadFile(null);
        setComputedFileHash(null);
        fetchDocs();
      } else {
        setUploadError(res.message || (language === 'id' ? 'Gagal mengunggah draf dokumen.' : 'Failed to upload document draft.'));
      }
    } catch (err: any) {
      setUploadError(err.message || (language === 'id' ? 'Terjadi kesalahan sistem.' : 'System error occurred.'));
    } finally {
      setUploading(false);
    }
  };

  const handleAuthorizeAndIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSignModal) return;

    setSigning(true);
    setSignError(null);

    try {
      const res = await api.issueDocumentOnChain(showSignModal.id, totpInput);
      if (res.ok && res.data?.success) {
        setSignVerified(true);
        setTimeout(() => {
          setShowSignModal(null);
          setTotpInput('');
          setSignVerified(false);
          fetchDocs();
        }, 950);
      } else {
        setSignError(res.message || (language === 'id' ? 'Gagal menerbitkan sertifikat on-chain.' : 'Failed to issue certificate on-chain.'));
      }
    } catch (err: any) {
      setSignError(err.message || (language === 'id' ? 'Terjadi kesalahan penerbitan.' : 'An issuance error occurred.'));
    } finally {
      setSigning(false);
    }
  };

  const isKepsek = currentUser?.role === 'KEPALA_SEKOLAH';
  const isTu = currentUser?.role === 'TU';
  const isDudi = currentUser?.role === 'DUDI';
  const isSiswa = currentUser?.role === 'SISWA';

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    if (activeTabFilter === 'DRAFT' && doc.status !== 'DRAFT') return false;
    if (activeTabFilter === 'ISSUED' && doc.status !== 'ISSUED') return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.studentName.toLowerCase().includes(q) ||
        doc.studentNisn.toLowerCase().includes(q) ||
        doc.documentNumber.toLowerCase().includes(q) ||
        doc.fileHash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const draftCount = documents.filter((d) => d.status === 'DRAFT').length;
  const issuedCount = documents.filter((d) => d.status === 'ISSUED').length;

  return (
    <div id="document-manager-section" className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>{t.documents.title}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'id'
              ? 'Penerbitan Berjenjang & Segregation of Duties: Draf Staf TU → Otentikasi & Tanda Tangan Digital Kepala Sekolah → Smart Contract Minting'
              : 'Multi-Tier Pipeline & Segregation of Duties: TU Staff Draft → Principal RS256 Authorization → Smart Contract Minting'}
          </p>
        </div>

        {/* Action Button: ONLY Staf TU is permitted to create/upload drafts */}
        {isTu ? (
          <button
            id="create-draft-doc-btn"
            onClick={() => {
              setShowUploadModal(true);
              setUploadError(null);
              setDocNumber(`SMK-TKJ/2026/${Math.floor(100 + Math.random() * 900)}-IJZ`);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'id' ? '+ Unggah / Buat Draf Dokumen' : '+ Upload / Create Draft Document'}</span>
          </button>
        ) : isKepsek ? (
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center space-x-2 self-start sm:self-auto shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{language === 'id' ? 'Otorisasi & Pengesahan Digital Kepala Sekolah' : 'Principal Digital Authorization & Signing'}</span>
          </div>
        ) : null}
      </div>

      {/* 5-STEP WORKFLOW PIPELINE VISUALIZATION (According to Soal Tugas Akhir) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'id' ? 'Alur Kerja Smart Contract Penerbitan Ijazah (Standard Operasional)' : 'Smart Contract Graduation Issuance Workflow'}</span>
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {language === 'id' ? 'SOP 5 Tahap Zero Trust' : '5-Step Zero Trust SOP'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs">
          {/* Step 1: Staf TU */}
          <div className={`p-3 rounded-xl border transition-all ${
            isTu
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                1
              </span>
              <span className="text-[10px] font-bold text-blue-700 uppercase">{language === 'id' ? 'Staf TU' : 'TU Staff'}</span>
            </div>
            <p className="font-bold text-slate-800 text-[11px]">{language === 'id' ? 'Input Data & Draf' : 'Input Data & Draft'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              {language === 'id'
                ? 'Staf TU menginput data kelulusan & mengunggah berkas PDF ijazah.'
                : 'TU Staff enters graduation data & uploads draft PDF.'}
            </p>
          </div>

          {/* Step 2: Kepala Sekolah */}
          <div className={`p-3 rounded-xl border transition-all ${
            isKepsek
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center">
                2
              </span>
              <span className="text-[10px] font-bold text-amber-700 uppercase">{language === 'id' ? 'Kepsek' : 'Principal'}</span>
            </div>
            <p className="font-bold text-slate-800 text-[11px]">{language === 'id' ? 'Otentikasi & Signing' : 'Authentication & Sign'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              {language === 'id'
                ? 'Kepala Sekolah verifikasi & tandatangani digital via Private Key Cloud KMS.'
                : 'Principal verifies & signs digitally via Cloud KMS Private Key.'}
            </p>
          </div>

          {/* Step 3: Hashing SHA-256 */}
          <div className="p-3 rounded-xl border bg-slate-50/70 border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center">
                3
              </span>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Engine</span>
            </div>
            <p className="font-bold text-slate-800 text-[11px]">{language === 'id' ? 'Hashing Dokumen' : 'Document Hashing'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              {language === 'id'
                ? 'Sistem membangkitkan digest kriptografi SHA-256 unik dari berkas PDF.'
                : 'Engine generates unique 256-bit SHA-256 cryptographic digest.'}
            </p>
          </div>

          {/* Step 4: Minting Ledger */}
          <div className="p-3 rounded-xl border bg-slate-50/70 border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                4
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Blockchain</span>
            </div>
            <p className="font-bold text-slate-800 text-[11px]">{language === 'id' ? 'Minting on Ledger' : 'Minting on Ledger'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              {language === 'id'
                ? 'Hash & metadata kelulusan dicatat permanen di Smart Contract EduChain.'
                : 'Hash & metadata recorded permanently in EduChain Smart Contract.'}
            </p>
          </div>

          {/* Step 5: Verifikasi Publik */}
          <div className="p-3 rounded-xl border bg-slate-50/70 border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white font-bold text-[10px] flex items-center justify-center">
                5
              </span>
              <span className="text-[10px] font-bold text-cyan-700 uppercase">{language === 'id' ? 'Publik' : 'Public'}</span>
            </div>
            <p className="font-bold text-slate-800 text-[11px]">{language === 'id' ? 'Verifikasi Mandiri' : 'Self-Verification'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              {language === 'id'
                ? 'Perusahaan & universitas memverifikasi PDF secara instan (<1 detik).'
                : 'Companies & universities verify PDF independently in real-time.'}
            </p>
          </div>
        </div>
      </div>

      {/* Role Segregation Notice Banner */}
      {isKepsek && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start space-x-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-950">
              {language === 'id' ? 'Penegakan Prinsip Pemisahan Tugas (Segregation of Duties / Four-Eyes Principle):' : 'Segregation of Duties Enforcement (Four-Eyes Principle):'}
            </p>
            <p className="text-amber-800 leading-relaxed">
              {language === 'id'
                ? 'Sebagai Kepala Sekolah, Anda bertindak sebagai Otorisator Tertinggi. Anda dapat memeriksa draf yang diajukan oleh Staf TU di bawah dan membubuhkan Tanda Tangan Digital RS256 (Cloud KMS) + MFA untuk mengesahkan ijazah ke blockchain. Pembuatan draf baru tidak dapat dilakukan langsung oleh Kepala Sekolah untuk mencegah penerbitan sepihak.'
                : 'As the Principal, you act as the Executive Authorizer. You verify drafts prepared by TU Staff below and apply RS256 Digital Signatures + MFA to issue diplomas on-chain. Principal cannot create drafts directly to prevent unilateral issuance.'}
            </p>
          </div>
        </div>
      )}

      {isTu && (
        <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl text-blue-900 text-xs flex items-start space-x-3 shadow-xs">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-blue-950">
              {language === 'id' ? 'Alur Penerbitan Dokumen Resmi:' : 'Official Document Issuance Workflow:'}
            </p>
            <p className="text-blue-800 leading-relaxed">
              {language === 'id'
                ? 'Anda berwenang menginput data kelulusan dan membuat draf ijazah/transkrip baru menggunakan tombol "+ Unggah / Buat Draf Dokumen". Setelah dibuat, draf akan berstatus DRAFT dan otomatis diteruskan ke antrean otorisasi Kepala Sekolah.'
                : 'You are authorized to input graduation data and create new diploma/transcript drafts. Once saved, drafts are queued for Principal authorization and digital signing.'}
            </p>
          </div>
        </div>
      )}

      {fetchError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl w-fit">
          <button
            onClick={() => setActiveTabFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTabFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'id' ? 'Semua Dokumen' : 'All Documents'} ({documents.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTabFilter === 'DRAFT'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Menunggu Otorisasi' : 'Pending Authorization'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTabFilter === 'DRAFT' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {draftCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTabFilter('ISSUED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTabFilter === 'ISSUED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Terbit On-Chain' : 'Issued On-Chain'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTabFilter === 'ISSUED' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {issuedCount}
            </span>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'id' ? 'Cari judul, nama, NISN, no dok...' : 'Search title, name, NISN...'}
            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs font-medium"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">{t.common.loading}...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            {searchTerm ? (language === 'id' ? 'Tidak ada dokumen yang sesuai dengan pencarian.' : 'No matching documents found.') : t.documents.empty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t.documents.tableDoc}</th>
                  <th className="px-5 py-3.5">{t.documents.tableStudent}</th>
                  <th className="px-5 py-3.5">{t.documents.tableStatus}</th>
                  <th className="px-5 py-3.5">{t.documents.tableHash}</th>
                  <th className="px-5 py-3.5 text-right">{t.documents.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDocuments.map((doc) => {
                  const isIssued = doc.status === 'ISSUED';
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{doc.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">No: {doc.documentNumber}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{doc.studentName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">NISN: {doc.studentNisn}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        {isIssued ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t.documents.statusIssued} ({language === 'id' ? `Blok #${doc.blockNumber || 1}` : `Block #${doc.blockNumber || 1}`})</span>
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{language === 'id' ? 'Menunggu Otorisasi' : 'Pending Authorization'}</span>
                            </span>
                            <p className="text-[10px] text-amber-700">
                              {language === 'id' ? 'Menunggu tanda tangan digital' : 'Awaiting digital signature'}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                        <span className="truncate block w-32 font-mono text-[11px]" title={doc.fileHash}>
                          {doc.fileHash.slice(0, 14)}...
                        </span>
                        <button
                          onClick={() => onVerifyInPortal(doc.fileHash)}
                          className="text-[10px] text-blue-600 hover:underline font-sans font-medium cursor-pointer"
                        >
                          {language === 'id' ? 'Uji Verifikasi' : 'Test Verify'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          id={`preview-doc-btn-${doc.id}`}
                          onClick={() => onOpenPreview(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center space-x-1 border border-slate-200 shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t.documents.preview}</span>
                        </button>

                        {/* Kepsek Signing Action */}
                        {!isIssued && isKepsek && (
                          <button
                            id={`sign-doc-btn-${doc.id}`}
                            onClick={() => {
                              setShowSignModal(doc);
                              setSignError(null);
                              setTotpInput('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{language === 'id' ? 'Otorisasi & Sahkan' : 'Authorize & Sign'}</span>
                          </button>
                        )}

                        {/* TU waiting indicator */}
                        {!isIssued && isTu && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200">
                            {language === 'id' ? 'Menunggu Otorisasi' : 'Pending Authorization'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Draft Modal (EXCLUSIVE TO STAF TU) */}
      {showUploadModal && isTu && (
        <div id="upload-doc-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div id="upload-doc-modal-container" className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>{language === 'id' ? 'Input Data & Draf Ijazah Baru' : 'Input Data & Create New Draft'}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Langkah 1 dari 5
              </span>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  {language === 'id' ? 'Pilih Siswa Penerima Kelulusan' : 'Select Recipient Student'}
                </label>
                <select
                  id="select-student-doc"
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const s = students.find((st) => st.id === e.target.value);
                    if (s) {
                      setDocTitle(`Ijazah Kelulusan SMK — ${s.fullName} (${s.className})`);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  required
                >
                  <option value="">-- {language === 'id' ? 'Pilih Siswa' : 'Select Student'} --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} (NISN: {st.nisn}) — {st.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">
                    {language === 'id' ? 'Jenis Dokumen' : 'Document Type'}
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option value="IJAZAH">{language === 'id' ? 'Ijazah Kelulusan' : 'Graduation Diploma'}</option>
                    <option value="TRANSKRIP">{language === 'id' ? 'Transkrip Nilai' : 'Academic Transcript'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">
                    {language === 'id' ? 'Nomor Dokumen Resmi' : 'Document Number'}
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  {language === 'id' ? 'Judul Dokumen' : 'Document Title'}
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  {language === 'id' ? 'File Dokumen PDF (Opsional)' : 'PDF Document File (Optional)'}
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null;
                    setUploadFile(file);
                    if (file) {
                      setCalculatingHash(true);
                      try {
                        const buffer = await readFileAsArrayBuffer(file);
                        const hash = await calculateClientSha256(buffer);
                        setComputedFileHash(hash);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setCalculatingHash(false);
                      }
                    } else {
                      setComputedFileHash(null);
                    }
                  }}
                  className="w-full text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
                {calculatingHash && (
                  <p className="text-[11px] text-blue-600 mt-1.5 flex items-center space-x-1 font-mono">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>{language === 'id' ? 'Menghitung sidik jari SHA-256...' : 'Calculating SHA-256 fingerprint...'}</span>
                  </p>
                )}
                {computedFileHash && !calculatingHash && (
                  <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-blue-800 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'id' ? 'Hash Dokumen Asli Terdeteksi (SHA-256):' : 'Original Document SHA-256 Detected:'}</span>
                    </div>
                    <p className="font-mono text-[11px] text-blue-900 break-all select-all font-bold">
                      {computedFileHash}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                <span className="font-bold text-slate-800">{language === 'id' ? 'Catatan Alur:' : 'Flow Note:'} </span>
                {language === 'id'
                  ? 'Dokumen yang Anda simpan akan berstatus DRAFT. Kepala Sekolah akan menerima notifikasi untuk memeriksa dan membubuhkan Tanda Tangan Digital RS256 sebelum dicatat di blockchain.'
                  : 'Saved document will be stored as DRAFT. The Principal will review and apply the RS256 Digital Signature before blockchain minting.'}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  id="submit-draft-doc-btn"
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{language === 'id' ? 'Simpan Draf Dokumen' : 'Save Draft Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kepala Sekolah Authorization & Digital Signature Modal (EXCLUSIVE TO KEPALA SEKOLAH) */}
      {showSignModal && isKepsek && (
        <div id="sign-doc-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div id="sign-doc-modal-container" className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'id' ? 'Otorisasi Kelulusan & TTD Digital Kepsek' : 'Principal Authorization & Digital Sign'}
                </h3>
                <p className="text-[11px] text-amber-700 font-semibold">
                  {language === 'id' ? 'Langkah 2: Private Key Cloud KMS (RS256) + Smart Contract' : 'Step 2: Cloud KMS Private Key (RS256) + Smart Contract'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <p className="text-slate-500 font-medium">{language === 'id' ? 'Draf Dokumen yang Diajukan TU:' : 'Draft Submitted by TU:'}</p>
              <p className="font-bold text-slate-900 text-sm">{showSignModal.title}</p>
              <p className="font-mono text-blue-600 font-semibold">NISN: {showSignModal.studentNisn}</p>
              <p className="font-mono text-slate-500 truncate" title={showSignModal.fileHash}>
                Hash SHA-256: {showSignModal.fileHash}
              </p>
            </div>

            {signError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{signError}</span>
              </div>
            )}

            <form onSubmit={handleAuthorizeAndIssue} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {language === 'id'
                    ? 'Konfirmasi Kode Keamanan TOTP / MFA:'
                    : 'Confirm TOTP / MFA Security Code:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={totpInput}
                    onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-mono text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(null)}
                  disabled={signVerified}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  id="confirm-sign-issue-btn"
                  type="submit"
                  disabled={signing || signVerified}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
                    signVerified
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-[1.02]'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 disabled:opacity-50'
                  }`}
                >
                  {signVerified ? (
                    <>
                      <AnimatedCheckmark size={18} strokeColor="#FFFFFF" className="w-4 h-4" />
                      <span className="font-semibold tracking-wide">
                        {language === 'id' ? 'Kredensial & TTD Terverifikasi!' : 'Credentials & Signature Verified!'}
                      </span>
                    </>
                  ) : signing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'id' ? 'Menandatangani & Minting...' : 'Signing & Minting...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'id' ? 'Tandatangani & Minting ke Ledger' : 'Sign & Mint to Ledger'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
