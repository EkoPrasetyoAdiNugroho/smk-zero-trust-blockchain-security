import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Award,
  CheckCircle2,
  Cpu,
  RefreshCw,
  AlertCircle,
  Eye,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api';
import { DocumentRecord, Student, User } from '../types';
import { AnimatedCheckmark } from './AnimatedCheckmark';
import { useLanguage } from '../i18n/LanguageContext';

interface DudiPortalProps {
  currentUser: User | null;
  onOpenPreview: (doc: DocumentRecord) => void;
  onVerifyInPortal: (hash: string) => void;
}

export const DudiPortal: React.FC<DudiPortalProps> = ({
  currentUser,
  onOpenPreview,
  onVerifyInPortal,
}) => {
  const { t, language } = useLanguage();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [pklDuration, setPklDuration] = useState(language === 'id' ? '6 Bulan (Juli - Desember 2025)' : '6 Months (July - December 2025)');
  const [pklScore, setPklScore] = useState(language === 'id' ? 'A (Sangat Memuaskan - 95.0)' : 'A (Distinction - 95.0)');
  const [pklRole, setPklRole] = useState('Cloud Security Engineer Intern');
  const [issuing, setIssuing] = useState(false);
  const [issueVerified, setIssueVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDudiData = async () => {
    setLoading(true);
    try {
      const [docsRes, studentsRes] = await Promise.all([
        api.getDocuments({ type: 'SERTIFIKAT_PKL' }),
        api.getStudents(),
      ]);
      if (docsRes.ok && docsRes.data?.data) {
        setDocuments(docsRes.data.data);
      }
      if (studentsRes.ok && studentsRes.data?.data) {
        setStudents(studentsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDudiData();
  }, []);

  const handleIssuePklCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError(language === 'id' ? 'Pilih siswa peserta magang PKL.' : 'Please select an intern student.');
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    setIssuing(true);
    setError(null);

    try {
      const docNumber = `PKL/NUSTECH/2026/${Math.floor(100 + Math.random() * 900)}`;
      const title = language === 'id' ? `Sertifikat PKL — ${student.fullName} (${pklRole})` : `Internship Certificate — ${student.fullName} (${pklRole})`;

      // 1. Upload DUDI document draft
      const uploadRes = await api.uploadDocument({
        documentType: 'SERTIFIKAT_PKL',
        studentId: student.id,
        documentNumber: docNumber,
        title,
        metadata: {
          pklCompany: currentUser?.organization || 'PT Industri Nusantara Tech',
          pklDuration,
          pklScore,
        },
      });

      if (!uploadRes.ok || !uploadRes.data?.data?.id) {
        throw new Error(uploadRes.message || (language === 'id' ? 'Gagal membuat draf sertifikat PKL' : 'Failed to create internship certificate draft'));
      }

      // 2. Issue and digitally sign on blockchain with DUDI authority
      const issueRes = await api.issueDocumentOnChain(uploadRes.data.data.id);
      if (!issueRes.ok) {
        throw new Error(issueRes.message || (language === 'id' ? 'Gagal menandatangani sertifikat di blockchain' : 'Failed to sign certificate on blockchain'));
      }

      setIssueVerified(true);
      setTimeout(() => {
        setShowIssueModal(false);
        setIssueVerified(false);
        fetchDudiData();
      }, 950);
    } catch (err: any) {
      setError(err.message || (language === 'id' ? 'Terjadi kesalahan sistem.' : 'A system error occurred.'));
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div id="dudi-portal-section" className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase">
                {language === 'id' ? 'Mitra Industri Terverifikasi' : 'Verified Industry Partner'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-0.5">
              {t.dudi.title} — {currentUser?.organization || 'PT Industri Nusantara Tech'}
            </h2>
            <p className="text-xs text-slate-500">
              {t.dudi.subtitle}
            </p>
          </div>
        </div>

        {currentUser?.role === 'DUDI' ? (
          <button
            id="dudi-create-cert-btn"
            onClick={() => {
              setShowIssueModal(true);
              setError(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.dudi.issueNew}</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-2 shrink-0">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{language === 'id' ? 'Pratinjau Sertifikat Industri Terverifikasi' : 'Verified Industry Certificate Preview'}</span>
          </div>
        )}
      </div>

      {/* Issued PKL Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span>{language === 'id' ? 'Daftar Sertifikat PKL yang Telah Diterbitkan & Terdaftar di Blockchain' : 'List of Issued Internship Certificates Registered on Blockchain'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{documents.length} {language === 'id' ? 'Sertifikat' : 'Certificates'}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">{t.common.loading}...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            {t.dudi.empty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t.dudi.tableTitle}</th>
                  <th className="px-5 py-3.5">{t.dudi.tableStudent}</th>
                  <th className="px-5 py-3.5">{t.dudi.tableScore}</th>
                  <th className="px-5 py-3.5">{t.dudi.tableStatus}</th>
                  <th className="px-5 py-3.5 text-right">{t.dudi.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{doc.title}</div>
                      <div className="text-[10px] font-mono text-blue-600">No: {doc.documentNumber}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{doc.studentName}</div>
                      <div className="text-[10px] font-mono text-slate-400">NISN: {doc.studentNisn}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-800">
                      <span className="font-semibold text-emerald-700">
                        {doc.metadata?.pklScore || (language === 'id' ? 'A (Sangat Memuaskan)' : 'A (Distinction)')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{language === 'id' ? `Blok #${doc.blockNumber || 1} (On-Chain)` : `Block #${doc.blockNumber || 1} (On-Chain)`}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenPreview(doc)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center space-x-1 border border-slate-200 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.documents.preview}</span>
                      </button>
                      <button
                        onClick={() => onVerifyInPortal(doc.fileHash)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{language === 'id' ? 'Uji Keabsahan' : 'Verify'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div id="issue-pkl-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div id="issue-pkl-modal-container" className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800 relative">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'id' ? 'Penerbitan Sertifikat PKL Industri' : 'Industrial Internship Certificate Issuance'}
                </h3>
                <p className="text-[11px] text-blue-600 font-semibold">Digital Signing via Smart Contract</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleIssuePklCert} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  {language === 'id' ? 'Pilih Siswa Peserta PKL' : 'Select Intern Student'}
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
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

              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  {language === 'id' ? 'Posisi / Kompetensi Magang' : 'Internship Position / Role'}
                </label>
                <input
                  type="text"
                  value={pklRole}
                  onChange={(e) => setPklRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">
                    {language === 'id' ? 'Durasi PKL' : 'Internship Duration'}
                  </label>
                  <input
                    type="text"
                    value={pklDuration}
                    onChange={(e) => setPklDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">
                    {language === 'id' ? 'Nilai Capaian / Predikat' : 'Grade / Performance Predicate'}
                  </label>
                  <input
                    type="text"
                    value={pklScore}
                    onChange={(e) => setPklScore(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                {language === 'id'
                  ? 'Sertifikat ini akan ditandatangani menggunakan kunci kriptografis institusi industri Anda dan dicatat permanen pada blockchain EduChain.'
                  : 'This certificate will be cryptographically signed using your industrial partner key and permanently recorded on EduChain.'}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  disabled={issueVerified}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold disabled:opacity-40 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  id="confirm-dudi-issue-btn"
                  type="submit"
                  disabled={issuing || issueVerified}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center justify-center space-x-2 ${
                    issueVerified
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-[1.02]'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 disabled:opacity-50'
                  }`}
                >
                  {issueVerified ? (
                    <>
                      <AnimatedCheckmark size={18} strokeColor="#FFFFFF" className="w-4 h-4" />
                      <span className="font-semibold tracking-wide">
                        {language === 'id' ? 'Kredensial & TTD Terverifikasi!' : 'Credentials & Signature Verified!'}
                      </span>
                    </>
                  ) : issuing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'id' ? 'Menerbitkan on-chain...' : 'Issuing on-chain...'}</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>{language === 'id' ? 'Tandatangani & Terbitkan' : 'Sign & Issue On-Chain'}</span>
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
