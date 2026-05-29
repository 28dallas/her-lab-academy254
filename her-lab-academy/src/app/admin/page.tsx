import { redirect } from 'next/navigation';
import { Users, BookOpen, Award, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function AdminDashboard() {
  // Keep headings/labels, but remove mock analytics numbers/activities.
  // Until DB-backed analytics is implemented, show empty state UI.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)]">Platform Analytics</h1>
        <p className="text-gray-600 mt-1">Overview of Her Lab Academy activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', icon: Users },
          { label: 'Active Courses', icon: BookOpen },
          { label: 'Certificates Issued', icon: Award },
          { label: 'Avg. Progress', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50">
                <s.icon className="w-6 h-6 text-gray-500" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-[var(--color-text-dark)] mb-1">—</div>
            <div className="text-sm font-medium text-gray-700">{s.label}</div>
            <div className="text-xs text-gray-500 mt-1">No data yet</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Recent Activity</h2>
          <div className="text-center py-16">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity to display.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Manage Courses', href: '/admin/courses', icon: BookOpen },
              { label: 'Manage Users', href: '/admin/users', icon: Users },
              { label: 'Issue Certificates', href: '/admin/certificates', icon: Award },
              { label: 'View Complaints', href: '/admin/complaints', icon: AlertCircle },
              { label: 'Post Notice', href: '/admin/notices', icon: CheckCircle2 },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:border-[var(--color-primary)] hover:bg-[var(--color-accent)] transition-colors group"
              >
                <link.icon className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-[var(--color-primary)]">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

