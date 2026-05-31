import Image from 'next/image';
import { BRAND_NAME, LOGO_SRC } from '@/lib/brand';

type LogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({ size = 40, className = '', priority = false }: LogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt={BRAND_NAME}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority={priority}
    />
  );
}
