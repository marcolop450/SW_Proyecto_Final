import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const LogoErgoCheck: React.FC<LogoProps> = ({ className = 'w-6 h-6', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Marco de apertura óptica hexagonal con esquinas sutiles */}
      <path
        d="M16 3L27 9.35V22.65L16 29L5 22.65V9.35L16 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="opacity-90"
      />
      {/* Vínculo de telemetría postural y sensor central */}
      <circle cx="16" cy="11" r="2.5" fill="currentColor" />
      <path
        d="M16 13.5V23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Nodos de alineación biomecánica */}
      <circle cx="16" cy="18" r="1.5" fill="currentColor" />
      <circle cx="16" cy="23" r="2" fill="currentColor" />
      {/* Arcos de inspección angular (RULA / Visión Computacional) */}
      <path
        d="M11.5 15.5C12.5 14 14.2 13 16 13C17.8 13 19.5 14 20.5 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
        className="opacity-70"
      />
    </svg>
  );
};
