import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  BookOpen,
  Eye,
  FileCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import { api } from '../api';
import { Student } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface StudentManagementProps {
  onOpenDocumentPreview?: (doc: any) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ onOpenDocumentPreview }) => {
  const { t, language } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        search: search || undefined,
        className: selectedClass !== 'ALL' ? selectedClass : undefined,
        graduationStatus: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      });
      if (res.ok && res.data?.data) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleViewDetail = async (id: string) => {
    setStudentDetailLoading(true);
    try {
      const res = await api.getStudentById(id);
      if (res.ok && res.data?.data) {
        setActiveStudent(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStudentDetailLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LULUS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t.students.statusGraduated}</span>
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <Clock className="w-3 h-3" />
            <span>{t.students.statusPending}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
            <BookOpen className="w-3 h-3" />
            <span>{t.students.statusActive}</span>
          </span>
        );
    }
  };

  return (
    <div id="student-management-section" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{t.students.title}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'id'
              ? 'Daftar siswa SMK Negeri 1 Educhain Teknologi terintegrasi basis data relasional dan blockchain'
              : 'SMK Negeri 1 Educhain Teknologi master student registry with relational DB and blockchain sync'}
          </p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              id="student-search-input"
              type="text"
              placeholder={t.students.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 w-48 sm:w-60 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            id="student-class-filter"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="ALL">{t.students.allClasses}</option>
            <option value="XII TKJ 1">XII TKJ 1</option>
            <option value="XII RPL 2">XII RPL 2</option>
            <option value="XII RPL 1">XII RPL 1</option>
            <option value="XII DKV 1">XII DKV 1</option>
            <option value="XII MM 1">XII MM 1</option>
            <option value="XI TKJ 1">XI TKJ 1</option>
          </select>

          <select
            id="student-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="ALL">{t.students.allStatuses}</option>
            <option value="LULUS">{t.students.statusGraduated}</option>
            <option value="PENDING_APPROVAL">{t.students.statusPending}</option>
            <option value="AKTIF">{t.students.statusActive}</option>
          </select>

          <button
            type="submit"
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
            title={t.common.search}
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">{t.common.loading}...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            {t.students.empty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t.students.tableNisn}</th>
                  <th className="px-5 py-3.5">{t.students.tableName}</th>
                  <th className="px-5 py-3.5">{t.students.tableClass}</th>
                  <th className="px-5 py-3.5">{t.students.tableStatus}</th>
                  <th className="px-5 py-3.5 text-right">{t.students.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-blue-700 font-bold">
                      <div>{student.nisn}</div>
                      <div className="text-[10px] text-slate-400">NIS: {student.nis}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-900 font-bold">{student.fullName}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{student.className}</div>
                      <div className="text-[11px] text-slate-500">{student.major}</div>
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(student.graduationStatus)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        id={`view-student-${student.id}`}
                        onClick={() => handleViewDetail(student.id)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors inline-flex items-center space-x-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.students.viewDetail}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {activeStudent && (
        <div id="student-detail-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div id="student-detail-modal-container" className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-slate-800 relative">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{activeStudent.fullName}</h3>
                <p className="text-xs text-blue-600 font-mono font-semibold">
                  NISN: {activeStudent.nisn} | NIS: {activeStudent.nis}
                </p>
              </div>
              <button
                onClick={() => setActiveStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500">{language === 'id' ? 'Kelas: ' : 'Class: '}</span>
                <span className="font-semibold text-slate-800">{activeStudent.className}</span>
              </div>
              <div>
                <span className="text-slate-500">{language === 'id' ? 'Jurusan: ' : 'Major: '}</span>
                <span className="font-semibold text-slate-800">{activeStudent.major}</span>
              </div>
              <div>
                <span className="text-slate-500">{language === 'id' ? 'TTL: ' : 'POB / DOB: '}</span>
                <span className="text-slate-800">
                  {activeStudent.birthPlace}, {activeStudent.birthDate}
                </span>
              </div>
              <div>
                <span className="text-slate-500">{language === 'id' ? 'Status: ' : 'Status: '}</span>
                {getStatusBadge(activeStudent.graduationStatus)}
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">{language === 'id' ? 'Alamat: ' : 'Address: '}</span>
                <span className="text-slate-800">{activeStudent.address}</span>
              </div>
            </div>

            {/* Grades Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {language === 'id' ? 'Capaian Nilai Akademik' : 'Academic Performance & Grades'}
              </h4>
              {activeStudent.grades && activeStudent.grades.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeStudent.grades.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{g.subject}</p>
                        <p className="text-[10px] text-slate-500">Semester {g.semester} | TA {g.academicYear}</p>
                      </div>
                      <span className="text-sm font-bold font-mono px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {g.score}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  {language === 'id' ? 'Belum ada nilai terdaftar.' : 'No registered grades.'}
                </p>
              )}
            </div>

            {/* Documents Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {language === 'id' ? 'Dokumen Kelulusan & Blockchain' : 'Graduation Documents & Blockchain'}
              </h4>
              {activeStudent.documents && activeStudent.documents.length > 0 ? (
                <div className="space-y-2">
                  {activeStudent.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{doc.title}</span>
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">No: {doc.documentNumber}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {doc.status}
                        </span>
                        {onOpenDocumentPreview && (
                          <button
                            onClick={() => {
                              setActiveStudent(null);
                              onOpenDocumentPreview(doc);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold"
                          >
                            {language === 'id' ? 'Lihat' : 'View'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  {language === 'id' ? 'Belum ada dokumen ijazah/transkrip yang diterbitkan.' : 'No diploma/transcript documents issued yet.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
