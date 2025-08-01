import React from 'react';

interface CraneIconProps {
  className?: string;
  size?: number;
}

const CraneIcon: React.FC<CraneIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 21H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 7L12 3L16 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 15L12 11L16 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="9"
        r="1"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="17"
        r="1"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
};

export default CraneIcon; 