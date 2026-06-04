import { createClient } from '@/utils/supabase/server';
import { Users, BookOpen, Award, TrendingUp, MessageSquare, FileCheck } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: totalCourses },
    { count: publishedCourses },
    { count: totalCerts },
    { count: openComplaints },
    { count: totalSurveys },
    { data: enrollments },
    { data: courses },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('certificates').select('*', { count: 'exact', head: true }),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('surveys').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('progress_percent, completed, enrolled_at'),
    supabase
      .from('courses')
      .select('id, title, cover_emoji')
      .eq('is_published', true),
  ]);

  const enrollmentList = enrollments ?? [];
  const avgProgress =
    enrollmentList.length > 0
      ? Math.round(
          enrollmentList.reduce((s, e) => s + (e.progress_percent ?? 0), 0) /
            enrollmentList.length
        )
      : 0;
  const completedCount = enrollmentList.filter((e) => e.completed).length;
  const completionRate =
    enrollmentList.length > 0
      ? Math.round((completedCount / enrollmentList.length) * 100)
      : 0;

  // Enrollments per course
  const courseEnrollCounts: Record<string, number> = {};
  const courseCompleteCounts: Record<string, number> = {};
  const { data: allEnrollments } = await supabase
    .from('enrollments')
    .select('course_id, completed');
  for (const e of allEnrollments ?? []) {
    courseEnrollCounts[e.course_id] = (courseEnrollCounts[e.course_id] ?? 0) + 1;
    if (e.completed) courseCompleteCounts[e.course_id] = (courseCompleteCounts[e.course_id] ?? 0) + 1;
  }

  // Enrollments by month (last 6 months)
  const now = new Date();
  const monthBuckets: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    const count = enrollmentList.filter((e) => {
      if (!e.enrolled_at) return false;
      const ed = new Date(e.enrolled_at as string);
      return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
    }).length;
    monthBuckets.push({ label, count });
  }
  const maxMonth = Math.max(...monthBuckets.map((b) => b.count), 1);

  const stats = [
    { label: 'Total Students', value: totalStudents ?? 0, icon: Users, color: 'text-sky-400' },
    { label: 'Teachers', value: totalTeachers ?? 0, icon: Users, color: 'text-emerald-400' },
    { label: 'Published Courses', value: publishedCourses ?? 0, icon: BookOpen, color: 'text-orange-400' },
    { label: 'Certificates Issued', value: totalCerts ?? 0, icon: Award, color: 'text-yellow-400' },
    { label: 'Avg. Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: FileCheck, color: 'text-green-400' },
    { label: 'Open Complaints', value: openComplaints ?? 0, icon: MessageSquare, color: 'text-red-400' },
    { label: 'Survey Responses', value: totalSurveys ?? 0, icon: FileCheck, color: 'text-blue-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)]">
          Platform Analytics
        </h1>
        <p className="text-gray-500 mt-1">Live overview of HER Lab Academy activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <s.icon className={`w-5 h-5 mb-3 ${s.color}`} />
            <div className="text-3xl font-display font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Enrollment trend */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-6">Enrollments — Last 6 Months</h2>
        <div className="flex items-end gap-3 h-40">
          {monthBuckets.map((b) => (
            <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">{b.count}</span>
              <div
                className="w-full rounded-t-md bg-[var(--color-primary)] transition-all"
                style={{ height: `${(b.count / maxMonth) * 100}%`, minHeight: b.count > 0 ? '4px' : '0' }}
              />
              <span className="text-xs text-gray-400">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Course breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-5">Course Breakdown</h2>
        {(courses ?? []).length === 0 ? (
          <p className="text-gray-500 text-sm">No published courses yet.</p>
        ) : (
          <div className="space-y-3">
            {(courses ?? []).map((c) => {
              const enrolled = courseEnrollCounts[c.id] ?? 0;
              const completed = courseCompleteCounts[c.id] ?? 0;
              const rate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
              return (
                <div key={c.id} className="flex items-center gap-4">
                  <span className="text-2xl w-9 flex-shrink-0">{c.cover_emoji ?? '📚'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900 truncate">{c.title}</span>
                      <span className="text-gray-400 flex-shrink-0 ml-2">{enrolled} enrolled · {rate}% done</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[var(--color-primary)]"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
