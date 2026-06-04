import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminComplaintsClient, { type ComplaintRow } from './AdminComplaintsClient';

export default async function AdminComplaintsPage() {
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

  const { data: complaints } = await supabase
    .from('complaints')
    .select(
      `id, subject, message, status, created_at,
      student:student_id ( full_name, email ),
      complaint_replies ( id, message, created_at, author:author_id ( full_name ) )`
    )
    .order('created_at', { ascending: false });

  return <AdminComplaintsClient complaints={(complaints as unknown as ComplaintRow[]) ?? []} />;
}
