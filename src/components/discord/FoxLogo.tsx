interface FoxLogoProps {
  size?: number;
  className?: string;
}

const FOX_LOGO_URL = "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100072157/fox_logo_3f674575.png";

export default function FoxLogo({ size = 32, className = '' }: FoxLogoProps) {
  return (
    <img
      src={FOX_LOGO_URL}
      crossOrigin="anonymous"
      width={size}
      height={size}
      alt="FIX logo"
      className={className}
      style={{ objectFit: 'contain', display: 'inline-block' }}
    />
  );
}
