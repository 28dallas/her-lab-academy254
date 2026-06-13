'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { normalizeLoginIdentifier } from '@/lib/studentAccount';

function normalizeStudentCodeForLookup(value: string) {

  // Stored format looks like: 02400004/ICT/4/2026/019
  // Users may type slightly differently; normalize by removing whitespace and trimming.
  return value
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}



export async function login(formData: FormData) {
  try {
    const supabase = await createClient();

    const rawIdentifier = (formData.get('studentId') as string) || '';
    const identifier = normalizeLoginIdentifier(rawIdentifier);
    const studentCode = normalizeStudentCodeForLookup(identifier);

    const password = (formData.get('password') as string) || '';


    if (!identifier) {
      redirect('/login?error=' + encodeURIComponent('Student ID or email is required'));
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

    // Check if student exists in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, student_code')
      .or(`student_code.eq.${studentCode},student_code.ilike.%${studentCode}%`)
      .maybeSingle();



    if (!profile) {
      redirect('/login?error=' + encodeURIComponent('Student ID not found'));
    }

    // If no password provided, check if this is a first-time CSV student
    if (!password) {
      // Check if they have an auth account
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      const hasAuthAccount = authUsers?.users?.some(u => u.email === email);

      if (!hasAuthAccount) {
        // CSV student - first time login - redirect to setup password
        redirect('/setup-password?student_id=' + encodeURIComponent(identifier));
      } else {
        // They have an auth account but no password provided
        redirect('/login?error=' + encodeURIComponent('Password is required'));
      }
    }

    // Standard login with password
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !signInData.user) {
      redirect('/login?error=' + encodeURIComponent(error?.message ?? 'Login failed'));
    }

    revalidatePath('/', 'layout');

    const role = profile.role;
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
