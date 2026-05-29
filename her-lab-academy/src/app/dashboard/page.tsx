import { createClient } from '@/utils/supabase/server';
import StudentDashboardClient from './StudentDashboardClient';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, progress_percent, completed')
    .eq('student_id', user!.id);

  const courseIds = (enrollments ?? []).map(e => e.course_id);

  const { data: courses } = courseIds.length > 0
    ? await supabase.from('courses').select('id, title, cover_emoji, cover_image_url').in('id', courseIds)
    : { data: [] };

  const myCourses = (courses ?? []).map(c => {
    const enroll = enrollments!.find(e => e.course_id === c.id);
    return {
      id: c.id,
      title: c.title,
      icon: c.cover_emoji ?? '📚',
      coverImageUrl: c.cover_image_url,
      progress: enroll?.progress_percent ?? 0,
      status: enroll?.completed ? 'Completed' : 'In Progress',
    };
  });

  const { data: notices } = await supabase
    .from('forum_posts')
    .select('id, content, created_at')
    .eq('type', 'announcement')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <StudentDashboardClient
      name={profile?.full_name ?? 'Student'}
      myCourses={myCourses}
      notices={(notices ?? []).map(n => ({
        id: n.id,
        title: 'Announcement',
        date: new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        content: n.content,
      }))}
    />
  );
}
