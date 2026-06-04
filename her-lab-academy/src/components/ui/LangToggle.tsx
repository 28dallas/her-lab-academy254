'use client';
import { useLang } from '@/lib/i18n';
import { Languages } from 'lucide-react';

export function LangToggle() {
  const { t, toggle } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] border border-[var(--color-border)] px-2.5 py-1.5 rounded-lg transition-colors"
      title="Switch language / Badilisha lugha"
    >
      <Languages className="w-3.5 h-3.5" />
      {t('langToggle')}
    </button>
  );
}
