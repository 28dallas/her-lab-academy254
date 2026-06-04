import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { LangProvider } from '@/lib/i18n';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') redirect('/admin');
  if (profile?.role === 'teacher') redirect('/teacher');

  return (
    <LangProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
        <Navbar user={user} role="student" />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar role="student" />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </LangProvider>
  );
}
