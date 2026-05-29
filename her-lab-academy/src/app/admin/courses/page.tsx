'use client';

import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Users } from 'lucide-react';

export default function AdminCoursesPage() {
  // Remove mock course rows.
  // Keep layout; show empty state until courses are DB-backed.
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[var(--color-primary)]" /> Manage Courses
        </h1>
        <p className="text-gray-600 mt-2">Publish, unpublish, and assign teachers to courses.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500">0 published · 0 unpublished</p>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            {showForm ? <><EyeOff className="w-4 h-4" /> Close</> : <><Eye className="w-4 h-4" /> New Course</>}
          </button>
        </div>

        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No courses to display.</p>
          <p className="text-gray-400 text-sm mt-1">Admin will see courses once DB data exists.</p>
        </div>
      </div>
    </div>
  );
}

