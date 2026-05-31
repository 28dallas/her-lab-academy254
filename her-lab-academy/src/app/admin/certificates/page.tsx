import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminCertificatesClient from './AdminCertificatesClient';

export default async function AdminCertificatesPage() {
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

  const { data: certificates } = await supabase
    .from('certificates')
    .select(
      `id, issued_at, certificate_url,
      student:student_id ( id, full_name, email ),
      course:course_id ( id, title )`
    )
    .order('issued_at', { ascending: false });

  const { data: courses } = await supabase.from('courses').select('id, title').order('title');

  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'student')
    .order('full_name');

  return (
    <AdminCertificatesClient
      certificates={(certificates as any) ?? []}
      courses={courses ?? []}
      students={students ?? []}
    />
  );
}
