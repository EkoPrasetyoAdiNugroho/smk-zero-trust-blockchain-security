import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Edit3,
  History,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Save,
  X,
} from 'lucide-react';
import { api } from '../api';
import { Grade, User } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface GradeManagerProps {
  currentUser: User | null;
}

export const GradeManager: React.FC<GradeManagerProps> = ({ currentUser }) => {
  const { t, language } = useLanguage();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'audit'>('list');
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [newScore, setNewScore] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.getGrades();
      if (res.ok && res.data?.data) {
        setGrades(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [currentUser]);

  const handleStartEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setNewScore(grade.score);
    setReason('');
    setError(null);
    setUpdateSuccess(null);
  };

  const handleSaveGradeUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    if (newScore < 0 || newScore > 100) {
      setError(language === 'id' ? 'Nilai harus berada pada rentang 0 - 100.' : 'Grade score must be between 0 and 100.');
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      setError(
        language === 'id'
          ? 'Alasan perubahan nilai wajib diisi secara jelas (minimal 5 karakter) untuk kepatuhan audit.'
          : 'Reason for grade update is mandatory (min 5 characters) for audit compliance.'
      );
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const res = await api.updateGrade({
        gradeId: editingGrade.id,
        newScore: Number(newScore),
        reason: reason.trim(),
      });

      if (res.ok && res.data?.success) {
        setUpdateSuccess(res.data.auditTrail);
        // Refresh local grades list
        setGrades((prev) =>
          prev.map((g) => (g.id === editingGrade.id ? { ...g, score: Number(newScore) } : g))
        );
        setTimeout(() => {
          setEditingGrade(null);
        }, 3500);
      } else {
        setError(res.message || (language === 'id' ? 'Gagal memperbarui nilai.' : 'Failed to update grade.'));
      }
    } catch (err: any) {
      setError(err.message || (language === 'id' ? 'Terjadi kesalahan sistem.' : 'System error occurred.'));
    } finally {
      setUpdating(false);
    }
  };

  const isTeacherOrTu = ['GURU', 'TU', 'KEPALA_SEKOLAH'].includes(currentUser?.role || '');

  return (
    <div id="grade-manager-section" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>{t.grades.title}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'id'
              ? 'Setiap pembaruan nilai mewajibkan alasan perubahan dan secara otomatis di-anchor ke smart contract blockchain'
              : 'Every grade change requires justification and is automatically anchored to the blockchain smart contract'}
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            {t.grades.tabList}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.grades.tabAudit}</span>
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        /* Grades List Table */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs">{t.common.loading}...</span>
            </div>
          ) : grades.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">{t.grades.empty}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">{t.grades.tableStudent}</th>
                    <th className="px-5 py-3.5">{t.grades.tableSubject}</th>
                    <th className="px-5 py-3.5">{t.grades.tableSemester}</th>
                    <th className="px-5 py-3.5">{t.grades.tableTeacher}</th>
                    <th className="px-5 py-3.5 text-center">{t.grades.tableScore}</th>
                    {isTeacherOrTu && <th className="px-5 py-3.5 text-right">{t.grades.tableActions}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{grade.studentName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">NISN: {grade.studentNisn}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{grade.subject}</td>
                      <td className="px-5 py-3.5 text-slate-500">
                        Semester {grade.semester} <span className="text-slate-300">|</span> TA {grade.academicYear}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{grade.teacherName}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-block font-mono font-bold text-sm px-3 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {grade.score}
                        </span>
                      </td>
                      {isTeacherOrTu && (
                        <td className="px-5 py-3.5 text-right">
                          <button
                            id={`edit-grade-btn-${grade.id}`}
                            onClick={() => handleStartEdit(grade)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors inline-flex items-center space-x-1 shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t.grades.editScore}</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Audit History View */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>{language === 'id' ? 'Catatan Bukti Kriptografis Perubahan Nilai pada Smart Contract' : 'Cryptographic Proof of Grade Changes on Smart Contract'}</span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Administrasi Infrastruktur Jaringan — Budi Santoso</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  ON-CHAIN ANCHORED
                </span>
              </div>
              <p className="text-slate-600">
                {language === 'id' ? 'Nilai dikoreksi dari ' : 'Score adjusted from '}
                <strong className="text-amber-700">92</strong> {language === 'id' ? 'menjadi ' : 'to '}
                <strong className="text-emerald-700">95</strong>
              </p>
              <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                {language === 'id'
                  ? 'Alasan: "Koreksi nilai remedial praktikum clustering server & konfigurasi firewall perimeter."'
                  : 'Reason: "Remedial score correction for server clustering and perimeter firewall configuration lab."'}
              </p>
              <div className="pt-2 text-[10px] font-mono text-slate-500 break-all space-y-1 border-t border-slate-200">
                <p>{language === 'id' ? 'Pengubah: ' : 'Modifier: '}Drs. H. Bambang Subagyo, M.Kom</p>
                <p>
                  TxHash: <span className="text-blue-600 font-bold">0x8f4d92a1c7b3e5f609123456789abcdef0123456789abcdef0123456789abcde</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Grade Modal with Mandatory Justification */}
      {editingGrade && (
        <div id="edit-grade-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div id="edit-grade-modal-container" className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 relative space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.grades.editScore}</h3>
                <p className="text-xs text-blue-600 font-semibold">{editingGrade.subject} — {editingGrade.studentName}</p>
              </div>
              <button
                onClick={() => setEditingGrade(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs text-emerald-800">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'id' ? 'Nilai Berhasil Diperbarui & Tercatat On-Chain!' : 'Grade Updated & Recorded On-Chain!'}</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  {language === 'id'
                    ? 'Perubahan nilai telah di-anchor secara permanen ke smart contract blockchain konsorsium.'
                    : 'The grade modification has been permanently anchored to the consortium smart contract.'}
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-[10px] font-mono break-all text-slate-800">
                  <span className="text-slate-500">TxHash: </span>
                  <span className="text-emerald-700 font-semibold">{updateSuccess.transactionHash}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveGradeUpdate} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    {t.grades.newScoreLabel} <span className="text-slate-500 font-mono font-normal">({language === 'id' ? 'Nilai Saat Ini: ' : 'Current Score: '}{editingGrade.score})</span>
                  </label>
                  <input
                    id="new-score-input"
                    type="number"
                    min={0}
                    max={100}
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-base font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    {t.grades.reasonLabel} <span className="text-rose-600">* ({language === 'id' ? 'Wajib Audit' : 'Audit Mandatory'})</span>
                  </label>
                  <textarea
                    id="grade-change-reason-input"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={language === 'id' ? 'Contoh: Koreksi nilai remedial tugas akhir praktikum...' : 'E.g.: Remedial score adjustment for final lab assignment...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {language === 'id'
                      ? 'Alasan ini akan disimpan di basis data audit dan hash ringkasannya dicatat ke blockchain.'
                      : 'This reason will be stored in audit records and its hash summary recorded to the blockchain.'}
                  </p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingGrade(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    id="submit-grade-change-btn"
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                  >
                    {updating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{language === 'id' ? 'Mencatat ke Blockchain...' : 'Recording to Blockchain...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{t.grades.saveAnchor}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
