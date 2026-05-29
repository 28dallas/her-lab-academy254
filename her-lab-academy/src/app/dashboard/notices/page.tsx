import Link from 'next/link';
import { Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function NoticesPage() {
  const supabase = await createClient();

  const { data: notices } = await supabase
    .from('forum_posts')
    .select('id, content, created_at, course_id')
    .eq('type', 'announcement')
    .order('created_at', { ascending: false })
    .limit(20);

  const rows = notices ?? [];

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <Bell className="w-8 h-8 text-[var(--color-primary)]" /> Notice Board
        </h1>
        <p className="text-gray-600 mt-2">Important announcements from the Her Lab Academy administration.</p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notices posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((n) => (
            <div
              key={n.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:border-[var(--color-primary)]/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="font-bold text-gray-900">Announcement</h3>
                    <span className="text-xs font-semibold text-[var(--color-primary)] flex-shrink-0">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{n.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400">
        Need something else? Contact your admin through <Link className="text-[var(--color-primary)] hover:underline" href="/dashboard/complaints">Complaints</Link>.
      </div>
    </div>
  );
}

