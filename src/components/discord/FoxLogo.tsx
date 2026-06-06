interface FoxLogoProps {
  size?: number;
  className?: string;
}

export default function FoxLogo({ size = 32, className = '' }: FoxLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ears */}
      <path d="M10 22 L18 6 L24 20 Z" fill="#E8722A" />
      <path d="M54 22 L46 6 L40 20 Z" fill="#E8722A" />
      {/* Inner ears */}
      <path d="M12.5 20 L18 8.5 L22.5 19 Z" fill="#FFB366" />
      <path d="M51.5 20 L46 8.5 L41.5 19 Z" fill="#FFB366" />
      {/* Head */}
      <ellipse cx="32" cy="34" rx="22" ry="20" fill="#E8722A" />
      {/* White face mask */}
      <ellipse cx="32" cy="37" rx="14" ry="13" fill="#FFF5EC" />
      {/* Eyes */}
      <ellipse cx="24" cy="30" rx="4" ry="4.5" fill="#1C1A17" />
      <ellipse cx="40" cy="30" rx="4" ry="4.5" fill="#1C1A17" />
      {/* Eye shine */}
      <circle cx="25.5" cy="28.5" r="1.2" fill="white" />
      <circle cx="41.5" cy="28.5" r="1.2" fill="white" />
      {/* Nose */}
      <ellipse cx="32" cy="38" rx="3.5" ry="2.5" fill="#1C1A17" />
      {/* Nose shine */}
      <circle cx="31" cy="37" r="1" fill="#3D3830" />
      {/* Mouth */}
      <path d="M28.5 41 Q32 44.5 35.5 41" stroke="#1C1A17" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Cheek marks */}
      <path d="M14 36 Q18 34 16 38" stroke="#C0522A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M14 39 Q18 37 17 41" stroke="#C0522A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M50 36 Q46 34 48 38" stroke="#C0522A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M50 39 Q46 37 47 41" stroke="#C0522A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
