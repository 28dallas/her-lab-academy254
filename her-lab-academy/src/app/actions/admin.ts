'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { generateEnrollmentCode } from '@/lib/enrollmentCode';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Admin access required');
  return { supabase, user };
}

export async function createCourse(formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const category = (formData.get('category') as string)?.trim() || null;
  const teacherId = (formData.get('teacherId') as string) || null;
  const coverEmoji = (formData.get('coverEmoji') as string)?.trim() || '📚';
  const durationWeeks = formData.get('durationWeeks')
    ? Number(formData.get('durationWeeks'))
    : null;

  if (!title) return { error: 'Title is required' };

  let enrollmentCode = generateEnrollmentCode(title);
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('enrollment_code', enrollmentCode)
      .maybeSingle();
    if (!existing) break;
    enrollmentCode = generateEnrollmentCode(title);
  }

  const { error } = await supabase.from('courses').insert({
    title,
    description,
    category,
    teacher_id: teacherId || null,
    cover_emoji: coverEmoji,
    duration_weeks: durationWeeks,
    enrollment_code: enrollmentCode,
    is_published: false,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/courses');
  return { success: true, enrollmentCode };
}

export async function updateCourse(formData: FormData) {
  const { supabase } = await requireAdmin();

  const courseId = formData.get('courseId') as string;
  const isPublished = formData.get('isPublished') === 'true';
  const teacherId = (formData.get('teacherId') as string) || null;

  const { error } = await supabase
    .from('courses')
    .update({
      is_published: isPublished,
      teacher_id: teacherId,
    })
    .eq('id', courseId);

  if (error) return { error: error.message };

  revalidatePath('/admin/courses');
  return { success: true };
}

export async function updateUserRole(formData: FormData) {
  const { supabase } = await requireAdmin();

  const userId = formData.get('userId') as string;
  const role = formData.get('role') as string;

  if (!['admin', 'teacher', 'student'].includes(role)) {
    return { error: 'Invalid role' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function postPlatformNotice(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const content = (formData.get('content') as string)?.trim();
  if (!content) return { error: 'Content is required' };

  const { error } = await supabase.from('forum_posts').insert({
    author_id: user.id,
    course_id: null,
    content,
    type: 'announcement',
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/notices');
  revalidatePath('/dashboard/notices');
  return { success: true };
}

export async function replyToComplaint(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const complaintId = formData.get('complaintId') as string;
  const message = (formData.get('message') as string)?.trim();

  if (!complaintId || !message) return { error: 'Message is required' };

  const { error: replyError } = await supabase.from('complaint_replies').insert({
    complaint_id: complaintId,
    author_id: user.id,
    message,
  });

  if (replyError) return { error: replyError.message };

  await supabase
    .from('complaints')
    .update({ status: 'replied' })
    .eq('id', complaintId);

  revalidatePath('/admin/complaints');
  revalidatePath('/dashboard/complaints');
  return { success: true };
}

export async function updateComplaintStatus(formData: FormData) {
  const { supabase } = await requireAdmin();

  const complaintId = formData.get('complaintId') as string;
  const status = formData.get('status') as string;

  if (!['open', 'replied', 'closed'].includes(status)) {
    return { error: 'Invalid status' };
  }

  const { error } = await supabase
    .from('complaints')
    .update({ status })
    .eq('id', complaintId);

  if (error) return { error: error.message };

  revalidatePath('/admin/complaints');
  return { success: true };
}
