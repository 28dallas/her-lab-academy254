'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Link from 'next/link';

import { Eye, EyeOff } from 'lucide-react';
import { setupPassword } from './actions';
import { Logo } from '@/components/brand/Logo';
import { BRAND_NAME } from '@/lib/brand';

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const studentId = mounted ? (searchParams.get('student_id') || '') : '';
  const error = mounted ? searchParams.get('error') : null;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    await setupPassword(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_55%)] opacity-10 pointer-events-none" />
      <div className="max-w-md w-full relative bg-[var(--color-surface)] p-8 sm:p-10 rounded-2xl shadow-2xl shadow-black/30 border border-[var(--color-border)] space-y-8">

        <div className="text-center">
          <div className="flex justify-center mb-5">
            <Logo size={120} variant="mark" priority />
          </div>
          <h2 className="text-3xl font-display font-bold text-[var(--color-text-dark)] tracking-tight">
            Create your password
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            First time login — secure your {BRAND_NAME} account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {decodeURIComponent(error)}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Your Student ID
            </label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              value={studentId}
              readOnly
              className="block w-full px-3.5 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-muted)] text-[var(--color-text)] opacity-60 cursor-not-allowed sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                className="block w-full px-3.5 py-2.5 pr-10 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-muted)] placeholder-[var(--color-text-muted)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] sm:text-sm transition-shadow"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={6}
                className="block w-full px-3.5 py-2.5 pr-10 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-muted)] placeholder-[var(--color-text-muted)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] sm:text-sm transition-shadow"
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-[var(--color-primary)] hover:bg-[#cf5626] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] shadow-sm hover:shadow transition-all"
          >
            {loading ? 'Setting up...' : 'Create Password & Continue'}
          </button>
        </form>

        <div className="text-center">
          <Link href="/login" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return <SetupPasswordForm />;
}

