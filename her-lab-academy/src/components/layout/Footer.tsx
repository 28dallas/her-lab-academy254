import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-[var(--color-text-dark)] text-white py-8 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
            <Image
              src="/logo/logo.svg"
              alt="Perur Rays of Hope"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <h2 className="font-display text-xl font-bold text-[var(--color-primary)]">Her Lab Academy</h2>
          </div>
          <p className="text-sm text-gray-400">Empowering women and girls through vocational training.</p>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Link 
            href="https://perurraysofhopeke.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm hover:text-[var(--color-primary)] transition-colors flex items-center gap-2"
          >
            Back to perurraysofhopeke.org
          </Link>
          <p className="text-xs text-gray-500 italic max-w-xs text-center">
            Rescuing girls. Restoring dignity. Rebuilding futures.
          </p>
        </div>
      </div>
    </footer>
  );
}
