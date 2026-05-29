import type { SupabaseClient } from '@supabase/supabase-js';
import { issueCertificateIfNeeded } from './certificates';

/** Recalculate enrollment progress from viewed resources. */
export async function recalculateCourseProgress(
  supabase: SupabaseClient,
  studentId: string,
  courseId: string
) {
  const { data: modules } = await supabase
    .from('course_modules')
    .select('id')
    .eq('course_id', courseId);

  const moduleIds = (modules ?? []).map((m) => m.id);
  if (moduleIds.length === 0) {
    await supabase
      .from('enrollments')
      .update({ progress_percent: 0, completed: false, completed_at: null })
      .eq('student_id', studentId)
      .eq('course_id', courseId);
    return 0;
  }

  const { data: resources } = await supabase
    .from('resources')
    .select('id')
    .in('module_id', moduleIds);

  const resourceIds = (resources ?? []).map((r) => r.id);
  if (resourceIds.length === 0) {
    await supabase
      .from('enrollments')
      .update({ progress_percent: 0, completed: false, completed_at: null })
      .eq('student_id', studentId)
      .eq('course_id', courseId);
    return 0;
  }

  const { count: viewedCount } = await supabase
    .from('student_progress')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .in('resource_id', resourceIds);

  const percent = Math.round(((viewedCount ?? 0) / resourceIds.length) * 100);
  const completed = percent >= 100;

  await supabase
    .from('enrollments')
    .update({
      progress_percent: percent,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('student_id', studentId)
    .eq('course_id', courseId);

  if (completed) {
    await issueCertificateIfNeeded(supabase, studentId, courseId);
  }

  return percent;
}
