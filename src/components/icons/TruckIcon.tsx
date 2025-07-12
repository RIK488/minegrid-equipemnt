import React from 'react';

interface TruckIconProps {
  className?: string;
  size?: number;
}

const TruckIcon: React.FC<TruckIconProps> = ({ className = '', size = 24 }) => {
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
        d="M1 3H15V13H1V3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 7H19L22 10V13H15V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="5"
        cy="17"
        r="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="19"
        cy="17"
        r="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 15V13H19V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TruckIcon; 