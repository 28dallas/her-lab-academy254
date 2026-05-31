'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List as ListIcon } from 'lucide-react';
import type { PublicCourse } from '@/lib/courseDisplay';
import { COURSE_CATEGORY_TABS } from '@/lib/courseDisplay';

export default function CoursesCatalogClient({ courses }: { courses: PublicCourse[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || course.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const inputClass =
    'block w-full pl-10 pr-3 py-2.5 border border-[var(--color-border)] rounded-xl leading-5 bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] sm:text-sm';

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
          <input
            type="text"
            className={inputClass}
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-1 bg-[var(--color-surface)] border border-[var(--color-border)] p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
            {COURSE_CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/25'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-1 border border-[var(--color-border)] rounded-xl p-1 bg-[var(--color-surface)]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
              aria-label="List view"
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-[var(--color-text-muted)]">
          Showing <span className="font-semibold text-[var(--color-text)]">{filteredCourses.length}</span>{' '}
          published program{filteredCourses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 panel">
          <h3 className="text-lg font-medium text-[var(--color-text)]">No published programs yet</h3>
          <p className="mt-1 text-[var(--color-text-muted)]">Check back soon — new courses are added regularly.</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 panel">
          <Search className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-4" />
          <h3 className="text-lg font-medium text-[var(--color-text)]">No programs found</h3>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('All');
            }}
            className="mt-4 text-[var(--color-primary)] font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
              : 'flex flex-col space-y-4'
          }
        >
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className={`group panel overflow-hidden hover:border-[var(--color-primary)]/40 hover:shadow-xl hover:shadow-black/20 transition-all ${
                viewMode === 'list' ? 'flex flex-row items-center h-32' : 'flex flex-col'
              }`}
            >
              <div
                className={`${
                  viewMode === 'list' ? 'w-32 h-full' : 'h-36 w-full'
                } flex-shrink-0 flex items-center justify-center text-5xl relative overflow-hidden ${course.color}`}
              >
                {course.coverImageUrl ? (
                  <img
                    src={course.coverImageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  course.icon
                )}
              </div>
              <div className={`p-5 ${viewMode === 'list' ? 'flex-grow' : ''}`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {course.category}
                </span>
                <h3 className="mt-1 text-lg font-bold text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] line-clamp-2">
                  {course.title}
                </h3>
                <p className="mt-3 text-sm text-[var(--color-text-muted)]">{course.duration}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
