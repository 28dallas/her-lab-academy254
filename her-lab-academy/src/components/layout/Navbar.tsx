'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { AvatarFallback } from "@/components/ui/AvatarFallback";
import { useState } from "react";

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
    role === 'admin' ? 'bg-orange-100 text-orange-700' :
    role === 'teacher' ? 'bg-green-100 text-green-700' :
    'bg-blue-100 text-blue-700';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
              <Image
                src="/logo/logo.svg"
                alt="Her Lab Academy"
                width={38}
                height={38}
                className="rounded-full object-cover"
                priority
              />
              <span className="font-display font-bold text-xl text-[var(--color-text-dark)] hidden sm:block">
                Her Lab Academy
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            {isPublicRoute && !user && (
              <>
                <Link href="/courses" className="text-gray-500 hover:text-[var(--color-primary)] px-3 py-2 text-sm font-medium">
                  Courses
                </Link>
                <Link href="/login" className="text-gray-500 hover:text-[var(--color-primary)] px-3 py-2 text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-[var(--color-primary)] text-white hover:bg-[#cf5626] px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Register
                </Link>
              </>
            )}

            {user && (
              <div className="flex items-center gap-3">
                <Link
                  href={role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/dashboard'}
                  className="text-gray-500 hover:text-[var(--color-primary)] text-sm font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                  <AvatarFallback name={user.user_metadata?.full_name || user.email} size="sm" />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700 leading-tight">
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
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign out</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white">
          <div className="pt-2 pb-3 space-y-1">
            {!user ? (
              <>
                <Link href="/courses" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-50">
                  Courses
                </Link>
                <Link href="/login" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-50">
                  Login
                </Link>
                <Link href="/register" className="block px-4 py-2 text-base font-medium text-[var(--color-primary)] hover:bg-gray-50">
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 mb-2">
                  <AvatarFallback name={user.user_metadata?.full_name || user.email} size="sm" />
                  <div>
                    <div className="text-base font-medium text-gray-800">{user.user_metadata?.full_name || 'User'}</div>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${roleBadgeColor}`}>
                      {role || 'student'}
                    </span>
                  </div>
                </div>
                <Link
                  href={role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/dashboard'}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="w-full text-left flex items-center gap-2 px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50">
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
