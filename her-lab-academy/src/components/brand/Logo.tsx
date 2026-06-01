import Image from 'next/image';
import {
  BRAND_NAME,
  LOGO_MARK_ASPECT,
  LOGO_MARK_SRC,
  LOGO_WORDMARK_ASPECT,
  LOGO_WORDMARK_SRC,
  PROH_ORG_NAME,
} from '@/lib/brand';

type LogoProps = {
  /** Height in pixels; width follows aspect ratio. */
  size?: number;
  /** `mark` = logo1 lockup (navbar, auth). `full` = PERUR wordmark (footer). */
  variant?: 'mark' | 'full';
  className?: string;
  priority?: boolean;
};

export function Logo({
  size = 40,
  variant = 'mark',
  className = '',
  priority = false,
}: LogoProps) {
  const height = size;
  const src = variant === 'full' ? LOGO_WORDMARK_SRC : LOGO_MARK_SRC;
  const width =
    variant === 'full'
      ? Math.round(size * LOGO_WORDMARK_ASPECT)
      : Math.round(size * LOGO_MARK_ASPECT);

  return (
    <Image
      src={src}
      alt={variant === 'full' ? PROH_ORG_NAME : BRAND_NAME}
      width={width}
      height={height}
      className={`object-contain shrink-0 bg-transparent ${className}`}
      style={{ width, height, maxWidth: width, maxHeight: height }}
      priority={priority}
      quality={95}
      sizes={`${width}px`}
    />
  );
}
