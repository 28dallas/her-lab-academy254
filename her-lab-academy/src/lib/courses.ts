import { createClient } from '@/utils/supabase/server';
import { mapCourseRow, type PublicCourse } from './courseDisplay';

export async function getPublishedCourses(): Promise<PublicCourse[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('courses')
    .select('id, title, description, category, cover_emoji, cover_image_url, duration_weeks')
    .eq('is_published', true)
    .order('title', { ascending: true });

  return (data ?? []).map(mapCourseRow);
}

export async function getPublishedCourseById(id: string) {
  const supabase = await createClient();

  // If the route param isn't a UUID, avoid unnecessary DB queries
  const uuidV4Like = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidV4Like.test(id)) return null;

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, description, category, cover_emoji, cover_image_url, duration_weeks')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (!course) return null;


  const { data: modules } = await supabase
    .from('course_modules')
    .select('id, title, order_index')
    .eq('course_id', id)
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
