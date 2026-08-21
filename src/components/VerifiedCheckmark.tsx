import React from 'react';

interface VerifiedCheckmarkProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerifiedCheckmark: React.FC<VerifiedCheckmarkProps> = ({
  label = 'Kredensial Terverifikasi',
  size = 'md',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`inline-flex items-center justify-center space-x-2 animate-success-pop ${className}`}>
      <svg
        className={`${iconSizes[size]} text-emerald-400 shrink-0`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.2"
          className="animate-checkmark-circle opacity-90"
        />
        <path
          d="M8 12.2L10.8 15L16 9.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-checkmark-check"
        />
      </svg>
      <span className="font-semibold text-white tracking-wide">{label}</span>
    </div>
  );
};
