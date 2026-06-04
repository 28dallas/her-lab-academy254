import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  const [{ data: users }, { data: courses }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, student_code, role, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('courses')
      .select('id, title')
      .order('title', { ascending: true }),
  ]);

  return <AdminUsersClient users={users ?? []} courses={courses ?? []} />;
}
