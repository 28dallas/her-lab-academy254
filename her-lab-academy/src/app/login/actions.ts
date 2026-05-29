'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
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
}
