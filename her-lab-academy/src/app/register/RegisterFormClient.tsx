'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { register } from './actions';

export type CourseOption = {
  id: string;
  title: string;
};

export default function RegisterFormClient({ courses }: { courses: CourseOption[] }) {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[var(--color-surface)] p-8 sm:p-10 rounded-2xl shadow-2xl shadow-black/30 border border-[var(--color-border)]">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-[var(--color-text-dark)]">Create your student account</h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Choose your course, create your password, and log in with your Student ID.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {decodeURIComponent(error)}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            {decodeURIComponent(success)}
          </div>
        )}

        <form className="mt-8 space-y-6" action={register}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-[var(--color-text-muted)]">
                Full Name
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="course" className="block text-sm font-medium text-[var(--color-text-muted)]">
                Course
              </label>
              <select
                id="course"
                name="courseId"
                required
                className="mt-1 block w-full rounded-md border border-[var(--color-border)] px-3 py-2 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="student-id" className="block text-sm font-medium text-[var(--color-text-muted)]">
                Student ID
              </label>
              <input
                id="student-id"
                name="studentId"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="e.g. 02400004/ICT/4/2026/019"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-muted)]">
                Email address <span className="opacity-50">(optional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="student@example.com"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Optional. Leave blank if you do not have one — you can always sign in with your Student ID and password.
                If you add an email, you may sign in with either your Student ID or that email.
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-text-muted)]">
                Phone number <span className="opacity-50">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="e.g. 0712345678"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-muted)]">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[#cf5626] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
