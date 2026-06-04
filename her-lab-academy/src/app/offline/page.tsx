import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="text-center max-w-md">
        <WifiOff className="w-16 h-16 text-[var(--color-primary)] mx-auto mb-6" />
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-dark)] mb-3">
          You are offline
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          No internet connection. Previously visited pages are still available.
          Connect to the internet to access new content.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Try Homepage
        </Link>
      </div>
    </div>
  );
}
