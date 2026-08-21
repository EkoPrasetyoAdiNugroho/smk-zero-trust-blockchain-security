import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  LogOut,
  LogIn,
  KeyRound,
  Shield,
  Layers,
  Cpu,
  FileCheck,
  Users,
  GraduationCap,
  Briefcase,
  Search,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onQuickSwitchRole: (role: UserRole) => void;
  onOpenSecurityTests: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onLogout,
  onQuickSwitchRole,
  onOpenSecurityTests,
}) => {
  const { t, language } = useLanguage();

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'TU':
        return 'bg-[#EAEFF5] text-[#2D4B6E] border-[#C8D6E5]';
      case 'KEPALA_SEKOLAH':
        return 'bg-[#FDF4E5] text-[#8D6219] border-[#F2DEB9]';
      case 'GURU':
        return 'bg-[#F5EFF7] text-[#5E3B68] border-[#E2D2E6]';
      case 'SISWA':
        return 'bg-[#EAF0E7] text-[#385230] border-[#CDE0C7]';
      case 'DUDI':
        return 'bg-[#E8F3F1] text-[#255C54] border-[#C2DFDB]';
      case 'AUDITOR':
        return 'bg-[#FDF1F0] text-[#9C382A] border-[#F5C8C4]';
      default:
        return 'bg-[#F2EFE9] text-[#717865] border-[#E0DBCF]';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-[#E5E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('verify')}>
            <div className="w-10 h-10 rounded-xl bg-[#5A634D] flex items-center justify-center text-white shadow-md shadow-[#5A634D]/20 font-extrabold text-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#3C4133] text-base tracking-tight">SIA SMK EduChain</span>
                <span className="px-1.5 py-0.5 rounded bg-[#EAF0E7] text-[#385230] text-[10px] font-mono font-bold border border-[#CDE0C7]">
                  Zero Trust v5.18
                </span>
              </div>
              <p className="text-[11px] text-[#717865]">SMK Negeri 1 Educhain Teknologi</p>
            </div>
          </div>

          {/* Quick Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              id="nav-verify-tab"
              onClick={() => setActiveTab('verify')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'verify'
                  ? 'bg-[#EAE6DF] text-[#3C4133] border border-[#D4CEBF] font-semibold shadow-sm'
                  : 'text-[#717865] hover:text-[#3C4133] hover:bg-[#F4F1EA]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.nav.verify}</span>
            </button>

            {currentUser && (
              <>
                {['TU', 'KEPALA_SEKOLAH', 'GURU', 'AUDITOR'].includes(currentUser.role) && (
                  <button
                    id="nav-students-tab"
                    onClick={() => setActiveTab('students')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                      activeTab === 'students'
                        ? 'bg-[#EAE6DF] text-[#3C4133] border border-[#D4CEBF] font-semibold shadow-sm'
                        : 'text-[#717865] hover:text-[#3C4133] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{t.nav.students}</span>
                  </button>
                )}

                {['GURU', 'TU', 'KEPALA_SEKOLAH', 'SISWA', 'AUDITOR'].includes(currentUser.role) && (
                  <button
                    id="nav-grades-tab"
                    onClick={() => setActiveTab('grades')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                      activeTab === 'grades'
                        ? 'bg-[#EAE6DF] text-[#3C4133] border border-[#D4CEBF] font-semibold shadow-sm'
                        : 'text-[#717865] hover:text-[#3C4133] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{currentUser.role === 'SISWA' ? (language === 'id' ? 'Rapor Nilai' : 'Report Card') : t.nav.grades}</span>
                  </button>
                )}

                {['TU', 'KEPALA_SEKOLAH', 'SISWA'].includes(currentUser.role) && (
                  <button
                    id="nav-documents-tab"
                    onClick={() => setActiveTab('documents')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                      activeTab === 'documents'
                        ? 'bg-[#EAE6DF] text-[#3C4133] border border-[#D4CEBF] font-semibold shadow-sm'
                        : 'text-[#717865] hover:text-[#3C4133] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{t.nav.documents}</span>
                  </button>
                )}

                {currentUser.role === 'DUDI' && (
                  <button
                    id="nav-dudi-tab"
                    onClick={() => setActiveTab('dudi')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                      activeTab === 'dudi'
                        ? 'bg-[#E8F3F1] text-[#255C54] border border-[#C2DFDB] font-semibold shadow-sm'
                        : 'text-[#717865] hover:text-[#3C4133] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{t.nav.dudi}</span>
                  </button>
                )}

                {['KEPALA_SEKOLAH', 'AUDITOR', 'TU'].includes(currentUser.role) && (
                  <button
                    id="nav-audit-tab"
                    onClick={() => setActiveTab('audit')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                      activeTab === 'audit'
                        ? 'bg-[#EAE6DF] text-[#3C4133] border border-[#D4CEBF] font-semibold shadow-sm'
                        : 'text-[#717865] hover:text-[#3C4133] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t.nav.audit}</span>
                  </button>
                )}
              </>
            )}

            <button
              id="nav-blockchain-tab"
              onClick={() => setActiveTab('blockchain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'blockchain'
                  ? 'bg-[#F2F0E8] text-[#4B533E] border border-[#DDD9CB] font-semibold shadow-sm'
                  : 'text-[#717865] hover:text-[#3C4133] hover:bg-[#F4F1EA]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{t.nav.blockchain}</span>
            </button>

            <button
              id="nav-test-center-btn"
              onClick={onOpenSecurityTests}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'security_tests'
                  ? 'bg-[#FDF4E5] text-[#8D6219] border border-[#F2DEB9] font-semibold shadow-sm'
                  : 'text-[#8D6219] hover:bg-[#FDF4E5]/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.nav.securityTests}</span>
            </button>
          </nav>

          {/* User Status / Language Toggle / Quick Switcher */}
          <div className="flex items-center space-x-3">
            <LanguageToggle className="hidden sm:flex" />

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-[#3C4133] leading-none">{currentUser.fullName}</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeColor(currentUser.role)}`}>
                      {currentUser.role}
                    </span>
                    {currentUser.mfaAuthenticated && (
                      <span className="px-1.5 py-0.5 rounded bg-[#EAF0E7] text-[#385230] text-[9px] font-mono border border-[#CDE0C7] flex items-center space-x-0.5" title="MFA TOTP Verified">
                        <KeyRound className="w-2.5 h-2.5" />
                        <span>MFA</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-white border border-[#E5E2D8] text-[#717865] hover:text-[#9C382A] hover:bg-[#FDF1F0] transition-colors"
                  title={t.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-[#5A634D] hover:bg-[#4A533E] text-white text-xs font-bold transition-all shadow-md shadow-[#5A634D]/20 flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.nav.login}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Role Switcher Bar for Seamless Demonstration */}
        <div className="py-2 border-t border-[#E5E2D8] flex items-center justify-between text-xs overflow-x-auto gap-2">
          <div className="flex items-center space-x-1.5 shrink-0 text-[#717865] text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-[#8D6219] shrink-0" />
            <span className="font-semibold text-[#3C4133]">{language === 'id' ? 'Ganti Peran Demo:' : 'Demo Role Switch:'}</span>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {(['TU', 'KEPALA_SEKOLAH', 'GURU', 'SISWA', 'DUDI', 'AUDITOR'] as UserRole[]).map((r) => {
              const isCurrent = currentUser?.role === r;
              return (
                <button
                  key={r}
                  id={`role-switch-${r.toLowerCase()}`}
                  onClick={() => onQuickSwitchRole(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                    isCurrent
                      ? 'bg-[#5A634D] text-white border-[#5A634D] font-bold shadow-sm'
                      : 'bg-white text-[#555C48] hover:text-[#3C4133] border-[#E5E2D8] hover:bg-[#F4F1EA]'
                  }`}
                >
                  {r === 'KEPALA_SEKOLAH' ? (language === 'id' ? 'Kepsek' : 'Principal') : r}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
