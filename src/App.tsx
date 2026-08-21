import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  LogIn,
  X,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { PublicVerify } from './components/PublicVerify';
import { StudentManagement } from './components/StudentManagement';
import { GradeManager } from './components/GradeManager';
import { DocumentManager } from './components/DocumentManager';
import { DudiPortal } from './components/DudiPortal';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { AuditLogViewer } from './components/AuditLogViewer';
import { SecurityTestCenter } from './components/SecurityTestCenter';
import { CertificateModal } from './components/CertificateModal';
import { MfaModal } from './components/MfaModal';
import { LanguageToggle } from './components/LanguageToggle';
import { useLanguage } from './i18n/LanguageContext';
import {
  api,
  getStoredUser,
  setStoredUser,
  setStoredToken,
  clearAuthStorage,
  getRememberedIdentifier,
  setRememberedIdentifier,
  clearRememberedIdentifier,
  getTrustedDeviceToken,
  setTrustedDeviceToken,
  clearTrustedDeviceToken,
} from './api';
import { User, UserRole, DocumentRecord } from './types';

export default function App() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<string>('verify');
  const [previewDocument, setPreviewDocument] = useState<DocumentRecord | null>(null);
  const [verifyInitialHash, setVerifyInitialHash] = useState<string>('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginVerified, setLoginVerified] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resetNotification, setResetNotification] = useState<string | null>(null);

  // MFA Modal State
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaTempToken, setMfaTempToken] = useState('');
  const [mfaTempUser, setMfaTempUser] = useState<any>(null);

  // Initial user fetch and remembered identifier
  useEffect(() => {
    const user = getStoredUser();
    const token = localStorage.getItem('auth_token');
    if (user && token) {
      api.getMe().then((res) => {
        if (res.ok && res.data) {
          setCurrentUser(res.data);
          setStoredUser(res.data);
          setViewMode('app');
          if (res.data.role === 'SISWA') setActiveTab('grades');
          else if (res.data.role === 'DUDI') setActiveTab('dudi');
          else if (res.data.role === 'GURU') setActiveTab('grades');
          else if (res.data.role === 'TU' || res.data.role === 'KEPALA_SEKOLAH') setActiveTab('documents');
          else if (res.data.role === 'AUDITOR') setActiveTab('audit');
        } else {
          clearAuthStorage();
          setCurrentUser(null);
          setViewMode('landing');
        }
      }).catch(() => {
        clearAuthStorage();
        setCurrentUser(null);
        setViewMode('landing');
      });
    } else {
      setViewMode('landing');
    }

    const savedId = getRememberedIdentifier();
    if (savedId) {
      setLoginIdentifier(savedId);
    }
  }, []);

  // Handler for login submission
  const handleLoginSubmit = async (identifier: string, pass: string, remember: boolean) => {
    setLoginLoading(true);
    setLoginError(null);
    setResetNotification(null);

    try {
      // Check if this device is trusted for this account
      const deviceToken = remember ? getTrustedDeviceToken(identifier) : null;
      const res = await api.login(identifier, pass, deviceToken);
      if (res.ok && res.data) {
        if (remember) {
          setRememberedIdentifier(identifier);
        } else {
          clearRememberedIdentifier();
          clearTrustedDeviceToken(identifier);
        }

        setLoginVerified(true);
        setTimeout(() => {
          if (res.data.mfaRequired) {
            setMfaTempToken(res.data.tempToken);
            setMfaTempUser(res.data.user);
            setStoredToken(res.data.tempToken);
            setShowMfaModal(true);
          } else {
            setStoredToken(res.data.token);
            setStoredUser(res.data.user);
            setCurrentUser(res.data.user);
            setViewMode('app');

            // Route to appropriate tab based on role
            const role = res.data.user.role;
            if (role === 'SISWA') setActiveTab('grades');
            else if (role === 'DUDI') setActiveTab('dudi');
            else if (role === 'GURU') setActiveTab('grades');
            else if (role === 'TU' || role === 'KEPALA_SEKOLAH') setActiveTab('documents');
            else if (role === 'AUDITOR') setActiveTab('audit');
            else setActiveTab('verify');
          }
          setLoginVerified(false);
        }, 900);
      } else {
        setLoginError(res.message || 'Email/username atau kata sandi tidak cocok.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan saat memproses login.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick switch role handler
  const handleQuickSwitchRole = async (targetRole: UserRole) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await api.switchRole(targetRole);
      if (res.ok && res.data?.token) {
        setStoredToken(res.data.token);
        setStoredUser(res.data.user);
        setCurrentUser(res.data.user);
        setViewMode('app');

        // Switch to corresponding tab
        if (targetRole === 'SISWA') setActiveTab('grades');
        else if (targetRole === 'DUDI') setActiveTab('dudi');
        else if (targetRole === 'AUDITOR') setActiveTab('audit');
        else if (targetRole === 'GURU') setActiveTab('grades');
        else if (targetRole === 'TU' || targetRole === 'KEPALA_SEKOLAH') setActiveTab('documents');
      } else {
        // Fallback standard login
        let email = 'tu@smk.sch.id';
        if (targetRole === 'KEPALA_SEKOLAH') email = 'kepsek@smk.sch.id';
        else if (targetRole === 'GURU') email = 'guru.tkj@smk.sch.id';
        else if (targetRole === 'SISWA') email = 'siswa.budi@smk.sch.id';
        else if (targetRole === 'DUDI') email = 'dudi.ptint@dudi.id';
        else if (targetRole === 'AUDITOR') email = 'auditor@kemdikbud.go.id';
        await handleLoginSubmit(email, 'Password123!', false);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      clearAuthStorage();
      setCurrentUser(null);
      setViewMode('landing');
      setActiveTab('verify');
    }
  };

  const handleMfaSuccess = (token: string, user: User, trustedDeviceToken?: string) => {
    setStoredToken(token);
    setStoredUser(user);
    setCurrentUser(user);

    // Save trusted device token for 30-day MFA bypass on this device
    if (trustedDeviceToken) {
      if (user.email) setTrustedDeviceToken(user.email, trustedDeviceToken);
      if (user.id) setTrustedDeviceToken(user.id, trustedDeviceToken);
      if (user.username) setTrustedDeviceToken(user.username, trustedDeviceToken);
      setRememberedIdentifier(user.email || user.username);
    }

    setShowMfaModal(false);
    setViewMode('app');

    // Route to appropriate tab
    if (user.role === 'SISWA') setActiveTab('grades');
    else if (user.role === 'DUDI') setActiveTab('dudi');
    else if (user.role === 'GURU') setActiveTab('grades');
    else if (user.role === 'TU' || user.role === 'KEPALA_SEKOLAH') setActiveTab('documents');
    else if (user.role === 'AUDITOR') setActiveTab('audit');
    else setActiveTab('verify');
  };

  const handleVerifyInPortal = (hash: string) => {
    setVerifyInitialHash(hash);
    setActiveTab('verify');
    setViewMode('app');
  };

  const handleOpenPublicVerifyFromLanding = () => {
    setActiveTab('verify');
    setViewMode('app');
  };

  // If in landing/login mode and not authenticated, render dedicated split-view landing page
  if (viewMode === 'landing' && !currentUser) {
    return (
      <>
        <LoginPage
          onLogin={handleLoginSubmit}
          onQuickSwitchRole={handleQuickSwitchRole}
          onOpenPublicVerify={handleOpenPublicVerifyFromLanding}
          loginLoading={loginLoading}
          loginVerified={loginVerified}
          loginError={loginError}
          resetNotification={resetNotification}
          onClearResetNotification={() => setResetNotification(null)}
          initialIdentifier={loginIdentifier}
        />

        {/* MFA Verification Modal */}
        {showMfaModal && (
          <MfaModal
            isOpen={showMfaModal}
            onClose={() => setShowMfaModal(false)}
            onSuccess={handleMfaSuccess}
            tempToken={mfaTempToken}
            user={mfaTempUser}
            onVerifyMfa={(code) => api.verifyMfa(code)}
          />
        )}
      </>
    );
  }

  // Webapp View Mode with Fixed Left Sidebar
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600/20 selection:text-blue-900">
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setViewMode('landing')}
        onLogout={handleLogout}
        onQuickSwitchRole={handleQuickSwitchRole}
        onOpenSecurityTests={() => setActiveTab('security_tests')}
        onBackToLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area (Offset by left sidebar width on desktop: lg:pl-72) */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Breadcrumb & Quick Status Header on Desktop */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/85 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{t.common.appName}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <span className="capitalize font-semibold text-blue-600">
              {activeTab === 'verify' && t.nav.publicVerify}
              {activeTab === 'students' && t.nav.students}
              {activeTab === 'grades' && t.nav.grades}
              {activeTab === 'documents' && t.nav.documents}
              {activeTab === 'dudi' && t.nav.dudi}
              {activeTab === 'blockchain' && t.nav.blockchain}
              {activeTab === 'audit' && t.nav.auditLogs}
              {activeTab === 'security_tests' && t.nav.securityTests}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <LanguageToggle variant="compact" />

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.common.zeroTrustBadge}</span>
            </div>

            {!currentUser && (
              <button
                onClick={() => setViewMode('landing')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs flex items-center space-x-1.5 text-xs shadow-blue-500/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.common.loginToAccount}</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Tab View Content */}
        <main className="flex-1 w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
          {activeTab === 'verify' && (
            <PublicVerify
              initialHash={verifyInitialHash}
              onOpenPreview={(doc) => setPreviewDocument(doc)}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagement onOpenDocumentPreview={(doc) => setPreviewDocument(doc)} />
          )}

          {activeTab === 'grades' && <GradeManager currentUser={currentUser} />}

          {activeTab === 'documents' && (
            <DocumentManager
              currentUser={currentUser}
              onOpenPreview={(doc) => setPreviewDocument(doc)}
              onVerifyInPortal={handleVerifyInPortal}
            />
          )}

          {activeTab === 'dudi' && (
            <DudiPortal
              currentUser={currentUser}
              onOpenPreview={(doc) => setPreviewDocument(doc)}
              onVerifyInPortal={handleVerifyInPortal}
            />
          )}

          {activeTab === 'blockchain' && (
            <BlockchainExplorer onVerifyHash={handleVerifyInPortal} />
          )}

          {activeTab === 'audit' && <AuditLogViewer />}

          {activeTab === 'security_tests' && <SecurityTestCenter />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-5 bg-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>
                Sistem Informasi Akademik SMK — Zero Trust Architecture & EduChain Consortium
              </span>
            </div>
            <div className="flex items-center space-x-3 font-mono text-[11px] text-slate-400">
              <span>Baseline v5.18</span>
              <span>•</span>
              <span>QBFT PoA Consensus</span>
              <span>•</span>
              <span>TOTP RFC 6238</span>
            </div>
          </div>
        </footer>
      </div>

      {/* MFA Verification Modal */}
      {showMfaModal && (
        <MfaModal
          isOpen={showMfaModal}
          onClose={() => setShowMfaModal(false)}
          onSuccess={handleMfaSuccess}
          tempToken={mfaTempToken}
          user={mfaTempUser}
          onVerifyMfa={(code) => api.verifyMfa(code)}
        />
      )}

      {/* Certificate / Transcript Preview Modal */}
      {previewDocument && (
        <CertificateModal
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          document={previewDocument}
          onVerifyInPortal={handleVerifyInPortal}
        />
      )}
    </div>
  );
}
