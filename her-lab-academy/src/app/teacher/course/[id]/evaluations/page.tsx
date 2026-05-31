import { Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function TeacherEvaluationsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: evaluations } = await supabase
    .from('evaluations')
    .select(
      `id, rating, feedback, submitted_at,
      student:student_id ( full_name, email )`
    )
    .eq('course_id', params.id)
    .order('submitted_at', { ascending: false });

  const rows = evaluations ?? [];
  const avgRating =
    rows.length > 0
      ? rows.reduce((s, e) => s + (e.rating ?? 0), 0) / rows.length
      : 0;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <Star className="w-7 h-7 text-[var(--color-primary)]" /> Student Evaluations
        </h1>
        <p className="text-gray-600 mt-1">Feedback from students who completed this course.</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
          <p className="text-gray-500">No evaluations submitted yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6 flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-display font-bold text-[var(--color-primary)]">
                {avgRating.toFixed(1)}
              </div>
              <p className="text-sm text-gray-500 mt-1">{rows.length} reviews</p>
            </div>
          </div>

          <div className="space-y-4">
            {rows.map((e) => {
              const student = e.student as { full_name?: string; email?: string } | null;
              const name = student?.full_name ?? student?.email ?? 'Student';
              return (
                <div key={e.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">
                        {e.submitted_at
                          ? new Date(e.submitted_at).toLocaleDateString('en-GB')
                          : ''}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="w-4 h-4"
                          fill={s <= (e.rating ?? 0) ? '#E8612C' : 'none'}
                          stroke={s <= (e.rating ?? 0) ? '#E8612C' : '#D1D5DB'}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                  {e.feedback && <p className="text-sm text-gray-700">{e.feedback}</p>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
