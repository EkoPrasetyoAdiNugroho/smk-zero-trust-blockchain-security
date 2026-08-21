import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }[size];

  const subTextClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Modern Grey & Blue Vocational Emblem */}
      <div
        className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#0F172A] p-1.5 shadow-md shadow-blue-900/25 flex items-center justify-center shrink-0 border border-blue-400/30`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Shield Boundary */}
          <path
            d="M24 4L8 10V22C8 33 14.8 40.5 24 44C33.2 40.5 40 33 40 22V10L24 4Z"
            fill="currentColor"
            className="text-white/10"
            stroke="#F8FAFC"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Academic Graduation Cap Outline */}
          <path
            d="M24 13L13 18.5L24 24L35 18.5L24 13Z"
            fill="#E2E8F0"
            stroke="#38BDF8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M17 21V28.5C17 31 20.1 33 24 33C27.9 33 31 31 31 28.5V21"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M33 20V27"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Blockchain Node Link Dots */}
          <circle cx="24" cy="38" r="2" fill="#38BDF8" />
          <circle cx="16" cy="35" r="1.5" fill="#93C5FD" />
          <circle cx="32" cy="35" r="1.5" fill="#93C5FD" />
          <line
            x1="16"
            y1="35"
            x2="24"
            y2="38"
            stroke="#F8FAFC"
            strokeWidth="0.8"
            strokeDasharray="1 1"
          />
          <line
            x1="32"
            y1="35"
            x2="24"
            y2="38"
            stroke="#F8FAFC"
            strokeWidth="0.8"
            strokeDasharray="1 1"
          />
        </svg>

        {/* Active Security Pulse Indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white" />
      </div>

      {/* Typography Label */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-tight text-slate-800 ${textSizeClasses} leading-tight`}
            >
              EduChain<span className="text-blue-600">SIA</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-mono font-bold border border-blue-200">
              v5.18
            </span>
          </div>
          <span
            className={`font-medium text-slate-500 ${subTextClasses} tracking-tight leading-none mt-0.5`}
          >
            SMK Negeri 1 Educhain Teknologi
          </span>
        </div>
      )}
    </div>
  );
};
