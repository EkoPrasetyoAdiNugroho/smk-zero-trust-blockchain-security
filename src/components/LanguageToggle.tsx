import React from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface LanguageToggleProps {
  variant?: 'pill' | 'compact' | 'sidebar' | 'landing';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
          language === 'id'
            ? 'bg-red-50/80 text-red-700 border-red-200/80 hover:bg-red-100'
            : 'bg-blue-50/80 text-blue-700 border-blue-200/80 hover:bg-blue-100'
        } ${className}`}
      >
        <Languages className="w-3.5 h-3.5" />
        <span className="font-mono tracking-wider font-bold">
          {language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
        </span>
      </button>
    );
  }

  if (variant === 'landing') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white ${className}`}>
        <button
          onClick={() => setLanguage('id')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            language === 'id'
              ? 'bg-white text-slate-900 shadow-sm font-bold'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>🇮🇩</span>
          <span>Indonesia</span>
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            language === 'en'
              ? 'bg-white text-slate-900 shadow-sm font-bold'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>🇬🇧</span>
          <span>English</span>
        </button>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center justify-between p-2 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-700 text-xs ${className}`}>
        <div className="flex items-center space-x-2 font-medium">
          <Languages className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">{language === 'id' ? 'Bahasa' : 'Language'}:</span>
        </div>
        <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
          <button
            onClick={() => setLanguage('id')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              language === 'id'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇮🇩 ID
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇬🇧 EN
          </button>
        </div>
      </div>
    );
  }

  // Default pill variant
  return (
    <div className={`inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs ${className}`}>
      <button
        onClick={() => setLanguage('id')}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          language === 'id'
            ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60 font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>🇮🇩</span>
        <span>ID</span>
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          language === 'en'
            ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60 font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
