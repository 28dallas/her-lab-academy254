'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { normalizeStudentCode } from '@/lib/studentAccount';

export async function setupPassword(formData: FormData) {
  try {
    const studentId = normalizeStudentCode((formData.get('studentId') as string) || '');
    const password = (formData.get('password') as string) || '';
    const confirmPassword = (formData.get('confirmPassword') as string) || '';

    if (!studentId || !password) {
      redirect('/setup-password?error=' + encodeURIComponent('All fields are required'));
    }

    if (password.length < 6) {
      redirect('/setup-password?error=' + encodeURIComponent('Password must be at least 6 characters'));
    }

    if (password !== confirmPassword) {
      redirect('/setup-password?error=' + encodeURIComponent('Passwords do not match'));
    }

    const supabase = await createClient();

    // Get the student profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('student_code', studentId)
      .maybeSingle();

    if (profileError || !profile) {
      redirect('/setup-password?error=' + encodeURIComponent('Student not found'));
    }

    if (!profile.email) {
      redirect('/setup-password?error=' + encodeURIComponent('No email on record. Contact admin.'));
    }

    // Check if auth account already exists
    const { data: existingAuth } = await supabase.auth.admin.getUserById(profile.id);

    if (!existingAuth.user) {
      // Create auth account for this student
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: profile.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: profile.full_name,
          student_code: studentId,
        },
      });

      if (authError || !authData.user) {
        redirect('/setup-password?error=' + encodeURIComponent(authError?.message ?? 'Failed to create account'));
      }

      // Update profile ID if different
      if (authData.user.id !== profile.id) {
        await supabase
          .from('profiles')
          .update({ id: authData.user.id })
          .eq('student_code', studentId);
      }
    } else {
      // Update existing user password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        profile.id,
        { password }
      );

      if (updateError) {
        redirect('/setup-password?error=' + encodeURIComponent(updateError.message));
      }
    }

    // Sign them in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (signInError || !signInData.user) {
      redirect('/setup-password?error=' + encodeURIComponent(signInError?.message ?? 'Login failed'));
    }

    revalidatePath('/', 'layout');

    // Redirect based on role
    if (profile.role === 'admin') redirect('/admin');
    if (profile.role === 'teacher') redirect('/teacher');
    redirect('/dashboard');
  } catch (e) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') {
      throw e;
    }
    const message = e instanceof Error ? e.message : 'Setup failed';
    redirect('/setup-password?error=' + encodeURIComponent(message));
  }
}
