import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Award, Download } from 'lucide-react';

export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Please sign in</h3>
          <Link href="/login" className="mt-4 inline-block text-[var(--color-primary)] font-medium hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const { data: certificates } = await supabase
    .from('certificates')
    .select('id, course_id, issued_at, certificate_url, course:course_id ( title )')
    .eq('student_id', user.id)
    .order('issued_at', { ascending: false });

  const certificateRows = certificates ?? [];

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <Award className="w-8 h-8 text-[var(--color-primary)]" /> My Certificates
        </h1>
        <p className="text-gray-600 mt-2">
          Certificates are issued automatically when you complete 100% of a course.
        </p>
      </div>

      {certificateRows.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No certificates yet</h3>
          <p className="text-gray-500 mt-1">Complete a course to earn your first certificate.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[var(--color-primary)] font-medium hover:underline">
            Go to My Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {certificateRows.map((cert) => {
            const courseTitle =
              (cert.course as { title?: string } | null)?.title ?? 'Course Certificate';
            return (
              <div
                key={cert.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                    <Award className="w-7 h-7 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{courseTitle}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Issued:{' '}
                      {cert.issued_at
                        ? new Date(cert.issued_at).toLocaleDateString('en-GB')
                        : '—'}
                    </p>
                  </div>
                </div>
                {cert.certificate_url ? (
                  <a
                    href={cert.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#cf5626] flex-shrink-0"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">Processing...</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
