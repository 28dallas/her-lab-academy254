'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { replyToForumPost, markForumPostAnswered } from '@/app/actions/teacher';
import { AvatarFallback } from '@/components/ui/AvatarFallback';

type Post = {
  id: string;
  content: string;
  created_at: string;
  is_answered: boolean;
  author: { full_name: string | null };
  replies: { id: string; content: string; created_at: string; author: { full_name: string | null } }[];
};

export default function TeacherForumPage({ params }: { params: { id: string } }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('forum_posts')
      .select(
        `id, content, created_at, is_answered,
        author:author_id ( full_name ),
        replies:forum_posts ( id, content, created_at, author:author_id ( full_name ) )`
      )
      .eq('course_id', params.id)
      .eq('type', 'post')
      .is('parent_id', null)
      .order('created_at', { ascending: false });
    setPosts((data as unknown as Post[]) ?? []);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReply = async (postId: string) => {
    const content = replyDraft[postId]?.trim();
    if (!content) return;
    const fd = new FormData();
    fd.set('parentId', postId);
    fd.set('content', content);
    await replyToForumPost(params.id, fd);
    setReplyDraft((p) => ({ ...p, [postId]: '' }));
    load();
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <Link
          href={`/teacher/course/${params.id}`}
          className="text-sm text-gray-500 hover:text-[var(--color-primary)]"
        >
          ← Back to Course
        </Link>
        <h1 className="text-2xl font-display font-bold mt-4 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-[var(--color-primary)]" /> Forum Moderation
        </h1>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-12">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl py-16 text-center">
          <p className="text-gray-500">No forum posts to moderate yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white border rounded-xl p-5 ${post.is_answered ? 'border-green-200' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <AvatarFallback name={post.author?.full_name ?? 'Student'} size="sm" />
                  <div>
                    <p className="font-semibold text-gray-900">{post.author?.full_name ?? 'Student'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => markForumPostAnswered(params.id, post.id, !post.is_answered)}
                  className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                    post.is_answered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {post.is_answered ? 'Answered' : 'Mark answered'}
                </button>
              </div>

              {post.replies?.map((r) => (
                <div key={r.id} className="mt-3 ml-10 pl-4 border-l-2 border-gray-200 text-sm text-gray-700">
                  <span className="font-medium">{r.author?.full_name ?? 'User'}:</span> {r.content}
                </div>
              ))}

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={replyDraft[post.id] ?? ''}
                  onChange={(e) => setReplyDraft((p) => ({ ...p, [post.id]: e.target.value }))}
                  placeholder="Write a reply..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleReply(post.id)}
                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm"
                >
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
