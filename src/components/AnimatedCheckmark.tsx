import React from 'react';

interface AnimatedCheckmarkProps {
  className?: string;
  size?: number;
  strokeColor?: string;
}

export const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  className = 'w-5 h-5',
  size = 20,
  strokeColor = 'currentColor',
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Subtle pulse ring */}
      <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-checkmark-ripple" />
      
      {/* SVG drawing animation */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Circle track */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          className="animate-checkmark-circle"
        />
        {/* Animated Check Path */}
        <path
          d="M7.5 12.5L10.5 15.5L16.5 8.5"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-checkmark-path"
        />
      </svg>
    </div>
  );
};
