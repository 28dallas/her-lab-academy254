'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { normalizeStudentCode, resolveStudentEmail } from '@/lib/studentAccount';

export async function register(formData: FormData) {
  try {
    const supabase = await createClient();

    const fullName = (formData.get('fullName') as string)?.trim();
    const password = (formData.get('password') as string) || '';
    const studentId = normalizeStudentCode((formData.get('studentId') as string) || '');
    const courseId = formData.get('courseId') as string;
    const emailInput = (formData.get('email') as string)?.trim().toLowerCase() || '';
    const phone = (formData.get('phone') as string)?.trim() || null;

    if (!fullName || !password || !studentId || !courseId) {
      redirect('/register?error=' + encodeURIComponent('Name, password, student ID, and course are required'));
    }

    const email = resolveStudentEmail(studentId, emailInput);

    const studentQuery = supabase.from('profiles').select('id');
    if (emailInput) {
      studentQuery.or(`student_code.eq.${studentId},email.eq.${emailInput}`);
    } else {
      studentQuery.eq('student_code', studentId);
    }

    const { data: existingStudent } = await studentQuery.maybeSingle();
    if (existingStudent) {
      redirect('/register?error=' + encodeURIComponent('Student ID or email already in use'));
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_code: studentId,
        },
      },
    });

    if (authError || !authData.user) {
      redirect('/register?error=' + encodeURIComponent(authError?.message ?? 'Registration failed'));
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'student',
        student_code: studentId,
        ...(phone ? { phone } : {}),
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      redirect('/register?error=' + encodeURIComponent(profileError.message));
    }

    const { error: enrollError } = await supabase.from('enrollments').insert({
      student_id: authData.user.id,
      course_id: courseId,
    });

    if (enrollError) {
      redirect('/register?error=' + encodeURIComponent(enrollError.message));
    }

    revalidatePath('/', 'layout');
    const loginHint = emailInput
      ? 'Account created. Log in with your Student ID or email and your password.'
      : 'Account created. Log in with your Student ID and password (email was optional).';
    redirect('/login?success=' + encodeURIComponent(loginHint));
  } catch (e) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') {
      throw e;
    }
    const message = e instanceof Error ? e.message : 'Registration failed';
    redirect('/register?error=' + encodeURIComponent(message));
  }
}

