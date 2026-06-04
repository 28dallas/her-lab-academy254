'use client';

import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { createCourse, updateCourse } from '@/app/actions/admin';

export interface CourseRow {
  id: string;
  title: string;
  category: string | null;
  enrollment_code: string | null;
  is_published: boolean;
  teacher_id: string | null;
  teacher_name?: string;
}

export interface TeacherOption {
  id: string;
  full_name: string;
}

export default function AdminCoursesClient({
  courses: initialCourses,
  teachers,
}: {
  courses: CourseRow[];
  teachers: TeacherOption[];
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const published = courses.filter((c) => c.is_published).length;

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const fd = new FormData(e.currentTarget);
    const result = await createCourse(fd);
    if (result.error) { setError(result.error); return; }
    setSuccess(`Course created. Enrollment code: ${result.enrollmentCode}`);
    setShowForm(false);
    window.location.reload();
  };

  const togglePublish = async (course: CourseRow) => {
    const fd = new FormData();
    fd.set('courseId', course.id);
    fd.set('isPublished', String(!course.is_published));
    fd.set('teacherId', course.teacher_id ?? '');
    const result = await updateCourse(fd);
    if (result.error) { setError(result.error); return; }
    setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, is_published: !c.is_published } : c));
  };

  const assignTeacher = async (courseId: string, teacherId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    const fd = new FormData();
    fd.set('courseId', courseId);
    fd.set('isPublished', String(course.is_published));
    fd.set('teacherId', teacherId);
    const result = await updateCourse(fd);
    if (result.error) { setError(result.error); return; }
    const teacher = teachers.find((t) => t.id === teacherId);
    setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, teacher_id: teacherId, teacher_name: teacher?.full_name } : c));
  };

  const inp = 'w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm';

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[var(--color-primary)]" /> Manage Courses
        </h1>
        <p className="text-[var(--color-text-muted)] mt-2">Publish, unpublish, and assign teachers to courses.</p>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 px-3 py-2 rounded-lg mb-4">{error}</p>}
      {success && <p className="text-sm text-green-400 bg-green-900/20 border border-green-500/30 px-3 py-2 rounded-lg mb-4">{success}</p>}

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            {published} published · {courses.length - published} unpublished
          </p>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            {showForm ? <><EyeOff className="w-4 h-4" /> Close</> : <><Eye className="w-4 h-4" /> New Course</>}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="p-6 border-b border-[var(--color-border)] space-y-4 bg-[var(--color-bg-muted)]">
            <h3 className="font-bold text-[var(--color-text-dark)]">Create Course</h3>
            <input name="title" required placeholder="Course title (e.g. Electrical Installation)" className={inp} />
            <input name="category" placeholder="Category (e.g. Trades)" className={inp} />
            <textarea name="description" placeholder="Description" rows={3} className={inp} />
            <select name="teacherId" className={inp}>
              <option value="">No teacher assigned</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
            <input name="coverEmoji" placeholder="Cover emoji (e.g. 📚)" defaultValue="📚" className={inp} />
            <input name="enrollmentCode" placeholder="Enrollment code (e.g. EL12345). Leave blank to auto-generate." className={inp} />
            <input name="coverImageUrl" placeholder="Cover image URL (optional)" className={inp} />
            <input name="durationWeeks" type="number" min={1} placeholder="Duration in weeks (e.g. 10)" className={inp} />
            <button type="submit" className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)]">
              Create Course
            </button>
          </form>
        )}

        {courses.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[var(--color-text-muted)] font-medium">No courses yet.</p>
            <p className="text-[var(--color-text-muted)] text-sm mt-1 opacity-60">Create your first course above.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {courses.map((course) => (
              <div key={course.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--color-text-dark)]">{course.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">Code: {course.enrollment_code ?? '—'}</p>
                  {course.category && <p className="text-xs text-[var(--color-text-muted)] opacity-70 mt-0.5">{course.category}</p>}
                </div>
                <select
                  value={course.teacher_id ?? ''}
                  onChange={(e) => assignTeacher(course.id, e.target.value)}
                  className="border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm max-w-[200px]"
                >
                  <option value="">Assign teacher</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => togglePublish(course)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg border ${
                    course.is_published
                      ? 'border-green-500/40 text-green-400 bg-green-900/20'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {course.is_published ? 'Published' : 'Draft'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
