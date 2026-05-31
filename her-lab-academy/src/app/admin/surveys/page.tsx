import { FileCheck, BarChart2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function AdminSurveysPage() {
  const supabase = await createClient();

  const { data: surveys } = await supabase
    .from('surveys')
    .select(
      `id, responses, submitted_at,
      student:student_id ( full_name, email ),
      course:course_id ( title )`
    )
    .order('submitted_at', { ascending: false });

  const rows = surveys ?? [];

  const satisfactionScores = rows
    .map((r) => {
      const resp = r.responses as Record<string, string> | null;
      const val = resp?.['Overall satisfaction'] ?? resp?.overall_satisfaction;
      return val ? Number(val) : null;
    })
    .filter((n): n is number => n !== null && !Number.isNaN(n));

  const avgSat =
    satisfactionScores.length > 0
      ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length
      : 0;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-[var(--color-primary)]" /> Satisfaction Surveys
        </h1>
        <p className="text-gray-600 mt-2">Student survey responses after course completion.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-[var(--color-primary)]">{rows.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Responses</div>
        </div>
        <div className="bg-white border rounded-xl p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-[var(--color-secondary)]">
            {rows.length ? avgSat.toFixed(1) : '—'}
          </div>
          <div className="text-sm text-gray-600 mt-1">Avg. Satisfaction</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl">
          <p className="text-gray-500">No survey responses yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const student = r.student as { full_name?: string; email?: string } | null;
            const course = r.course as { title?: string } | null;
            const responses = (r.responses as Record<string, string>) ?? {};
            return (
              <div key={r.id} className="bg-white border rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-gray-900">
                      {student?.full_name ?? student?.email ?? 'Student'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {course?.title} ·{' '}
                      {r.submitted_at
                        ? new Date(r.submitted_at).toLocaleDateString('en-GB')
                        : ''}
                    </p>
                  </div>
                  <BarChart2 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-2">
                  {Object.entries(responses).map(([q, a]) => (
                    <div key={q} className="flex gap-4 text-sm">
                      <span className="text-gray-500 min-w-[140px]">{q}:</span>
                      <span className="font-medium text-gray-900">{String(a)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
