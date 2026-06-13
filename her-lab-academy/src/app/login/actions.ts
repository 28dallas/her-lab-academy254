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

    const { data: statusData, error: statusError } = await supabase.rpc('get_student_login_status', {
      identifier,
    });

    if (statusError) {
      redirect(
        '/login?error=' +
          encodeURIComponent(
            statusError.message.includes('get_student_login_status')
              ? 'Login lookup is not configured. Ask an admin to run the latest Supabase migrations.'
              : statusError.message
          )
      );
    }

    const loginStatus = statusData && statusData.length > 0 ? statusData[0] : null;

    if (!loginStatus) {
      redirect('/login?error=' + encodeURIComponent('Student ID not found'));
    }

    const email = loginStatus.profile_email;
    const role = loginStatus.profile_role;
    const hasSignedIn = loginStatus.has_signed_in;

    // If no password provided, check if this is a first-time CSV student
    if (!password) {
      if (!hasSignedIn) {
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
