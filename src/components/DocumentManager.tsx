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
} from 'lucide-react';
import { api, calculateClientSha256, readFileAsArrayBuffer } from '../api';
import { DocumentRecord, User, Student } from '../types';
import { AnimatedCheckmark } from './AnimatedCheckmark';

interface DocumentManagerProps {
  currentUser: User | null;
  onOpenPreview: (doc: DocumentRecord) => void;
  onVerifyInPortal: (hash: string) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  currentUser,
  onOpenPreview,
  onVerifyInPortal,
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState<DocumentRecord | null>(null);
  const [totpInput, setTotpInput] = useState('');
  const [signing, setSigning] = useState(false);
  const [signVerified, setSignVerified] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  // Upload Form State
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
        setFetchError(docsRes.message || 'Gagal memuat daftar dokumen.');
      }
      if (studentsRes.ok && studentsRes.data?.data) {
        setStudents(studentsRes.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setFetchError('Gagal terhubung ke server.');
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
      setUploadError('Lengkapi semua kolom formulir.');
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
        setUploadError(res.message || 'Gagal mengunggah draf dokumen.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan sistem.');
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
        setSignError(res.message || 'Gagal menerbitkan sertifikat on-chain.');
      }
    } catch (err: any) {
      setSignError(err.message || 'Terjadi kesalahan penerbitan.');
    } finally {
      setSigning(false);
    }
  };

  const isKepsek = currentUser?.role === 'KEPALA_SEKOLAH';
  const isTu = currentUser?.role === 'TU';

  return (
    <div id="document-manager-section" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>Manajemen Ijazah, Transkrip & Otorisasi Digital</span>
          </h2>
          <p className="text-xs text-slate-500">
            Alur penerbitan: Draf TU → Otorisasi & Tanda Tangan Digital Kepala Sekolah → Smart Contract Minting
          </p>
        </div>

        {(isTu || isKepsek) && (
          <button
            id="create-draft-doc-btn"
            onClick={() => {
              setShowUploadModal(true);
              setUploadError(null);
              // auto generate document number sample
              setDocNumber(`SMK-TKJ/2026/${Math.floor(100 + Math.random() * 900)}-IJZ`);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Draf Dokumen Baru</span>
          </button>
        )}
      </div>

      {fetchError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Memuat dokumen...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">Belum ada dokumen yang terdaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Jenis & Nomor Dokumen</th>
                  <th className="px-5 py-3.5">Nama Siswa / NISN</th>
                  <th className="px-5 py-3.5">Status Penerbitan</th>
                  <th className="px-5 py-3.5">Hash SHA-256</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {documents.map((doc) => {
                  const isIssued = doc.status === 'ISSUED';
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <Award className="w-3.5 h-3.5 text-blue-600" />
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
                            <span>ISSUED (Blok #{doc.blockNumber || 1})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>DRAFT (Menunggu TTD Kepsek)</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                        <span className="truncate block w-32 font-mono" title={doc.fileHash}>
                          {doc.fileHash.slice(0, 14)}...
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          id={`preview-doc-btn-${doc.id}`}
                          onClick={() => onOpenPreview(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center space-x-1 border border-slate-200 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Pratinjau</span>
                        </button>

                        {!isIssued && isKepsek && (
                          <button
                            id={`sign-doc-btn-${doc.id}`}
                            onClick={() => {
                              setShowSignModal(doc);
                              setSignError(null);
                              setTotpInput('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all inline-flex items-center space-x-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Setujui & TTD On-Chain</span>
                          </button>
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

      {/* Upload Draft Modal */}
      {showUploadModal && (
        <div id="upload-doc-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div id="upload-doc-modal-container" className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800 relative">
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Unggah Draf Dokumen Kelulusan Baru</span>
            </h3>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Pilih Siswa Penerima</label>
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
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} (NISN: {st.nisn}) — {st.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Jenis Dokumen</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option value="IJAZAH">Ijazah Kelulusan</option>
                    <option value="TRANSKRIP">Transkrip Nilai</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Nomor Dokumen</label>
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
                <label className="font-bold text-slate-700 mb-1 block">Judul Dokumen</label>
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
                  File Dokumen PDF (Opsional - Hash otomatis dihitung)
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
                    <span>Menghitung sidik jari SHA-256...</span>
                  </p>
                )}
                {computedFileHash && !calculatingHash && (
                  <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-blue-800 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Hash Dokumen Asli Terdeteksi (SHA-256):</span>
                    </div>
                    <p className="font-mono text-[11px] text-blue-900 break-all select-all font-bold">
                      {computedFileHash}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  id="submit-draft-doc-btn"
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
                >
                  {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>Simpan Draf Dokumen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kepala Sekolah Authorization & Digital Signature Modal */}
      {showSignModal && (
        <div id="sign-doc-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div id="sign-doc-modal-container" className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Otorisasi Kelulusan & TTD Digital</h3>
                <p className="text-[11px] text-blue-600 font-semibold">Penerbitan Smart Contract Blockchain</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <p className="text-slate-500">Dokumen yang akan ditandatangani:</p>
              <p className="font-bold text-slate-900 text-sm">{showSignModal.title}</p>
              <p className="font-mono text-blue-600 font-semibold">NISN: {showSignModal.studentNisn}</p>
              <p className="font-mono text-slate-500 truncate" title={showSignModal.fileHash}>
                Hash: {showSignModal.fileHash}
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
                  Konfirmasi Kode TOTP Kepala Sekolah (Opsional bila sudah login MFA):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={totpInput}
                    onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-mono text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
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
                  Batal
                </button>
                <button
                  id="confirm-sign-issue-btn"
                  type="submit"
                  disabled={signing || signVerified}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
                    signVerified
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-[1.02]'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 disabled:opacity-50'
                  }`}
                >
                  {signVerified ? (
                    <>
                      <AnimatedCheckmark size={18} strokeColor="#FFFFFF" className="w-4 h-4" />
                      <span className="font-semibold tracking-wide">Kredensial & TTD Terverifikasi!</span>
                    </>
                  ) : signing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menerbitkan on-chain...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>Tandatangani & Terbitkan</span>
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
