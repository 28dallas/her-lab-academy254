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
  const coverImageUrl = (formData.get('coverImageUrl') as string)?.trim() || null;

  if (!title) return { error: 'Title is required' };

  const { COURSE_ENROLLMENT_PREFIXES } = await import('@/lib/courseEnrollmentPrefixes');
  const validPrefixes = new Set(Object.values(COURSE_ENROLLMENT_PREFIXES));

  const customCode = (formData.get('enrollmentCode') as string)?.trim().toUpperCase();
  let enrollmentCode = '';

  if (customCode) {
    const match = customCode.match(/^([A-Z]{1,3})(\d{5})$/);
    if (!match) {
      return { error: 'Invalid enrollment code format. Must be 1-3 letters followed by exactly 5 digits (e.g. EI12345).' };
    }
    const prefix = match[1];
    if (!validPrefixes.has(prefix)) {
      return { error: `Invalid enrollment code prefix "${prefix}". Valid prefixes are: ${Array.from(validPrefixes).join(', ')}` };
    }
    
    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('enrollment_code', customCode)
      .maybeSingle();
    if (existing) {
      return { error: `Enrollment code "${customCode}" is already in use by another course.` };
    }
    enrollmentCode = customCode;
  } else {
    enrollmentCode = generateEnrollmentCode(title);
    const genMatch = enrollmentCode.match(/^([A-Z]{1,3})(\d{5})$/);
    if (!genMatch || !validPrefixes.has(genMatch[1])) {
      return { error: `No enrollment code prefix mapped for course title "${title}". Please assign a custom enrollment code manually.` };
    }

    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase
        .from('courses')
        .select('id')
        .eq('enrollment_code', enrollmentCode)
        .maybeSingle();
      if (!existing) break;
      enrollmentCode = generateEnrollmentCode(title);
    }
  }

  const { error } = await supabase.from('courses').insert({
    title,
    description,
    category,
    teacher_id: teacherId || null,
    cover_emoji: coverEmoji,
    cover_image_url: coverImageUrl,
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

  const { data: complaint } = await supabase
    .from('complaints')
    .select('subject, student:student_id ( email )')
    .eq('id', complaintId)
    .single();

  const studentEmail = (complaint?.student as { email?: string } | null)?.email;
  if (studentEmail) {
    const { notifyComplaintReply } = await import('@/lib/email');
    await notifyComplaintReply(studentEmail, complaint?.subject ?? 'Complaint');
  }

  revalidatePath('/admin/complaints');
  revalidatePath('/dashboard/complaints');
  return { success: true };
}

export async function issueCertificateManually(formData: FormData) {
  const { supabase } = await requireAdmin();

  const studentId = formData.get('studentId') as string;
  const courseId = formData.get('courseId') as string;

  if (!studentId || !courseId) return { error: 'Student and course required' };

  const { issueCertificateIfNeeded } = await import('@/lib/certificates');

  await supabase
    .from('enrollments')
    .update({
      progress_percent: 100,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('student_id', studentId)
    .eq('course_id', courseId);

  const result = await issueCertificateIfNeeded(supabase, studentId, courseId);
  if (result.error) return { error: result.error };

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', studentId)
    .single();

  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .single();

  if (profile?.email && course?.title) {
    const { notifyCertificate } = await import('@/lib/email');
    await notifyCertificate(profile.email, course.title);
  }

  revalidatePath('/admin/certificates');
  return { success: true, issued: result.issued };
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
