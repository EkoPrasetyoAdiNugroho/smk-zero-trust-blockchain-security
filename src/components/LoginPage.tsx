import React, { useState } from 'react';
import {
  Shield,
  LogIn,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  KeyRound,
  FileCheck2,
  Award,
  Building2,
  MailCheck,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { AnimatedCheckmark } from './AnimatedCheckmark';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';
import { UserRole } from '../types';
import { getTrustedDeviceToken } from '../api';

interface LoginPageProps {
  onLogin: (identifier: string, pass: string, remember: boolean) => Promise<void>;
  onQuickSwitchRole: (role: UserRole) => Promise<void>;
  onOpenPublicVerify: () => void;
  loginLoading: boolean;
  loginVerified: boolean;
  loginError: string | null;
  resetNotification: string | null;
  onClearResetNotification: () => void;
  initialIdentifier?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onQuickSwitchRole,
  onOpenPublicVerify,
  loginLoading,
  loginVerified,
  loginError,
  resetNotification,
  onClearResetNotification,
  initialIdentifier = '',
}) => {
  const { t, language } = useLanguage();
  const [identifier, setIdentifier] = useState(initialIdentifier || 'kepsek@smk.sch.id');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localForgotNotice, setLocalForgotNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    await onLogin(identifier, password, rememberMe);
  };

  const handleSelectQuickAccount = (email: string) => {
    setIdentifier(email);
    setPassword('Password123!');
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    let target = identifier.trim();
    if (!target) {
      target = 'akun.institusi@smk.sch.id';
    } else if (!target.includes('@')) {
      target = `${target}@smk.sch.id`;
    }
    setLocalForgotNotice(
      language === 'id'
        ? `Tautan pemulihan kata sandi telah dikirimkan ke email institusi (${target}). Silakan periksa kotak masuk atau spam.`
        : `Password recovery link has been sent to the institutional email (${target}). Please check your inbox or spam folder.`
    );
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 grid grid-cols-1 lg:grid-cols-12 font-sans selection:bg-blue-600/20 selection:text-blue-900 overflow-x-hidden">
      
      {/* LEFT COLUMN: Modern Campus Imagery with Deep Blue & Slate overlay */}
      <div className="lg:col-span-5 xl:col-span-5 relative bg-slate-900 text-white p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between min-h-[500px] lg:min-h-screen overflow-hidden">
        {/* Full-Bleed Campus Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1600&auto=format&fit=crop"
            alt="Gedung Kampus SMK Negeri 1 Educhain Teknologi"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-75 contrast-110"
          />
          {/* Blue-Slate Gradient Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-blue-950/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-blue-950/80 to-transparent" />
        </div>

        {/* Top: Institutional Badge, Language Selector & Logo */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
              <Building2 className="w-4 h-4 text-sky-300" />
              <span>{t.landing.badge}</span>
            </div>

            <LanguageToggle variant="landing" />
          </div>

          <div className="pt-2">
            <AppLogo size="xl" className="[&_span]:text-white [&_div]:text-white/90" />
          </div>
        </div>

        {/* Center: Mission & Value Points */}
        <div className="relative z-10 my-8 lg:my-auto space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.landing.tagline}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {t.landing.title}
            </h1>
            <p className="text-sm xl:text-base text-slate-300 leading-relaxed max-w-xl">
              {t.landing.heroDesc}
            </p>
          </div>

          {/* Key Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-2 text-sky-300 font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>{t.landing.bullet1Title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.landing.bullet1Desc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <Cpu className="w-4 h-4" />
                <span>{t.landing.bullet2Title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.landing.bullet2Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Institutional Accreditation & Protocol Info */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 font-mono">
          <span>SMK NEGERI 1 EDUCHAIN TEKNOLOGI</span>
          <span>NPSN: 20108922 • AKREDITASI A</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Modern White & Slate Blue Authentication Form */}
      <div className="lg:col-span-7 xl:col-span-7 bg-white p-6 sm:p-10 md:p-12 lg:p-14 xl:p-16 flex flex-col justify-between min-h-screen overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto my-auto space-y-6">
          
          {/* Top Header & Public Verifier Button & Language Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {t.landing.loginCardTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t.landing.loginCardSubtitle}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
              <LanguageToggle variant="compact" />

              {/* Public Verifier Direct Access */}
              <button
                type="button"
                onClick={onOpenPublicVerify}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold border border-slate-200 transition-all shadow-xs"
                title={t.landing.verifyButton}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t.verify.searchButton}</span>
              </button>
            </div>
          </div>

          {/* Error Notification Banner */}
          {loginError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start space-x-3 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-semibold">{loginError}</span>
            </div>
          )}

          {/* Password Reset Notification Banner */}
          {(resetNotification || localForgotNotice) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-xs flex items-start justify-between space-x-3 shadow-xs">
              <div className="flex items-start space-x-2.5">
                <MailCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <div className="leading-relaxed">
                  <strong className="block font-bold text-blue-900">
                    {t.common.success}:
                  </strong>
                  <span>{resetNotification || localForgotNotice}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClearResetNotification();
                  setLocalForgotNotice(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Demo Quick-Fill Accounts Panel */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>{t.landing.quickLoginTitle} - {t.landing.passwordLabel}: Password123!</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{t.landing.quickLoginDesc}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectQuickAccount('kepsek@smk.sch.id')}
                className={`p-2.5 rounded-xl border text-left truncate transition-all ${
                  identifier === 'kepsek@smk.sch.id'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block text-[10px] text-amber-700 font-bold uppercase tracking-wider">{t.roles.KEPALA_SEKOLAH}</span>
                <span className="truncate block font-semibold text-slate-800">kepsek@smk.sch.id</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('tu@smk.sch.id')}
                className={`p-2.5 rounded-xl border text-left truncate transition-all ${
                  identifier === 'tu@smk.sch.id'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block text-[10px] text-blue-600 font-bold uppercase tracking-wider">{t.roles.TU}</span>
                <span className="truncate block font-semibold text-slate-800">tu@smk.sch.id</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('guru.tkj@smk.sch.id')}
                className={`p-2.5 rounded-xl border text-left truncate transition-all ${
                  identifier === 'guru.tkj@smk.sch.id'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{t.roles.GURU}</span>
                <span className="truncate block font-semibold text-slate-800">guru.tkj@smk.sch.id</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('siswa.budi@smk.sch.id')}
                className={`p-2.5 rounded-xl border text-left truncate transition-all ${
                  identifier === 'siswa.budi@smk.sch.id'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{t.roles.SISWA}</span>
                <span className="truncate block font-semibold text-slate-800">siswa.budi@smk.sch.id</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('dudi.ptint@dudi.id')}
                className={`p-2.5 rounded-xl border text-left truncate transition-all ${
                  identifier === 'dudi.ptint@dudi.id'
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block text-[10px] text-cyan-700 font-bold uppercase tracking-wider">{t.roles.DUDI}</span>
                <span className="truncate block font-semibold text-slate-800">dudi.ptint@dudi.id</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('auditor@kemdikbud.go.id')}
                className={`p-2.5 rounded-xl border text-left truncate transition-all ${
                  identifier === 'auditor@kemdikbud.go.id'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block text-[10px] text-rose-600 font-bold uppercase tracking-wider">{t.roles.AUDITOR}</span>
                <span className="truncate block font-semibold text-slate-800">auditor@kemdikbud.go.id</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.landing.identifierLabel}
              </label>
              <div className="relative">
                <input
                  id="login-page-identifier-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t.landing.identifierPlaceholder}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t.landing.passwordLabel}
                </label>
              </div>
              <div className="relative">
                <input
                  id="login-page-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.landing.passwordPlaceholder}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
                  required
                />
                <button
                  id="login-page-toggle-password-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Entropy Strength Meter */}
              <div className="mt-2.5">
                <PasswordStrengthIndicator password={password} />
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="space-y-1.5 pt-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    id="login-page-remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {t.landing.rememberDevice}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors"
                >
                  {t.landing.forgotPassword}
                </button>
              </div>

              {getTrustedDeviceToken(identifier) && rememberMe && (
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {language === 'id'
                      ? 'Perangkat Terpercaya Aktif: Verifikasi TOTP MFA akan otomatis dilewati saat masuk.'
                      : 'Trusted Device Active: TOTP MFA verification will be automatically bypassed.'}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="login-page-submit-btn"
                type="submit"
                disabled={loginLoading || loginVerified}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                  loginVerified
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-[1.01]'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 disabled:opacity-50'
                }`}
              >
                {loginVerified ? (
                  <>
                    <AnimatedCheckmark size={20} strokeColor="#FFFFFF" className="w-5 h-5" />
                    <span className="font-bold tracking-wide">
                      {language === 'id' ? 'Kredensial Terverifikasi! Mengalihkan...' : 'Credentials Verified! Redirecting...'}
                    </span>
                  </>
                ) : loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.landing.authenticating}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t.landing.loginButton}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Card for Public Verifiers & Security Assurance */}
          <div className="pt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  {t.landing.verifyPublicCta}
                </span>
                <p className="text-xs text-slate-500">
                  {t.landing.verifyPublicDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenPublicVerify}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-all flex items-center space-x-1.5 shadow-xs shadow-blue-600/20"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t.verify.searchButton}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-2 pt-2 border-t border-slate-200">
              <span>Zero Trust Auth RS256 & RFC 6238</span>
              <span>•</span>
              <span>EduChain Consortium</span>
              <span>•</span>
              <span>TLS 1.3 Enforced</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

