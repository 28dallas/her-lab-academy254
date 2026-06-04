'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BookOpen,
  Home,
  Users,
  Settings,
  FileCheck,
  MessageSquare,
  Award,
  Bell,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'teacher' | 'student';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const getLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin', icon: Home },
          { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
          { name: 'Courses', href: '/admin/courses', icon: BookOpen },
          { name: 'Users', href: '/admin/users', icon: Users },
          { name: 'Certificates', href: '/admin/certificates', icon: Award },
          { name: 'Complaints', href: '/admin/complaints', icon: MessageSquare },
          { name: 'Notices', href: '/admin/notices', icon: Bell },
          { name: 'Surveys', href: '/admin/surveys', icon: FileCheck },
        ];
      case 'teacher':
        return [
          { name: 'Overview', href: '/teacher', icon: Home },
          { name: 'My Courses', href: '/teacher', icon: BookOpen },
        ];
      case 'student':
      default:
        return [
          { name: 'My Dashboard', href: '/dashboard', icon: Home },
          { name: 'Notices', href: '/dashboard/notices', icon: Bell },
          { name: 'Results', href: '/dashboard/results', icon: FileCheck },
          { name: 'Certificates', href: '/dashboard/certificates', icon: Award },
          { name: 'Complaints', href: '/dashboard/complaints', icon: MessageSquare },
          { name: 'Profile', href: '/dashboard/profile', icon: Settings },
        ];
    }
  };

  const links = getLinks();

  const NavLinks = ({ onNav }: { onNav?: () => void }) => (
    <>
      <div className="px-6 mb-6">
        <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          {role} Menu
        </h3>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== '/admin' &&
              link.href !== '/teacher' &&
              link.href !== '/dashboard' &&
              pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onNav}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20'
                  : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
              }`}
            >
              <link.icon
                className={`h-5 w-5 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-5 left-5 z-50 bg-[var(--color-primary)] text-white p-3 rounded-full shadow-lg shadow-black/30"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-72 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col py-6 z-10">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <NavLinks onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex-shrink-0 hidden md:block">
        <div className="h-full flex flex-col py-6">
          <NavLinks />
        </div>
      </aside>
    </>
  );
}
