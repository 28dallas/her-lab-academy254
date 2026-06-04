import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { BookMarked, CheckCircle2, XCircle } from 'lucide-react';
import { AvatarFallback } from '@/components/ui/AvatarFallback';

export default async function TeacherGradebookPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('progress_percent, completed, student:student_id ( id, full_name, email )')
    .eq('course_id', params.id)
    .order('enrolled_at', { ascending: false });

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, title')
    .eq('course_id', params.id)
    .order('created_at', { ascending: true });

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('student_id, quiz_id, score, passed, submitted_at')
    .eq('course_id', params.id);

  const rows = (enrollments ?? []).map((row) => {
    const raw = row.student;
    const student = Array.isArray(raw) ? raw[0] : raw;
    const studentAttempts = (attempts ?? []).filter((a) => a.student_id === student?.id);
    return { student, progress: row.progress_percent ?? 0, completed: row.completed, attempts: studentAttempts };
  }).filter((r) => r.student);

  const quizList = quizzes ?? [];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href={`/teacher/course/${params.id}`} className="text-sm text-gray-500 hover:text-[var(--color-primary)]">
          ← Back to Course
        </Link>
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-dark)] mt-4 flex items-center gap-3">
          <BookMarked className="w-7 h-7 text-[var(--color-primary)]" /> Gradebook
        </h1>
        <p className="text-gray-600 mt-1">{rows.length} students · {quizList.length} quizzes</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl py-16 text-center">
          <p className="text-gray-500">No students enrolled yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Progress</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                {quizList.map((q) => (
                  <th key={q.id} className="text-left px-4 py-3 font-semibold text-gray-600 max-w-[120px] truncate">
                    {q.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(({ student, progress, completed, attempts: studentAttempts }) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <AvatarFallback name={student.full_name ?? student.email ?? 'S'} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{student.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-[var(--color-primary)]'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {completed ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  {quizList.map((q) => {
                    const attempt = studentAttempts.find((a) => a.quiz_id === q.id);
                    return (
                      <td key={q.id} className="px-4 py-4">
                        {attempt ? (
                          <div className="flex items-center gap-1">
                            {attempt.passed
                              ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                              : <XCircle className="w-4 h-4 text-red-400" />
                            }
                            <span className={`text-xs font-semibold ${attempt.passed ? 'text-green-700' : 'text-red-600'}`}>
                              {attempt.score}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
