import { Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { AvatarFallback } from '@/components/ui/AvatarFallback';

export default async function TeacherStudentsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(
      `progress_percent, completed, enrolled_at,
      student:student_id ( id, full_name, email )`
    )
    .eq('course_id', params.id)
    .order('enrolled_at', { ascending: false });

  const rows = enrollments ?? [];

  function studentFromRow(row: (typeof rows)[number]) {
    const raw = row.student;
    const s = Array.isArray(raw) ? raw[0] : raw;
    if (!s || typeof s !== 'object') return null;
    return s as { id: string; full_name: string | null; email: string | null };
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <Users className="w-7 h-7 text-[var(--color-primary)]" /> Student Progress
        </h1>
        <p className="text-gray-600 mt-1">{rows.length} enrolled students</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
          <p className="text-gray-500">No students enrolled in this course yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Progress</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                  Enrolled
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, rowIndex) => {
                const student = studentFromRow(row);
                const name = student?.full_name ?? student?.email ?? 'Student';
                const progress = row.progress_percent ?? 0;
                const status = row.completed ? 'Completed' : 'In Progress';

                return (
                  <tr key={student?.id ?? `row-${rowIndex}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AvatarFallback name={name} size="sm" />
                        <div>
                          <span className="font-medium text-gray-900">{name}</span>
                          {student?.email && (
                            <p className="text-xs text-gray-500">{student.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-[var(--color-primary)]'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                      {row.enrolled_at
                        ? new Date(row.enrolled_at).toLocaleDateString('en-GB')
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
