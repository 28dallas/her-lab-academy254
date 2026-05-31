import Link from 'next/link';
import { ArrowUpRight, Globe } from 'lucide-react';
import { PROH_ORG_NAME, PROH_WEBSITE } from '@/lib/brand';

type ProhWebsiteCardProps = {
  className?: string;
  compact?: boolean;
};

/** Call-to-action card linking to the official Perur Rays of Hope website. */
export function ProhWebsiteCard({ className = '', compact = false }: ProhWebsiteCardProps) {
  return (
    <Link
      href={PROH_WEBSITE}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl border border-white/10 bg-gradient-to-br from-[var(--color-secondary)]/30 via-[var(--color-surface)] to-[var(--color-bg-muted)] p-5 transition-all hover:border-[var(--color-primary)]/40 hover:shadow-lg hover:shadow-black/20 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 rounded-xl bg-[var(--color-primary)]/15 p-3 ring-1 ring-[var(--color-primary)]/20 group-hover:bg-[var(--color-primary)]/25 transition-colors">
          <Globe className="w-6 h-6 text-[var(--color-primary)]" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            Official website
          </p>
          <p className="font-display text-lg font-bold text-white mt-1">{PROH_ORG_NAME}</p>
          {!compact && (
            <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
              Learn about our programs, impact, and how to partner with us in West Pokot.
            </p>
          )}
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] group-hover:gap-2.5 transition-all">
            Click here to visit our official website
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
