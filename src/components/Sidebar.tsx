import React, { useState } from 'react';
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
  ChevronRight,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Lock,
  FileText,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { AppLogo } from './AppLogo';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

interface SidebarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onQuickSwitchRole: (role: UserRole) => void;
  onOpenSecurityTests: () => void;
  onBackToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onLogout,
  onQuickSwitchRole,
  onOpenSecurityTests,
  onBackToLanding,
}) => {
  const { t, language } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'TU':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'KEPALA_SEKOLAH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'GURU':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SISWA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DUDI':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'AUDITOR':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRoleLabel = (role?: UserRole) => {
    if (!role) return t.roles.GUEST;
    return t.roles[role] || role;
  };

  const navItemClass = (isActive: boolean, activeColorClass: string = 'bg-blue-600 text-white shadow-md shadow-blue-600/25') =>
    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all select-none ${
      isActive
        ? activeColorClass
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <AppLogo size="sm" />
        </div>

        <div className="flex items-center space-x-2">
          <LanguageToggle variant="compact" />

          {currentUser ? (
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.role === 'KEPALA_SEKOLAH' ? 'Kepsek' : currentUser.role}
              </span>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                title={t.common.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onBackToLanding || onOpenLogin}
              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm"
            >
              {t.common.login}
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        id="app-left-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* TOP & MIDDLE: Logo + Navigation Groups + Role Simulator */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Logo Header */}
          <div className="pt-2 pb-3 border-b border-slate-100 flex items-center justify-between">
            <AppLogo size="md" />
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Selector in Sidebar */}
          <LanguageToggle variant="sidebar" />

          {/* Navigation Items */}
          <nav className="space-y-4 text-xs">
            {/* Group 1: Portal Publik */}
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.nav.consortiumSecurity}
              </span>

              <button
                id="nav-verify-tab"
                onClick={() => handleTabClick('verify')}
                className={navItemClass(activeTab === 'verify')}
              >
                <div className="flex items-center space-x-2.5">
                  <Search className="w-4 h-4 shrink-0" />
                  <span>{t.nav.publicVerify}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${activeTab === 'verify' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>SHA-256</span>
              </button>

              <button
                id="nav-blockchain-tab"
                onClick={() => handleTabClick('blockchain')}
                className={navItemClass(activeTab === 'blockchain')}
              >
                <div className="flex items-center space-x-2.5">
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span>{t.nav.blockchain}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${activeTab === 'blockchain' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>PoA</span>
              </button>
            </div>

            {/* Group 2: Akademik & Administrasi */}
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.nav.academicPortal}
              </span>

              {/* Data Siswa */}
              {(!currentUser || ['TU', 'KEPALA_SEKOLAH', 'GURU', 'AUDITOR'].includes(currentUser.role)) && (
                <button
                  id="nav-students-tab"
                  onClick={() => handleTabClick('students')}
                  className={navItemClass(activeTab === 'students')}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>{t.nav.students}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              )}

              {/* Manajemen / Rapor Nilai */}
              {(!currentUser || ['GURU', 'TU', 'KEPALA_SEKOLAH', 'SISWA', 'AUDITOR'].includes(currentUser.role)) && (
                <button
                  id="nav-grades-tab"
                  onClick={() => handleTabClick('grades')}
                  className={navItemClass(activeTab === 'grades')}
                >
                  <div className="flex items-center space-x-2.5">
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>{currentUser?.role === 'SISWA' ? (language === 'id' ? 'Rapor & Nilai Saya' : 'My Grades & Report') : t.nav.grades}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              )}

              {/* Dokumen & Ijazah */}
              {(!currentUser || ['TU', 'KEPALA_SEKOLAH', 'SISWA', 'AUDITOR'].includes(currentUser.role)) && (
                <button
                  id="nav-documents-tab"
                  onClick={() => handleTabClick('documents')}
                  className={navItemClass(activeTab === 'documents')}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileCheck className="w-4 h-4 shrink-0" />
                    <span>{t.nav.documents}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              )}

              {/* Mitra DUDI Portal */}
              {(!currentUser || ['DUDI', 'KEPALA_SEKOLAH', 'TU', 'AUDITOR'].includes(currentUser.role)) && (
                <button
                  id="nav-dudi-tab"
                  onClick={() => handleTabClick('dudi')}
                  className={navItemClass(activeTab === 'dudi')}
                >
                  <div className="flex items-center space-x-2.5">
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>{t.nav.dudi}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              )}
            </div>

            {/* Group 3: Keamanan, Audit & Pengujian */}
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {language === 'id' ? 'Keamanan & Forensik' : 'Security & Forensics'}
              </span>

              {(!currentUser || ['KEPALA_SEKOLAH', 'AUDITOR', 'TU'].includes(currentUser.role)) && (
                <button
                  id="nav-audit-tab"
                  onClick={() => handleTabClick('audit')}
                  className={navItemClass(activeTab === 'audit')}
                >
                  <div className="flex items-center space-x-2.5">
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>{t.nav.auditLogs}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              )}

              <button
                id="nav-test-center-btn"
                onClick={() => {
                  onOpenSecurityTests();
                  setMobileOpen(false);
                }}
                className={navItemClass(
                  activeTab === 'security_tests',
                  'bg-slate-800 text-white shadow-md shadow-slate-800/25'
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>{t.nav.securityTests}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-200 font-bold">20/20</span>
              </button>
            </div>
          </nav>

          {/* Quick Role Switcher */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 space-y-2">
            <button
              type="button"
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700"
            >
              <div className="flex items-center space-x-1.5 text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.common.switchRole}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transform transition-transform ${
                  roleSwitcherOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {roleSwitcherOpen && (
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200">
                {(['KEPALA_SEKOLAH', 'TU', 'GURU', 'SISWA', 'DUDI', 'AUDITOR'] as UserRole[]).map((r) => {
                  const isCurrent = currentUser?.role === r;
                  return (
                    <button
                      key={r}
                      id={`sidebar-role-switch-${r.toLowerCase()}`}
                      onClick={() => {
                        onQuickSwitchRole(r);
                        setMobileOpen(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left truncate transition-all border ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {r === 'KEPALA_SEKOLAH' ? (language === 'id' ? 'Kepsek' : 'Principal') : r}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: User Account Info Card */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/80 space-y-3 shrink-0">
          {currentUser ? (
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {currentUser.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-bold text-xs text-slate-800 truncate leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate font-mono">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <button
                  id="sidebar-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title={t.common.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getRoleBadgeColor(
                    currentUser.role
                  )}`}
                >
                  {getRoleLabel(currentUser.role)}
                </span>

                {currentUser.mfaAuthenticated && (
                  <span
                    className="px-1.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[9px] font-mono font-semibold border border-blue-200 flex items-center space-x-1"
                    title="MFA TOTP Authenticated"
                  >
                    <KeyRound className="w-2.5 h-2.5" />
                    <span>MFA Active</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-2 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-600">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-xs">{language === 'id' ? 'Mode Tamu / Publik' : 'Guest / Public Mode'}</span>
              </div>
              <button
                id="sidebar-login-action-btn"
                onClick={onBackToLanding || onOpenLogin}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shadow-blue-500/20 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.common.loginToAccount}</span>
              </button>
            </div>
          )}

          {/* Download Word Report Link */}
          <a
            href="/api/download/report"
            download="Laporan_Tugas_Akhir_Cloud_Security_Architecture.docx"
            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors flex items-center justify-center space-x-2 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'id' ? 'Unduh Laporan (.docx)' : 'Download Report (.docx)'}</span>
          </a>

          {/* System Protocol & School Footer */}
          <div className="px-1 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Zero Trust Arch</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>EduChain PoA</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight font-medium">
              SMKN 1 Educhain Teknologi • 2026
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

