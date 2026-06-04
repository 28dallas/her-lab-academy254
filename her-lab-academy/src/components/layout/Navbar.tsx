'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { BRAND_NAME } from "@/lib/brand";
import { LogOut, Menu, Languages } from "lucide-react";
import { AvatarFallback } from "@/components/ui/AvatarFallback";
import { useState } from "react";
import { LangProvider, useLang } from "@/lib/i18n";

function StudentLangToggle() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t, toggle } = useLang();
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] border border-[var(--color-border)] px-2.5 py-1.5 rounded-lg transition-colors"
      >
        <Languages className="w-3.5 h-3.5" />
        {t('langToggle')}
      </button>
    );
  } catch {
    return null;
  }
}

interface NavbarProps {
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  role?: string | null;
}

export function Navbar({ user, role }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/courses');

  const roleBadgeColor =
    role === 'admin' ? 'bg-orange-500/20 text-orange-300' :
    role === 'teacher' ? 'bg-emerald-500/20 text-emerald-300' :
    'bg-sky-500/20 text-sky-300';

  const navLink =
    'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] px-3 py-2 text-sm font-medium transition-colors';

  return (
    <nav className="bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <Logo size={56} priority className="shrink-0" />
              <span className="font-display font-bold text-sm sm:text-xl text-[var(--color-text-dark)] leading-tight truncate">
                {BRAND_NAME}
              </span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-4">
            {isPublicRoute && !user && (
              <>
                <Link href="/courses" className={navLink}>Courses</Link>
                <Link href="/login" className={navLink}>Login</Link>
                <Link
                  href="/register"
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}

            {user && (
              <div className="flex items-center gap-3">
                {role === 'student' && <StudentLangToggle />}
                <Link
                  href={role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/dashboard'}
                  className={navLink}
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-[var(--color-border)]">
                  <AvatarFallback name={user.user_metadata?.full_name || user.email} size="sm" />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-[var(--color-text)] leading-tight">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${roleBadgeColor}`}>
                      {role || 'student'}
                    </span>
                  </div>
                </div>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 font-medium px-2 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign out</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="pt-2 pb-3 space-y-1">
            {!user ? (
              <>
                <Link href="/courses" className="block px-4 py-2 text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  Courses
                </Link>
                <Link href="/login" className="block px-4 py-2 text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  Login
                </Link>
                <Link href="/register" className="block px-4 py-2 text-base font-medium text-[var(--color-primary)]">
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-3 flex items-center gap-3 border-b border-[var(--color-border)] mb-2">
                  <AvatarFallback name={user.user_metadata?.full_name || user.email} size="sm" />
                  <div>
                    <div className="text-base font-medium text-[var(--color-text)]">{user.user_metadata?.full_name || 'User'}</div>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${roleBadgeColor}`}>
                      {role || 'student'}
                    </span>
                  </div>
                </div>
                <Link
                  href={role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/dashboard'}
                  className="block px-4 py-2 text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                >
                  Dashboard
                </Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="w-full text-left flex items-center gap-2 px-4 py-2 text-base font-medium text-red-400 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
