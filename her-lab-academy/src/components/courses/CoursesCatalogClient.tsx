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

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent sm:text-sm"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-1 bg-gray-200/50 p-1 rounded-lg overflow-x-auto w-full sm:w-auto">
            {COURSE_CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-[var(--color-text-dark)] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-white">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              aria-label="List view"
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span>{' '}
          published program{filteredCourses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">No published programs yet</h3>
          <p className="mt-1 text-gray-500">Check back soon — new courses are added regularly.</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No programs found</h3>
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
              className={`group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all ${
                viewMode === 'list' ? 'flex flex-row items-center h-32' : 'flex flex-col'
              }`}
            >
              <div
                className={`${
                  viewMode === 'list' ? 'w-32 h-full' : 'h-36 w-full'
                } flex-shrink-0 flex items-center justify-center text-5xl ${course.color}`}
              >
                {course.icon}
              </div>
              <div className={`p-5 ${viewMode === 'list' ? 'flex-grow' : ''}`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {course.category}
                </span>
                <h3 className="mt-1 text-lg font-bold text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] line-clamp-2">
                  {course.title}
                </h3>
                <p className="mt-3 text-sm text-gray-500">{course.duration}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
