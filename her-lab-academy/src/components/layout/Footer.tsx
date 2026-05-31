import { Logo } from '@/components/brand/Logo';
import { BRAND_NAME } from '@/lib/brand';
import { ProhWebsiteCard } from '@/components/layout/ProhWebsiteCard';

export function Footer() {
  return (
    <footer className="w-full bg-[var(--color-bg-muted)] border-t border-[var(--color-border)] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Logo size={48} variant="full" />
              <h2 className="font-display text-xl font-bold text-[var(--color-primary)]">{BRAND_NAME}</h2>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md leading-relaxed">
              Empowering women and girls through vocational training — the digital learning portal of Perur Rays
              of Hope in West Pokot, Kenya.
            </p>
            <p className="mt-4 text-xs text-[var(--color-text-muted)] italic">
              Rescuing girls. Restoring dignity. Rebuilding futures.
            </p>
          </div>

          <ProhWebsiteCard />
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} {BRAND_NAME} · A Perur Rays of Hope initiative
        </div>
      </div>
    </footer>
  );
}
