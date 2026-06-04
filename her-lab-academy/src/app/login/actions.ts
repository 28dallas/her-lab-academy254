'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  try {
    const supabase = await createClient();

    const studentId = (formData.get('studentId') as string)?.trim();
    const password = formData.get('password') as string;

    if (!studentId) {
      redirect('/login?error=' + encodeURIComponent('Student ID or email is required'));
    }

    let email = studentId;
    if (!studentId.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .or(`student_code.eq.${studentId},id.eq.${studentId}`)
        .maybeSingle();

      if (profileError || !profile?.email) {
        redirect('/login?error=' + encodeURIComponent('Invalid student ID or email'));
      }
      email = profile.email;
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !signInData.user) {
      redirect('/login?error=' + encodeURIComponent(error?.message ?? 'Login failed'));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .single();

    revalidatePath('/', 'layout');

    const role = profile?.role;
    if (role === 'admin') redirect('/admin');
    if (role === 'teacher') redirect('/teacher');
    redirect('/dashboard');
  } catch (e) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') {
      throw e;
    }
    const message = e instanceof Error ? e.message : 'Login failed';
    redirect('/login?error=' + encodeURIComponent(message));
  }
}

