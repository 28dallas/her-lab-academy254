import { createClient } from '@/utils/supabase/server';
import { mapCourseRow, slugifyCourseTitle, type PublicCourse } from './courseDisplay';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPublishedCourses(): Promise<PublicCourse[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('courses')
    .select('id, title, description, category, cover_emoji, cover_image_url, duration_weeks')
    .eq('is_published', true)
    .order('title', { ascending: true });

  return (data ?? []).map(mapCourseRow);
}

export async function getPublishedCourseById(idOrSlug: string) {
  const supabase = await createClient();
  const selectColumns =
    'id, title, description, category, cover_emoji, cover_image_url, duration_weeks';

  let course = null;

  if (UUID_PATTERN.test(idOrSlug)) {
    const { data } = await supabase
      .from('courses')
      .select(selectColumns)
      .eq('id', idOrSlug)
      .eq('is_published', true)
      .maybeSingle();
    course = data;
  }

  if (!course) {
    const { data } = await supabase
      .from('courses')
      .select(selectColumns)
      .eq('is_published', true);

    course =
      (data ?? []).find((row) => slugifyCourseTitle(row.title) === idOrSlug) ??
      null;
  }

  if (!course) return null;

  const { data: modules } = await supabase
    .from('course_modules')
    .select('id, title, order_index')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  const moduleList = modules ?? [];
  const modulesWithCounts = await Promise.all(
    moduleList.map(async (mod) => {
      const { count } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', mod.id);
      return {
        id: mod.id,
        title: mod.title,
        resourceCount: count ?? 0,
      };
    })
  );

  return {
    ...mapCourseRow(course),
    modules: modulesWithCounts,
  };
}

export async function getPublishedCourseCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  return count ?? 0;
}

