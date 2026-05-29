'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function TeacherForumPage({ params }: { params: { id: string } }) {
  // Remove mock forum moderation posts; show empty state until DB is wired.
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <Link
          href={`/teacher/course/${params.id}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] mb-4 transition-colors"
        >
          ← Back to Course
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-[var(--color-primary)]" /> Forum Moderation
          </h1>
          <p className="text-gray-600 mt-1">Reply to student questions and mark them as answered.</p>
        </div>
      </div>

      <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No forum posts to moderate yet.</p>
        <p className="text-gray-400 text-sm mt-1">Students will see and submit discussions once the teacher/course is active.</p>
      </div>
    </div>
  );
}

