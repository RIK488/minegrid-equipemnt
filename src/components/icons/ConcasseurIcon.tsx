import React from 'react';

interface ConcasseurIconProps {
  className?: string;
  size?: number;
}

const ConcasseurIcon: React.FC<ConcasseurIconProps> = ({ className = '', size = 24 }) => {
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
        d="M7 21V7L15 3V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 21V11L15 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="11"
        cy="9"
        r="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="11"
        cy="15"
        r="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9 9L13 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 9L9 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ConcasseurIcon; 