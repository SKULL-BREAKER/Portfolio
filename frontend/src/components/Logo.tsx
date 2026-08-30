import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 24, color = 'currentColor', className }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Outer Geometric Hexagon */}
      <path 
        d="M 50 5 L 95 25 L 95 75 L 50 95 L 5 75 L 5 25 Z" 
        stroke={color} 
        strokeWidth="6" 
        strokeLinejoin="round"
      />
      {/* Inner Geometric Hexagon */}
      <path 
        d="M 50 25 L 75 38 L 75 62 L 50 75 L 25 62 L 25 38 Z" 
        stroke={color} 
        strokeWidth="4" 
        strokeLinejoin="round" 
        opacity="0.6"
      />
      {/* Connecting Cyber Lines */}
      <path 
        d="M 50 5 L 50 25 M 95 25 L 75 38 M 95 75 L 75 62 M 50 95 L 50 75 M 5 75 L 25 62 M 5 25 L 25 38" 
        stroke={color} 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      {/* Core Node representing the "Explorer Ball" */}
      <circle cx="50" cy="50" r="8" fill={color} />
      {/* Orbiting Tech Ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="18" 
        stroke={color} 
        strokeWidth="2" 
        strokeDasharray="4 6" 
      />
      {/* Floating Explorer Dot */}
      <circle cx="80" cy="20" r="4" fill={color} />
    </svg>
  );
};

export default Logo;
