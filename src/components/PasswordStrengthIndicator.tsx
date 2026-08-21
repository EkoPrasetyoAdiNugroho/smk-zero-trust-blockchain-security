import React from 'react';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  label: 'Lemah' | 'Sedang' | 'Kuat' | '';
  entropy: number;
  colorClass: string;
  textColorClass: string;
  badgeBgClass: string;
  badgeBorderClass: string;
  feedback: string;
}

export function calculatePasswordEntropy(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: '',
      entropy: 0,
      colorClass: 'bg-[#E5E2D8]',
      textColorClass: 'text-[#717865]',
      badgeBgClass: 'bg-[#F4F1EA]',
      badgeBorderClass: 'border-[#E5E2D8]',
      feedback: 'Masukkan kata sandi',
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) {
    poolSize = 10;
  }

  // Shannon entropy in bits based on character pool: E = L * log2(R)
  let entropy = password.length * Math.log2(poolSize);

  // Penalty for repetitions
  if (/(.)\1{2,}/.test(password)) {
    entropy *= 0.8;
  }

  const roundedEntropy = Math.round(entropy);

  if (entropy < 36 || password.length < 6) {
    return {
      score: 1,
      label: 'Lemah',
      entropy: roundedEntropy,
      colorClass: 'bg-red-500',
      textColorClass: 'text-red-600',
      badgeBgClass: 'bg-red-50',
      badgeBorderClass: 'border-red-200',
      feedback: 'Entropi rendah (<36 bit). Gunakan campuran huruf besar, angka, & simbol.',
    };
  } else if (entropy < 60 || password.length < 10) {
    return {
      score: 2,
      label: 'Sedang',
      entropy: roundedEntropy,
      colorClass: 'bg-amber-500',
      textColorClass: 'text-amber-700',
      badgeBgClass: 'bg-amber-50',
      badgeBorderClass: 'border-amber-200',
      feedback: 'Entropi cukup (' + roundedEntropy + ' bit). Tingkatkan panjang untuk ketahanan maksimal.',
    };
  } else {
    return {
      score: 3,
      label: 'Kuat',
      entropy: roundedEntropy,
      colorClass: 'bg-emerald-600',
      textColorClass: 'text-emerald-700',
      badgeBgClass: 'bg-emerald-50',
      badgeBorderClass: 'border-emerald-200',
      feedback: 'Entropi tinggi (≥60 bit: ' + roundedEntropy + ' bit). Sangat aman dari brute-force.',
    };
  }
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  if (!password) return null;

  const strength = calculatePasswordEntropy(password);

  return (
    <div id="password-strength-container" className="mt-1.5 space-y-1.5 animate-fadeIn">
      {/* 3-Segment Progress Bar */}
      <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            strength.score >= 1 ? strength.colorClass : 'bg-[#E5E2D8]'
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            strength.score >= 2 ? strength.colorClass : 'bg-[#E5E2D8]'
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            strength.score >= 3 ? strength.colorClass : 'bg-[#E5E2D8]'
          }`}
        />
      </div>

      {/* Strength details & entropy score badge */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center space-x-1.5">
          {strength.score === 1 && <ShieldAlert className="w-3 h-3 text-red-500 shrink-0" />}
          {strength.score === 2 && <Shield className="w-3 h-3 text-amber-500 shrink-0" />}
          {strength.score === 3 && <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />}
          
          <span className="text-[#717865]">Kekuatan:</span>
          <span
            id="password-strength-label"
            className={`font-bold px-1.5 py-0.2 rounded border ${strength.textColorClass} ${strength.badgeBgClass} ${strength.badgeBorderClass}`}
          >
            {strength.label}
          </span>
        </div>

        <span
          id="password-entropy-bits"
          className="text-[#8D6219] font-medium tracking-tight bg-[#FAF9F5] border border-[#E5E2D8] px-1.5 py-0.5 rounded"
          title={`Kalkulasi Entropi: E = L × log2(R) = ~${strength.entropy} bit`}
        >
          Entropi: <strong>{strength.entropy} bit</strong>
        </span>
      </div>

      {/* Dynamic Security Tip */}
      <p className="text-[10px] text-[#717865] leading-tight italic">
        {strength.feedback}
      </p>
    </div>
  );
};
