'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { recalculateCourseProgress } from '@/lib/progress';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const fullName = (formData.get('fullName') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || null;

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/profile');
  return { success: true };
}

export async function markResourceViewed(
  courseId: string,
  resourceId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle();

  if (!enrollment) return { error: 'Not enrolled in this course' };

  const { error } = await supabase.from('student_progress').upsert(
    { student_id: user.id, resource_id: resourceId },
    { onConflict: 'student_id,resource_id' }
  );

  if (error) return { error: error.message };

  const percent = await recalculateCourseProgress(supabase, user.id, courseId);

  revalidatePath(`/dashboard/course/${courseId}`);
  revalidatePath(`/dashboard/course/${courseId}/module`);
  revalidatePath('/dashboard/certificates');
  return { success: true, progressPercent: percent };
}

export async function submitEvaluation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const courseId = formData.get('courseId') as string;
  const rating = Number(formData.get('rating'));
  const feedback = (formData.get('feedback') as string)?.trim() || null;

  if (!courseId || rating < 1 || rating > 5) {
    return { error: 'Invalid evaluation' };
  }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('completed, progress_percent')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .single();

  if (!enrollment?.completed && (enrollment?.progress_percent ?? 0) < 100) {
    return { error: 'Complete the course before evaluating' };
  }

  const { data: course } = await supabase
    .from('courses')
    .select('teacher_id')
    .eq('id', courseId)
    .single();

  const { error } = await supabase.from('evaluations').insert({
    student_id: user.id,
    course_id: courseId,
    teacher_id: course?.teacher_id,
    rating,
    feedback,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/evaluation/${courseId}`);
  return { success: true };
}

export async function submitQuiz(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const quizId = formData.get('quizId') as string;
  const selectedIndex = Number(formData.get('selectedIndex'));

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('correct_index')
    .eq('quiz_id', quizId);

  if (!questions?.length) return { error: 'Quiz not found' };

  const correct = questions.filter((q) => q.correct_index === selectedIndex).length;
  const score = Math.round((correct / questions.length) * 100);
  const { data: quiz } = await supabase.from('quizzes').select('passing_score').eq('id', quizId).single();
  const passed = score >= (quiz?.passing_score ?? 70);

  const { error } = await supabase.from('quiz_submissions').upsert(
    {
      quiz_id: quizId,
      student_id: user.id,
      score,
      passed,
      answers: { selectedIndex },
    },
    { onConflict: 'quiz_id,student_id' }
  );

  if (error) return { error: error.message };

  return { success: true, score, passed };
}
