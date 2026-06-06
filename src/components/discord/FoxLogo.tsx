interface FoxLogoProps {
  size?: number;
  className?: string;
}

export default function FoxLogo({ size = 32, className = '' }: FoxLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="foxBodyGrad" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#F0834A" />
          <stop offset="100%" stopColor="#C85A1A" />
        </radialGradient>
        <radialGradient id="foxFaceGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFF0E0" />
          <stop offset="100%" stopColor="#F5D5B0" />
        </radialGradient>
        <radialGradient id="foxEarGrad" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stopColor="#F0834A" />
          <stop offset="100%" stopColor="#BE4F10" />
        </radialGradient>
        <radialGradient id="eyeGrad" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#8B5E0A" />
          <stop offset="60%" stopColor="#3D2800" />
          <stop offset="100%" stopColor="#1A1000" />
        </radialGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7A2E00" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Left ear outer */}
      <path d="M18 48 L12 14 L36 38 Z" fill="url(#foxEarGrad)" />
      {/* Right ear outer */}
      <path d="M82 48 L88 14 L64 38 Z" fill="url(#foxEarGrad)" />
      {/* Left inner ear */}
      <path d="M21 44 L16 20 L33 39 Z" fill="#FF9A6C" />
      {/* Right inner ear */}
      <path d="M79 44 L84 20 L67 39 Z" fill="#FF9A6C" />
      {/* Ear tip dots */}
      <circle cx="13" cy="16" r="2.5" fill="#BE4F10" />
      <circle cx="87" cy="16" r="2.5" fill="#BE4F10" />

      {/* Main head */}
      <ellipse cx="50" cy="57" rx="32" ry="29" fill="url(#foxBodyGrad)" filter="url(#softShadow)" />

      {/* White muzzle area */}
      <ellipse cx="50" cy="65" rx="19" ry="16" fill="url(#foxFaceGrad)" />

      {/* Forehead center stripe */}
      <path d="M50 35 Q53 42 50 50 Q47 42 50 35 Z" fill="#D4600E" opacity="0.3" />

      {/* Cheek fur texture */}
      <ellipse cx="23" cy="58" rx="8" ry="6" fill="#E06820" opacity="0.4" />
      <ellipse cx="77" cy="58" rx="8" ry="6" fill="#E06820" opacity="0.4" />

      {/* Left eye white */}
      <ellipse cx="36" cy="52" rx="8" ry="8.5" fill="white" />
      {/* Right eye white */}
      <ellipse cx="64" cy="52" rx="8" ry="8.5" fill="white" />

      {/* Left iris */}
      <ellipse cx="36" cy="53" rx="6" ry="6.5" fill="url(#eyeGrad)" />
      {/* Right iris */}
      <ellipse cx="64" cy="53" rx="6" ry="6.5" fill="url(#eyeGrad)" />

      {/* Left pupil */}
      <ellipse cx="36.5" cy="53.5" rx="3.5" ry="4" fill="#0D0800" />
      {/* Right pupil */}
      <ellipse cx="64.5" cy="53.5" rx="3.5" ry="4" fill="#0D0800" />

      {/* Eye shine primary */}
      <circle cx="38.5" cy="50.5" r="2" fill="white" opacity="0.9" />
      <circle cx="66.5" cy="50.5" r="2" fill="white" opacity="0.9" />
      {/* Eye shine secondary */}
      <circle cx="34.5" cy="55" r="1" fill="white" opacity="0.5" />
      <circle cx="62.5" cy="55" r="1" fill="white" opacity="0.5" />

      {/* Eyebrow / brow ridge */}
      <path d="M29 45 Q36 42 43 44" stroke="#9E3D00" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M57 44 Q64 42 71 45" stroke="#9E3D00" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* Nose */}
      <path d="M44 67 Q50 63.5 56 67 Q53 72 50 72.5 Q47 72 44 67 Z" fill="#2A1500" />
      {/* Nose bridge */}
      <path d="M50 67 L50 72.5" stroke="#2A1500" strokeWidth="1.2" strokeLinecap="round" />
      {/* Nose shine */}
      <ellipse cx="47" cy="66" rx="2.5" ry="1.5" fill="#6B3A1A" opacity="0.7" />

      {/* Mouth line */}
      <path d="M50 72.5 Q44 76 41 74" stroke="#2A1500" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M50 72.5 Q56 76 59 74" stroke="#2A1500" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Whisker dots */}
      <circle cx="35" cy="69" r="1.2" fill="#9E5A20" opacity="0.6" />
      <circle cx="33" cy="66" r="1.2" fill="#9E5A20" opacity="0.6" />
      <circle cx="65" cy="69" r="1.2" fill="#9E5A20" opacity="0.6" />
      <circle cx="67" cy="66" r="1.2" fill="#9E5A20" opacity="0.6" />

      {/* Bottom chin / neck white */}
      <ellipse cx="50" cy="84" rx="14" ry="7" fill="#FFF0E0" opacity="0.7" />
    </svg>
  );
}
