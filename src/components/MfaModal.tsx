import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { AnimatedCheckmark } from './AnimatedCheckmark';
import { useLanguage } from '../i18n/LanguageContext';

interface MfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: any, trustedDeviceToken?: string) => void;
  tempToken: string;
  user: any;
  onVerifyMfa: (totpCode: string) => Promise<any>;
}

export const MfaModal: React.FC<MfaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tempToken,
  user,
  onVerifyMfa,
}) => {
  const { t, language } = useLanguage();
  const [code, setCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const secret = user?.demoTotpSecret || 'JBSWY3DPEHPK3PXP';
  const otpauthUrl = `otpauth://totp/SMK%20EduChain:${user?.email || 'admin@smk.sch.id'}?secret=${secret}&issuer=SMK%20EduChain%20ZeroTrust`;

  useEffect(() => {
    if (isOpen) {
      setIsVerified(false);
      setCode('');
      setError(null);
      QRCode.toDataURL(otpauthUrl, { width: 180, margin: 1 })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [isOpen, otpauthUrl]);

  // 30s countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError(t.mfa.enterCode);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await onVerifyMfa(code);
      if (res.ok && res.data?.token) {
        setIsVerified(true);
        // Play checkmark animation inside the submit button before closing modal
        setTimeout(() => {
          onSuccess(res.data.token, res.data.user, res.data.trustedDeviceToken);
          setIsVerified(false);
        }, 950);
      } else {
        setError(res.message || t.mfa.invalidCode);
      }
    } catch (err: any) {
      setError(err.message || (language === 'id' ? 'Terjadi kesalahan sistem.' : 'System error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="mfa-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div id="mfa-modal-container" className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 relative">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.mfa.title}</h3>
            <p className="text-xs text-slate-500">{t.mfa.subtitle}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          {language === 'id' ? (
            <>
              Akun <span className="text-blue-700 font-bold">{user?.fullName || user?.role}</span> memiliki hak istimewa administratif. Pindai kode QR menggunakan Google Authenticator, Authy, atau masukkan secret key.
            </>
          ) : (
            <>
              Account <span className="text-blue-700 font-bold">{user?.fullName || user?.role}</span> holds elevated administrative privileges. Scan the QR code using Google Authenticator, Authy, or copy the secret key.
            </>
          )}
        </p>

        {/* QR Code & Key Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center mb-5">
          {qrDataUrl ? (
            <div className="bg-white p-2 rounded-lg mb-3 shadow-xs border border-slate-200">
              <img src={qrDataUrl} alt="TOTP QR Code" className="w-36 h-36" />
            </div>
          ) : (
            <div className="w-36 h-36 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 mb-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}

          <div className="w-full flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center space-x-2 text-slate-700 font-mono truncate">
              <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Key: {secret}</span>
            </div>
            <button
              type="button"
              onClick={copySecret}
              className="text-slate-500 hover:text-blue-600 transition-colors p-1"
              title={language === 'id' ? 'Salin Secret Key' : 'Copy Secret Key'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">{t.mfa.codeLabel}</label>
              <span className="text-[11px] text-slate-500 font-mono">
                {t.mfa.refreshIn} <span className="text-blue-600 font-bold">{timeLeft}s</span>
              </span>
            </div>
            <input
              id="mfa-totp-input"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 123456"
              className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              autoFocus
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              id="mfa-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={isVerified}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              {t.common.cancel}
            </button>
            <button
              id="mfa-verify-btn"
              type="submit"
              disabled={loading || isVerified || code.length !== 6}
              className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
                isVerified
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-[1.02]'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 disabled:opacity-50'
              }`}
            >
              {isVerified ? (
                <>
                  <AnimatedCheckmark size={18} strokeColor="#FFFFFF" className="w-4 h-4" />
                  <span className="font-semibold tracking-wide">{t.mfa.verified}</span>
                </>
              ) : loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.mfa.verifying}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.mfa.verifyBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
