'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
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
    const adminClient = createAdminClient();

    if (!adminClient) {
      redirect(
        '/setup-password?error=' +
          encodeURIComponent('Admin service role key is not configured in the server environment.')
      );
    }

    // Get the student profile status
    const { data: statusData, error: statusError } = await supabase.rpc('get_student_login_status', {
      identifier: studentId,
    });

    const loginStatus = statusData && statusData.length > 0 ? statusData[0] : null;

    if (statusError || !loginStatus) {
      redirect('/setup-password?error=' + encodeURIComponent('Student not found'));
    }

    if (!loginStatus.profile_email) {
      redirect('/setup-password?error=' + encodeURIComponent('No email on record. Contact admin.'));
    }

    if (loginStatus.has_signed_in) {
      redirect(
        '/setup-password?error=' +
          encodeURIComponent('Password has already been set up. Please log in directly.')
      );
    }

    const email = loginStatus.profile_email;
    const role = loginStatus.profile_role;
    const profileId = loginStatus.profile_id;

    // Check if auth account already exists
    const { data: existingAuth } = await adminClient.auth.admin.getUserById(profileId);

    if (!existingAuth?.user) {
      // Create auth account for this student
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          student_code: studentId,
        },
      });

      if (authError || !authData.user) {
        redirect('/setup-password?error=' + encodeURIComponent(authError?.message ?? 'Failed to create account'));
      }

      // Update profile ID if different
      if (authData.user.id !== profileId) {
        await adminClient
          .from('profiles')
          .update({ id: authData.user.id })
          .eq('student_code', studentId);
      }
    } else {
      // Update existing user password
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        profileId,
        { password }
      );

      if (updateError) {
        redirect('/setup-password?error=' + encodeURIComponent(updateError.message));
      }
    }

    // Sign them in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.user) {
      redirect('/setup-password?error=' + encodeURIComponent(signInError?.message ?? 'Login failed'));
    }

    revalidatePath('/', 'layout');

    // Redirect based on role
    if (role === 'admin') redirect('/admin');
    if (role === 'teacher') redirect('/teacher');
    redirect('/dashboard');
  } catch (e) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') {
      throw e;
    }
    const message = e instanceof Error ? e.message : 'Setup failed';
    redirect('/setup-password?error=' + encodeURIComponent(message));
  }
}
