'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

async function requireCourseTeacher(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: course } = await supabase
    .from('courses')
    .select('teacher_id')
    .eq('id', courseId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isTeacher = course?.teacher_id === user.id;

  if (!isTeacher && !isAdmin) throw new Error('Not authorized for this course');

  return { supabase, user };
}

export async function createModule(courseId: string, formData: FormData) {
  const { supabase } = await requireCourseTeacher(courseId);

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  if (!title) return { error: 'Title is required' };

  const { data: existing } = await supabase
    .from('course_modules')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order_index ?? 0) + 1;

  const { error } = await supabase.from('course_modules').insert({
    course_id: courseId,
    title,
    description,
    order_index: nextOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/teacher/course/${courseId}/outline`);
  return { success: true };
}

export async function updateModule(
  courseId: string,
  moduleId: string,
  formData: FormData
) {
  const { supabase } = await requireCourseTeacher(courseId);

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;

  const { error } = await supabase
    .from('course_modules')
    .update({ title, description })
    .eq('id', moduleId)
    .eq('course_id', courseId);

  if (error) return { error: error.message };

  revalidatePath(`/teacher/course/${courseId}/outline`);
  return { success: true };
}

export async function deleteModule(courseId: string, moduleId: string) {
  const { supabase } = await requireCourseTeacher(courseId);

  const { error } = await supabase
    .from('course_modules')
    .delete()
    .eq('id', moduleId)
    .eq('course_id', courseId);

  if (error) return { error: error.message };

  revalidatePath(`/teacher/course/${courseId}/outline`);
  return { success: true };
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  const { supabase } = await requireCourseTeacher(courseId);

  await Promise.all(
    moduleIds.map((id, index) =>
      supabase
        .from('course_modules')
        .update({ order_index: index + 1 })
        .eq('id', id)
        .eq('course_id', courseId)
    )
  );

  revalidatePath(`/teacher/course/${courseId}/outline`);
  return { success: true };
}

export async function createResource(courseId: string, formData: FormData) {
  const { supabase } = await requireCourseTeacher(courseId);

  const moduleId = formData.get('moduleId') as string;
  const title = (formData.get('title') as string)?.trim();
  const type = formData.get('type') as string;
  const url = (formData.get('url') as string)?.trim() || null;
  const textContent = (formData.get('textContent') as string)?.trim() || null;
  const fileSize = (formData.get('fileSize') as string)?.trim() || null;

  if (!moduleId || !title || !type) return { error: 'Missing required fields' };

  const { data: mod } = await supabase
    .from('course_modules')
    .select('id')
    .eq('id', moduleId)
    .eq('course_id', courseId)
    .single();

  if (!mod) return { error: 'Module not found' };

  const { data: existing } = await supabase
    .from('resources')
    .select('order_index')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order_index ?? 0) + 1;

  const { error } = await supabase.from('resources').insert({
    module_id: moduleId,
    title,
    type,
    url,
    text_content: textContent,
    file_size: fileSize,
    order_index: nextOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/teacher/course/${courseId}/resources`);
  revalidatePath(`/teacher/course/${courseId}/outline`);
  return { success: true };
}

export async function deleteResource(
  courseId: string,
  resourceId: string
) {
  const { supabase } = await requireCourseTeacher(courseId);

  const { error } = await supabase.from('resources').delete().eq('id', resourceId);

  if (error) return { error: error.message };

  revalidatePath(`/teacher/course/${courseId}/resources`);
  revalidatePath(`/teacher/course/${courseId}/outline`);
  return { success: true };
}

export async function postCourseAnnouncement(
  courseId: string,
  formData: FormData
) {
  const { supabase, user } = await requireCourseTeacher(courseId);

  const title = (formData.get('title') as string)?.trim();
  const content = (formData.get('content') as string)?.trim();
  if (!title || !content) return { error: 'Title and content are required' };

  const { error } = await supabase.from('forum_posts').insert({
    course_id: courseId,
    author_id: user.id,
    content: `**${title}**\n\n${content}`,
    type: 'announcement',
  });

  if (error) return { error: error.message };

  revalidatePath(`/teacher/course/${courseId}/announcements`);
  revalidatePath('/dashboard/notices');
  return { success: true };
}

export async function deleteAnnouncement(
  courseId: string,
  postId: string
) {
  const { supabase } = await requireCourseTeacher(courseId);

  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)
    .eq('course_id', courseId)
    .eq('type', 'announcement');

  if (error) return { error: error.message };

  revalidatePath(`/teacher/course/${courseId}/announcements`);
  return { success: true };
}
