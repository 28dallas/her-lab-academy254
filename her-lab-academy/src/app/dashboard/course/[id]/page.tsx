'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, MessageSquare, Award } from 'lucide-react';

export default function StudentCourseHome({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'Course' | 'Participants' | 'Grades'>('Course');

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="bg-[var(--color-secondary)] rounded-2xl p-8 text-white mb-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-md mb-4">
                Course
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Course Content</h1>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">?</div>
                <span className="font-medium text-white/90">Teacher not assigned yet</span>
              </div>
            </div>

            <div className="hidden md:flex gap-2">
              <Link
                href={`/dashboard/course/${params.id}/forum`}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4 inline-block mr-2" /> Forum
              </Link>
            </div>
          </div>

          <div className="mt-4 md:hidden">
            <Link
              href={`/dashboard/course/${params.id}/forum`}
              className="inline-block bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4 inline-block mr-2" /> Forum
            </Link>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
        {['Course', 'Participants', 'Grades'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Course' && (
        <div className="space-y-6">
          <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
            <p className="text-gray-500">No course modules/resources have been assigned yet.</p>
          </div>
        </div>
      )}

      {activeTab === 'Participants' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Participants</h3>
          <p className="text-gray-500 mt-2">No participants data available yet.</p>
        </div>
      )}

      {activeTab === 'Grades' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Module Completion</h3>
            <p className="text-gray-500 mt-2">Completion tracking is unavailable until modules are assigned.</p>
          </div>
        </div>
      )}
    </div>
  );
}

