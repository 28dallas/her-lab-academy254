import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type StudentRow = {
  full_name?: string;
  email?: string;
  student_code?: string;
  phone?: string;
};

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeStudentCode(value: unknown) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const students = Array.isArray(body.students) ? body.students : [];

    if (students.length === 0) {
      return NextResponse.json({ error: 'No students provided' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const rawItem of students) {
      const email = normalizeEmail(rawItem.email);
      const student_code = normalizeStudentCode(rawItem.student_code);
      const full_name = typeof rawItem.full_name === 'string' ? rawItem.full_name.trim() : '';
      const phone = typeof rawItem.phone === 'string' && rawItem.phone.trim() ? rawItem.phone.trim() : null;

      if (!email || !student_code) {
        skipped += 1;
        errors.push(`Missing required fields for row: ${JSON.stringify(rawItem)}`);
        continue;
      }

      const password = crypto.randomUUID().slice(0, 16);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            student_code,
            role: 'student',
          },
        },
      });

      if (authError) {
        const message = authError.message ?? 'Sign up failed';
        if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('user already registered')) {
          skipped += 1;
          continue;
        }

        skipped += 1;
        errors.push(`${email}: ${message}`);
        continue;
      }

      if (!authData.user?.id) {
        skipped += 1;
        errors.push(`${email}: missing user id after sign up`);
        continue;
      }

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: authData.user.id,
          email,
          full_name,
          student_code,
          role: 'student',
          ...(phone ? { phone } : {}),
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        errors.push(`${email}: ${profileError.message}`);
      }

      created += 1;
    }

    return NextResponse.json({ created, skipped, errors });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Import failed' },
      { status: 500 }
    );
  }
}
