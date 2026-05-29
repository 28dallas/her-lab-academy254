'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const enrollmentCode = formData.get('enrollmentCode') as string;
  const phone = (formData.get('phone') as string | null) || null;

  // Normalize input
  const rawCode = (enrollmentCode || '').trim().toUpperCase();
  const match = rawCode.match(/^([A-Z]{1,3})(\d{5,10})$/);


  if (!match) {
    redirect('/register?error=Invalid enrollment code format');
  }

  const prefix = match[1];
  const suffixDigits = match[2];


  // 1) Validate prefix matches one of the 12 course prefixes
  // (prevents arbitrary codes from being entered)
  const { COURSE_ENROLLMENT_PREFIXES } = await import('@/lib/courseEnrollmentPrefixes');
  const validPrefixes = new Set(Object.values(COURSE_ENROLLMENT_PREFIXES));

  if (!validPrefixes.has(prefix)) {
    redirect('/register?error=Invalid enrollment code prefix');
  }

  // 2) Verify enrollment code exists in DB
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id')
    .eq('enrollment_code', rawCode)
    .single();

  if (courseError || !course) {
    redirect('/register?error=Invalid enrollment code');
  }


  // 2. Register user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (authError) {
    redirect('/register?error=' + authError.message);
  }

  // 3. Create profile manually if trigger doesn't exist, though Supabase might have a trigger.
  // Wait, the prompt didn't specify a trigger for profiles. So we need to insert it manually.
  if (authData.user) {
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
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
