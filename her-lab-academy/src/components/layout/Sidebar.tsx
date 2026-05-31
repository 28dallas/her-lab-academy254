'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  Home, 
  Users, 
  Settings, 
  FileCheck, 
  MessageSquare,
  Award,
  Bell
} from "lucide-react";

interface SidebarProps {
  role: 'admin' | 'teacher' | 'student';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const getLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Analytics Overview', href: '/admin', icon: Home },
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
          { name: 'Certificates', href: '/dashboard/certificates', icon: Award },
          { name: 'Complaints', href: '/dashboard/complaints', icon: MessageSquare },
          { name: 'Profile', href: '/dashboard/profile', icon: Settings },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex-shrink-0 hidden md:block">
      <div className="h-full flex flex-col py-6">
        <div className="px-6 mb-6">
          <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            {role} Menu
          </h3>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && link.href !== '/teacher' && link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20' 
                    : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
                }`}
              >
                <link.icon className={`h-5 w-5 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
