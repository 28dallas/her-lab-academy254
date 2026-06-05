import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { normalizeStudentCode, resolveStudentEmail } from '@/lib/studentAccount';

type StudentRow = {
  full_name?: string;
  email?: string;
  student_code?: string;
  phone?: string;
};

async function enrollStudent(
  supabase: SupabaseClient,
  studentId: string,
  courseId: string
): Promise<{ ok: boolean; already: boolean; error?: string }> {
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (existing) return { ok: true, already: true };

  const { error } = await supabase.from('enrollments').insert({
    student_id: studentId,
    course_id: courseId,
  });

  if (error) {
    if (error.code === '23505') return { ok: true, already: true };
    return { ok: false, already: false, error: error.message };
  }

  return { ok: true, already: false };
}

async function upsertStudentProfile(
  supabase: SupabaseClient,
  userId: string,
  fields: {
    email: string;
    full_name: string;
    student_code: string;
    phone: string | null;
  }
) {
  return supabase.from('profiles').upsert(
    {
      id: userId,
      email: fields.email,
      full_name: fields.full_name,
      student_code: fields.student_code,
      role: 'student',
      ...(fields.phone ? { phone: fields.phone } : {}),
    },
    { onConflict: 'id' }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const students = Array.isArray(body.students) ? (body.students as StudentRow[]) : [];
    const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : '';

    if (students.length === 0) {
      return NextResponse.json({ error: 'No students provided' }, { status: 400 });
    }

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required for bulk import' }, { status: 400 });
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    if (!admin) {
      return NextResponse.json(
        {
          error:
            'Bulk import requires SUPABASE_SERVICE_ROLE_KEY in server environment variables (Vercel → Settings → Environment Variables).',
        },
        { status: 500 }
      );
    }

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

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 400 });
    }

    let created = 0;
    let enrolled = 0;
    let skipped = 0;
    const errors: string[] = [];
    const db = admin;

    for (const rawItem of students) {
      const student_code = normalizeStudentCode(
        typeof rawItem.student_code === 'string' ? rawItem.student_code : ''
      );
      const full_name = typeof rawItem.full_name === 'string' ? rawItem.full_name.trim() : '';
      const phone =
        typeof rawItem.phone === 'string' && rawItem.phone.trim() ? rawItem.phone.trim() : null;
      const email = resolveStudentEmail(
        student_code,
        typeof rawItem.email === 'string' ? rawItem.email : ''
      );

      const label = full_name || student_code || 'unknown row';

      if (!full_name || !student_code) {
        skipped += 1;
        errors.push(`${label}: missing full_name or student_code`);
        continue;
      }

      if (!email) {
        skipped += 1;
        errors.push(`${label}: could not derive email from student ID`);
        continue;
      }

      const { data: byCode } = await db
        .from('profiles')
        .select('id, student_code, email')
        .eq('student_code', student_code)
        .maybeSingle();

      let userId = byCode?.id;

      if (!userId) {
        const { data: byEmail } = await db
          .from('profiles')
          .select('id, student_code')
          .eq('email', email)
          .maybeSingle();

        if (byEmail) {
          if (byEmail.student_code && byEmail.student_code !== student_code) {
            skipped += 1;
            errors.push(`${label}: email already used by another student ID`);
            continue;
          }
          userId = byEmail.id;
        }
      }

      if (userId) {
        const { error: profileError } = await upsertStudentProfile(db, userId, {
          email,
          full_name,
          student_code,
          phone,
        });

        if (profileError) {
          skipped += 1;
          errors.push(`${label}: ${profileError.message}`);
          continue;
        }

        const enrollment = await enrollStudent(db, userId, courseId);
        if (!enrollment.ok) {
          skipped += 1;
          errors.push(`${label}: ${enrollment.error}`);
          continue;
        }

        if (!enrollment.already) enrolled += 1;
        else skipped += 1;
        continue;
      }

      const password = crypto.randomUUID().slice(0, 16) + 'Aa1!';
      const { data: authData, error: authError } = await db.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          student_code,
          role: 'student',
        },
      });

      if (authError) {
        const message = authError.message ?? 'Create user failed';
        if (message.toLowerCase().includes('already') || message.toLowerCase().includes('registered')) {
          const { data: existingProfile } = await db
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (existingProfile?.id) {
            userId = existingProfile.id;
            await upsertStudentProfile(db, userId, { email, full_name, student_code, phone });
            const enrollment = await enrollStudent(db, userId, courseId);
            if (enrollment.ok && !enrollment.already) enrolled += 1;
            else if (enrollment.ok) skipped += 1;
            else {
              skipped += 1;
              errors.push(`${label}: ${enrollment.error}`);
            }
            continue;
          }
        }

        skipped += 1;
        errors.push(`${label}: ${message}`);
        continue;
      }

      if (!authData.user?.id) {
        skipped += 1;
        errors.push(`${label}: missing user id after create`);
        continue;
      }

      userId = authData.user.id;

      const { error: profileError } = await upsertStudentProfile(db, userId, {
        email,
        full_name,
        student_code,
        phone,
      });

      if (profileError) {
        skipped += 1;
        errors.push(`${label}: ${profileError.message}`);
        continue;
      }

      const enrollment = await enrollStudent(db, userId, courseId);
      if (!enrollment.ok) {
        errors.push(`${label}: account created but enrollment failed — ${enrollment.error}`);
        created += 1;
        continue;
      }

      created += 1;
      enrolled += 1;
    }

    return NextResponse.json({
      created,
      enrolled,
      skipped,
      courseTitle: course.title,
      errors,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Import failed' },
      { status: 500 }
    );
  }
}
