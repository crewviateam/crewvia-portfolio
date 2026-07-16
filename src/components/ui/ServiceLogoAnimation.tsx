import React from 'react';

interface ServiceLogoAnimationProps {
  activeIndex: number;
}

export default function ServiceLogoAnimation({ activeIndex }: ServiceLogoAnimationProps) {
  const isBrand = activeIndex === 0;
  const isWeb = activeIndex === 1;
  const isDev = activeIndex === 2;

  const accentColors = {
    brand: "#3acae4",
    web: "#2ec4b6",
    dev: "#d4e157"
  };

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl overflow-visible">
      
      {/* 
        STATE 0: STANDARD SHAPE (SQUARE)
        This is a perfect standard square that spins slowly.
      */}
      <rect 
        x="45" y="45" width="30" height="30" rx="4"
        className="transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center"
        style={{
          fill: isBrand ? accentColors.brand : 'transparent',
          transform: isBrand ? 'scale(1.5) rotate(45deg)' : 'scale(0) rotate(180deg)',
          opacity: isBrand ? 1 : 0
        }}
      />

      <g className="origin-center" style={{ transform: 'translate(10px, 10px)' }}>
        
        {/* Left Bracket */}
        <path 
          d="M 41 9 L 31 9 A 15 15 0 0 0 16 24 L 16 41.8 L 31 37.0 L 31 29 A 5 5 0 0 1 36 24 L 41 24 Z"
          className="transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center"
          style={{
            fill: isDev ? '#fff' : accentColors.web,
            opacity: isBrand ? 0 : 1,
            transform: isBrand 
              ? 'translate(20px, 20px) scale(0)' // Hidden inside square
              : isWeb 
                ? 'translate(-20px, -10px) rotate(-15deg) scale(1)' // Exploded
                : 'translate(0px, 0px) rotate(0deg) scale(1)' // Final Logo
          }}
        />

        {/* Right Brace */}
        <path 
          d="M 65 9 C 85 9, 90 15, 90 25 S 84 35, 85 40 C 86 42, 92 42.5, 100 42.5 L 100 57.5 C 92 57.5, 86 58, 85 60 S 90 65, 90 75 C 90 85, 85 91, 65 91 L 65 76 C 75 76, 75 70, 73 63 C 71 57.5, 80 57.5, 85 57.5 L 85 42.5 C 80 42.5, 71 42.5, 73 37 C 75 30, 75 24, 65 24 Z"
          className="transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center"
          style={{
            fill: isDev ? '#fff' : accentColors.web,
            opacity: isBrand ? 0 : 1,
            transform: isBrand 
              ? 'translate(-20px, 20px) scale(0)' 
              : isWeb 
                ? 'translate(20px, -10px) rotate(15deg) scale(1)' 
                : 'translate(0px, 0px) rotate(0deg) scale(1)'
          }}
        />

        {/* Center Plane / Arrow */}
        <path 
          d="M 0 60 L 62 40 L 46 97 L 37 72 Z"
          className="transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center"
          style={{
            fill: isDev ? accentColors.dev : accentColors.web,
            opacity: isBrand ? 0 : 1,
            transform: isBrand 
              ? 'translate(0px, -20px) scale(0)' 
              : isWeb 
                ? 'translate(0px, 20px) rotate(45deg) scale(1)' 
                : 'translate(0px, 0px) rotate(0deg) scale(1)'
          }}
        />
      </g>
    </svg>
  );
}
