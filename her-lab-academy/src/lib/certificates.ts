import type { SupabaseClient } from '@supabase/supabase-js';
import { generateCertificate } from '@/app/actions/generateCertificate';

/** Issue PDF certificate when student completes a course (idempotent). */
export async function issueCertificateIfNeeded(
  supabase: SupabaseClient,
  studentId: string,
  courseId: string
): Promise<{ issued: boolean; error?: string }> {
  const { data: existing } = await supabase
    .from('certificates')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (existing) return { issued: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', studentId)
    .single();

  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .single();

  if (!course) return { issued: false, error: 'Course not found' };

  const studentName = profile?.full_name ?? 'Student';
  const completionDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const certificateId = crypto.randomUUID().slice(0, 8).toUpperCase();

  const pdfBytes = await generateCertificate({
    studentName,
    courseName: course.title,
    completionDate,
    certificateId,
  });

  const storagePath = `${studentId}/${courseId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('certificates')
    .upload(storagePath, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) {
    return { issued: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from('certificates')
    .getPublicUrl(storagePath);

  const { error: insertError } = await supabase.from('certificates').insert({
    student_id: studentId,
    course_id: courseId,
    certificate_url: urlData.publicUrl,
  });

  if (insertError) {
    return { issued: false, error: insertError.message };
  }

  return { issued: true };
}
