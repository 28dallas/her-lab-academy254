import { Download, FileCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

interface ResultSlipRow {
  id: string;
  title: string;
  file_url: string;
  file_size: string | null;
  remarks: string | null;
  issued_at: string;
  course: { title: string } | { title: string }[] | null;
}

export default async function StudentResultsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('result_slips')
    .select('id, title, file_url, file_size, remarks, issued_at, course:course_id ( title )')
    .eq('student_id', user.id)
    .order('issued_at', { ascending: false });

  const resultSlips = ((data as unknown as ResultSlipRow[]) ?? []);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-[var(--color-primary)]" /> Results
        </h1>
        <p className="text-gray-600 mt-2">Download result slips uploaded by your teacher.</p>
      </div>

      {resultSlips.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No results yet</h3>
          <p className="text-gray-500 mt-1">Your result slips will appear here after upload.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
          {resultSlips.map((slip) => {
            const rawCourse = slip.course;
            const course = Array.isArray(rawCourse) ? rawCourse[0] : rawCourse;

            return (
              <div key={slip.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{slip.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{course?.title ?? 'Course'}</p>
                  {slip.remarks && <p className="text-sm text-gray-600 mt-2">{slip.remarks}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    {slip.issued_at ? new Date(slip.issued_at).toLocaleDateString('en-GB') : ''}
                    {slip.file_size ? ` · ${slip.file_size}` : ''}
                  </p>
                </div>
                <a
                  href={slip.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-[var(--color-primary)] px-4 py-2 rounded-lg hover:bg-[#cf5626]"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
