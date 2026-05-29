import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { BookOpen, Users, TrendingUp, ChevronRight } from 'lucide-react';

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, cover_emoji, enrollment_code')
    .eq('teacher_id', user!.id);

  const courseList = courses ?? [];

  // Get student counts per course
  const coursesWithStats = await Promise.all(
    courseList.map(async (course) => {
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      const { data: progData } = await supabase
        .from('enrollments')
        .select('progress_percent')
        .eq('course_id', course.id);

      const avg = progData && progData.length > 0
        ? Math.round(progData.reduce((s, e) => s + (e.progress_percent ?? 0), 0) / progData.length)
        : 0;

      return { ...course, students: count ?? 0, avgProgress: avg };
    })
  );

  const totalStudents = coursesWithStats.reduce((s, c) => s + c.students, 0);
  const avgProgress = coursesWithStats.length > 0
    ? Math.round(coursesWithStats.reduce((s, c) => s + c.avgProgress, 0) / coursesWithStats.length)
    : 0;

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)]">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {profile?.full_name ?? 'Teacher'}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'My Courses', value: courseList.length, icon: BookOpen, color: 'bg-orange-50 text-orange-600' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Avg. Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-display font-bold text-[var(--color-text-dark)]">{s.value}</div>
            <div className="text-sm text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Courses</h2>
        {coursesWithStats.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No courses assigned yet.</p>
            <p className="text-gray-400 text-sm mt-1">Contact your admin to get courses assigned to you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coursesWithStats.map(course => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gray-50">
                      {course.cover_emoji ?? '📚'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.students} students · {course.avgProgress}% avg progress</p>
                    </div>
                  </div>
                  <Link href={`/teacher/course/${course.id}`} className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline">
                    Manage <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-[var(--color-primary)]" style={{ width: `${course.avgProgress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
