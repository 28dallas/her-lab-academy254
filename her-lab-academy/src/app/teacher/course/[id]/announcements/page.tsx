'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { postCourseAnnouncement, deleteAnnouncement } from '@/app/actions/teacher';

interface Announcement {
  id: string;
  content: string;
  created_at: string;
}

export default function TeacherAnnouncementsPage({ params }: { params: { id: string } }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('forum_posts')
      .select('id, content, created_at')
      .eq('course_id', params.id)
      .eq('type', 'announcement')
      .order('created_at', { ascending: false });
    setAnnouncements(data ?? []);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('title', title);
    fd.set('content', content);
    const result = await postCourseAnnouncement(params.id, fd);
    if (result.error) {
      setError(result.error);
      return;
    }
    setTitle('');
    setContent('');
    setShowForm(false);
    load();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this announcement?')) return;
    await deleteAnnouncement(params.id, postId);
    load();
  };

  const parseTitle = (text: string) => {
    const match = text.match(/^\*\*(.+?)\*\*/);
    return match ? match[1] : 'Announcement';
  };

  const parseBody = (text: string) => text.replace(/^\*\*.+?\*\*\n\n/, '');

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
            <Bell className="w-7 h-7 text-[var(--color-primary)]" /> Announcements
          </h1>
          <p className="text-gray-600 mt-1">Post announcements visible to all enrolled students.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#cf5626] shadow-sm"
        >
          {showForm ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4" /> New
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm space-y-4"
        >
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-y"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg text-sm">
              Post
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-12">Loading...</p>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <p className="text-gray-500">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-[var(--color-accent)] border border-[var(--color-primary)]/20 rounded-xl p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-[var(--color-primary)]">
                    {a.created_at
                      ? new Date(a.created_at).toLocaleDateString('en-GB')
                      : ''}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-1">{parseTitle(a.content)}</h3>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                    {parseBody(a.content)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="ml-4 p-1.5 text-gray-400 hover:text-red-500"
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
