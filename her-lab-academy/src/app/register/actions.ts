'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function register(formData: FormData) {
  try {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const enrollmentCode = formData.get('enrollmentCode') as string;
    const phone = (formData.get('phone') as string | null) || null;

    // Normalize input
    const rawCode = (enrollmentCode || '').trim().toUpperCase();
    const match = rawCode.match(/^([A-Z]{1,3})(\d{5})$/);

    if (!match) {
      redirect('/register?error=Invalid enrollment code format');
    }

    const prefix = match[1];

    // Validate prefix matches one of the course prefixes
    const { COURSE_ENROLLMENT_PREFIXES } = await import('@/lib/courseEnrollmentPrefixes');
    const validPrefixes = new Set(Object.values(COURSE_ENROLLMENT_PREFIXES));

    if (!validPrefixes.has(prefix)) {
      redirect('/register?error=Invalid enrollment code prefix');
    }

    // Verify enrollment code exists in DB
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('enrollment_code', rawCode)
      .single();

    if (courseError || !course) {
      redirect('/register?error=Invalid enrollment code');
    }

    // Register user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError || !authData.user) {
      redirect(
        '/register?error=' +
          encodeURIComponent(authError?.message ?? 'Registration failed')
      );
    }

    // Create profile manually (if you don't have a DB trigger)
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: authData.user.email,
      full_name: fullName,
      role: 'student',
      ...(phone ? { phone } : {}),
    });

    if (profileError) {
      redirect('/register?error=' + encodeURIComponent(profileError.message));
    }

    const { error: enrollError } = await supabase.from('enrollments').insert({
      student_id: authData.user.id,
      course_id: course.id,
    });

    if (enrollError) {
      redirect('/register?error=' + encodeURIComponent(enrollError.message));
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Registration failed';
    redirect('/register?error=' + encodeURIComponent(message));
  }
}

