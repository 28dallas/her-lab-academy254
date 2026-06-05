'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { normalizeLoginIdentifier } from '@/lib/studentAccount';

export async function login(formData: FormData) {
  try {
    const supabase = await createClient();

    const identifier = normalizeLoginIdentifier((formData.get('studentId') as string) || '');
    const password = formData.get('password') as string;

    if (!identifier) {
      redirect('/login?error=' + encodeURIComponent('Student ID or email is required'));
    }

    if (!password) {
      redirect('/login?error=' + encodeURIComponent('Password is required'));
    }

    const { data: resolvedEmail, error: resolveError } = await supabase.rpc('resolve_login_email', {
      identifier,
    });

    if (resolveError) {
      redirect(
        '/login?error=' +
          encodeURIComponent(
            resolveError.message.includes('resolve_login_email')
              ? 'Login lookup is not configured. Ask an admin to run the latest Supabase migrations.'
              : resolveError.message
          )
      );
    }

    const email = typeof resolvedEmail === 'string' ? resolvedEmail.trim() : '';

    if (!email) {
      redirect('/login?error=' + encodeURIComponent('Invalid student ID or email'));
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
