import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminCoursesClient from './AdminCoursesClient';

export default async function AdminCoursesPage() {
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

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, category, enrollment_code, is_published, teacher_id')
    .order('created_at', { ascending: false });

  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'teacher')
    .order('full_name');

  const teacherMap = new Map((teachers ?? []).map((t) => [t.id, t.full_name]));

  const courseRows = (courses ?? []).map((c) => ({
    ...c,
    teacher_name: c.teacher_id ? teacherMap.get(c.teacher_id) : undefined,
  }));

  return (
    <AdminCoursesClient
      courses={courseRows}
      teachers={(teachers ?? []).map((t) => ({
        id: t.id,
        full_name: t.full_name ?? 'Teacher',
      }))}
    />
  );
}
