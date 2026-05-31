import { redirect } from 'next/navigation';
import { Users, BookOpen, Award, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  const [
    { count: studentCount },
    { count: courseCount },
    { count: certCount },
    { data: enrollments },
    { data: openComplaints },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('certificates').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('progress_percent'),
    supabase
      .from('complaints')
      .select('id, subject, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const avgProgress =
    enrollments && enrollments.length > 0
      ? Math.round(
          enrollments.reduce((s, e) => s + (e.progress_percent ?? 0), 0) / enrollments.length
        )
      : 0;

  const stats = [
    { label: 'Total Students', value: studentCount ?? 0, icon: Users },
    { label: 'Published Courses', value: courseCount ?? 0, icon: BookOpen },
    { label: 'Certificates Issued', value: certCount ?? 0, icon: Award },
    { label: 'Avg. Progress', value: `${avgProgress}%`, icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-10">
      <div>
        <h1 className="text-3xl font-display font-bold">Platform Analytics</h1>
        <p className="text-gray-600 mt-1">Overview of HER Lab Academy activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border rounded-xl shadow-sm p-6">
            <s.icon className="w-6 h-6 text-[var(--color-primary)] mb-4" />
            <div className="text-3xl font-display font-bold">{s.value}</div>
            <div className="text-sm text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Open Complaints</h2>
          {(openComplaints ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No open complaints.</p>
          ) : (
            <ul className="space-y-3">
              {openComplaints!.map((c) => (
                <li key={c.id} className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">{c.subject}</span>
                  <span className="text-gray-400">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB') : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/complaints" className="text-sm text-[var(--color-primary)] mt-4 inline-block hover:underline">
            View all complaints →
          </Link>
        </div>

        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Manage Courses', href: '/admin/courses', icon: BookOpen },
              { label: 'Manage Users', href: '/admin/users', icon: Users },
              { label: 'Certificates', href: '/admin/certificates', icon: Award },
              { label: 'Complaints', href: '/admin/complaints', icon: AlertCircle },
              { label: 'Post Notice', href: '/admin/notices', icon: CheckCircle2 },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border hover:border-[var(--color-primary)] hover:bg-[var(--color-accent)] text-sm font-medium text-gray-700"
              >
                <link.icon className="w-5 h-5 text-gray-400" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
