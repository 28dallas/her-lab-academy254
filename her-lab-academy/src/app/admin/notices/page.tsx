'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { postPlatformNotice, deleteNotice } from '@/app/actions/admin';

interface Notice {
  id: string;
  content: string;
  created_at: string;
}

export default function AdminNoticesPage() {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('forum_posts')
      .select('id, content, created_at')
      .eq('type', 'announcement')
      .is('course_id', null)
      .order('created_at', { ascending: false });
    setNotices(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('content', content);
    const result = await postPlatformNotice(fd);
    if (result.error) {
      setError(result.error);
      return;
    }
    setContent('');
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
            <Bell className="w-8 h-8 text-[var(--color-primary)]" /> Platform Notices
          </h1>
          <p className="text-gray-600 mt-2">Notices appear on all student dashboards.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#cf5626] shadow-sm"
        >
          {showForm ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4" /> New Notice
            </>
          )}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" /> Notice posted successfully.
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-gray-900">Post a New Notice</h3>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Write your announcement..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-y"
          />
          <button
            type="submit"
            className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Post Notice
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-16">Loading...</p>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notices posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs text-[var(--color-primary)] font-semibold mb-2">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{n.content}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Delete this notice?')) return;
                    const fd = new FormData();
                    fd.set('noticeId', n.id);
                    await deleteNotice(fd);
                    setNotices((prev) => prev.filter((x) => x.id !== n.id));
                  }}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
