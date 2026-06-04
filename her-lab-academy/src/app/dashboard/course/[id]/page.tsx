import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MessageSquare, Award, BookOpen, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function StudentCourseHome({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('progress_percent, completed')
    .eq('student_id', user.id)
    .eq('course_id', params.id)
    .maybeSingle();

  if (!enrollment) {
    return (
      <div className="max-w-5xl mx-auto pb-12 text-center py-20">
        <p className="text-gray-500">You are not enrolled in this course.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-[var(--color-primary)] hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, description, teacher:teacher_id ( full_name )')
    .eq('id', params.id)
    .single();

  const { data: modules } = await supabase
    .from('course_modules')
    .select('id, title, description, order_index')
    .eq('course_id', params.id)
    .order('order_index', { ascending: true });

  const moduleList = modules ?? [];
  const moduleIds = moduleList.map((m) => m.id);

  const { data: resources } =
    moduleIds.length > 0
      ? await supabase
          .from('resources')
          .select('id, module_id')
          .in('module_id', moduleIds)
      : { data: [] };

  const resourceIds = (resources ?? []).map((r) => r.id);

  const { data: viewed } =
    resourceIds.length > 0
      ? await supabase
          .from('student_progress')
          .select('resource_id')
          .eq('student_id', user.id)
          .in('resource_id', resourceIds)
      : { data: [] };

  const viewedSet = new Set((viewed ?? []).map((v) => v.resource_id));

  const { data: announcements } = await supabase
    .from('forum_posts')
    .select('id, content, created_at')
    .eq('course_id', params.id)
    .eq('type', 'announcement')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, title')
    .eq('course_id', params.id)
    .order('created_at', { ascending: false });

  const teacherName =
    (course?.teacher as { full_name?: string } | null)?.full_name ??
    'Teacher not assigned yet';

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="bg-[var(--color-secondary)] rounded-2xl p-8 text-white mb-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-md mb-4">
            Course
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            {course?.title ?? 'Course'}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              {teacherName.charAt(0)}
            </div>
            <span className="font-medium text-white/90">{teacherName}</span>
          </div>
          {course?.description && (
            <p className="text-white/80 text-sm max-w-2xl">{course.description}</p>
          )}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 max-w-xs bg-white/20 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-[var(--color-primary)] transition-all"
                style={{ width: `${enrollment.progress_percent ?? 0}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{enrollment.progress_percent ?? 0}%</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/course/${params.id}/forum`}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4 inline-block mr-2" /> Forum
            </Link>
            {(enrollment.completed || (enrollment.progress_percent ?? 0) >= 100) && (
              <Link
                href={`/dashboard/evaluation/${params.id}`}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Award className="w-4 h-4 inline-block mr-2" /> Evaluate Lecturer
              </Link>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[var(--color-primary)]" /> Course Modules
      </h2>

      {moduleList.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
          <p className="text-gray-500">No course modules have been assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {moduleList.map((mod) => {
            const modResources = (resources ?? []).filter((r) => r.module_id === mod.id);
            const modViewed = modResources.filter((r) => viewedSet.has(r.id)).length;
            const modTotal = modResources.length;
            const modPct =
              modTotal === 0 ? 0 : Math.round((modViewed / modTotal) * 100);

            return (
              <Link
                key={mod.id}
                href={`/dashboard/course/${params.id}/module/${mod.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-[var(--color-primary)]/40 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-sm text-gray-500 mt-1">{mod.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {modTotal} resource{modTotal !== 1 ? 's' : ''} · {modPct}% complete
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {(quizzes ?? []).length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quizzes</h2>
          <div className="space-y-2">
            {quizzes!.map((q) => (
              <Link
                key={q.id}
                href={`/dashboard/course/${params.id}/quiz/${q.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[var(--color-primary)]/40"
              >
                <span className="font-medium text-gray-900">{q.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(announcements ?? []).length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Announcements</h2>
          <div className="space-y-3">
            {announcements!.map((a) => (
              <div
                key={a.id}
                className="bg-[var(--color-accent)] border border-[var(--color-primary)]/20 rounded-xl p-4"
              >
                <p className="text-xs text-[var(--color-primary)] font-semibold mb-1">
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString('en-GB')
                    : ''}
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
