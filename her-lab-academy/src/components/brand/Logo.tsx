import Image from 'next/image';
import { BRAND_NAME, LOGO_ASPECT, LOGO_SRC } from '@/lib/brand';

type LogoProps = {
  /** Logo height in pixels; width follows the official 3:1 aspect ratio. */
  size?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({ size = 40, className = '', priority = false }: LogoProps) {
  const height = size;
  const width = Math.round(size * LOGO_ASPECT);

  return (
    <Image
      src={LOGO_SRC}
      alt={BRAND_NAME}
      width={width}
      height={height}
      className={`object-contain bg-transparent ${className}`}
      priority={priority}
    />
  );
}
