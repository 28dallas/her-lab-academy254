'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Bell, Award, MessageSquare,
  AlertCircle, Star, User, HelpCircle,
  ChevronRight, Megaphone
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  icon: string;
  progress: number;
  status: string;
}

interface Notice {
  id: string;
  title: string;
  date: string;
  content: string;
}

export default function StudentDashboardClient({
  name,
  myCourses,
  notices,
}: {
  name: string;
  myCourses: Course[];
  notices: Notice[];
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [starredIds, setStarredIds] = useState<string[]>([]);

  const toggleStar = (id: string) => {
    setStarredIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const quickAccess = [
    { icon: BookOpen, label: 'My Courses', href: '#courses', color: 'bg-blue-100 text-blue-600' },
    { icon: Bell, label: 'Notices', href: '#notices', color: 'bg-orange-100 text-orange-600' },
    { icon: Award, label: 'Certificates', href: '/dashboard/certificates', color: 'bg-yellow-100 text-yellow-600' },
    { icon: MessageSquare, label: 'Forums', href: '#courses', color: 'bg-purple-100 text-purple-600' },
    { icon: AlertCircle, label: 'Complaints', href: '/dashboard/complaints', color: 'bg-red-100 text-red-600' },
    { icon: Star, label: 'Evaluations', href: '#courses', color: 'bg-green-100 text-green-600' },
    { icon: User, label: 'Profile', href: '/dashboard/profile', color: 'bg-indigo-100 text-indigo-600' },
    { icon: HelpCircle, label: 'Help', href: '/dashboard/help', color: 'bg-gray-100 text-gray-600' },
  ];

  const filteredCourses = myCourses.filter(c => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Starred') return starredIds.includes(c.id);
    return c.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] mb-2">Welcome back, {name}!</h1>
        <p className="text-gray-600">What would you like to learn today?</p>
      </div>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {quickAccess.map((item, idx) => (
            <Link key={idx} href={item.href} className="flex flex-col items-center justify-center gap-2 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6" id="courses">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              {['All', 'In Progress', 'Completed', 'Starred'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="py-16 text-center bg-white border border-dashed border-gray-200 rounded-xl">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                {myCourses.length === 0 ? 'You are not enrolled in any courses yet.' : 'No courses match this filter.'}
              </p>
              {myCourses.length === 0 && (
                <p className="text-gray-400 text-sm mt-1">Contact your admin for an enrollment code.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredCourses.map(course => (
                <div key={course.id} className="relative">
                  <button
                    onClick={() => toggleStar(course.id)}
                    className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-colors ${
                      starredIds.includes(course.id) ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-yellow-400 bg-white/80'
                    }`}
                    aria-label="Star course"
                  >
                    <Star className="w-4 h-4" fill={starredIds.includes(course.id) ? 'currentColor' : 'none'} />
                  </button>
                  <Link
                    href={`/dashboard/course/${course.id}`}
                    className="block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--color-primary)] transition-all group"
                  >
                    <div className="h-32 flex items-center justify-center text-5xl bg-gray-50 group-hover:scale-105 transition-transform origin-bottom">
                      {course.icon}
                    </div>
                    <div className="p-5">
                      <span className={`text-xs font-bold uppercase tracking-wider ${course.status === 'Completed' ? 'text-green-600' : 'text-[var(--color-primary)]'}`}>
                        {course.status}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 mt-1 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                        {course.title}
                      </h3>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500 font-medium">Progress</span>
                          <span className="text-gray-900 font-bold">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${course.status === 'Completed' ? 'bg-green-500' : 'bg-[var(--color-primary)]'}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6" id="notices">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[var(--color-primary)]" /> Notice Board
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {notices.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notices posted yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notices.map(notice => (
                  <div key={notice.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <span className="text-xs font-semibold text-[var(--color-primary)]">{notice.date}</span>
                    <h4 className="font-bold text-gray-900 mt-1 mb-2">{notice.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">{notice.content}</p>
                    <button className="text-[var(--color-primary)] text-sm font-medium mt-3 flex items-center hover:underline">
                      Read more <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
