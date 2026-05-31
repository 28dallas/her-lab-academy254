import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'teacher') redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar user={user} role="teacher" />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar role="teacher" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
