"use client";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login } from "./actions";
import { Logo } from "@/components/brand/Logo";
import { BRAND_NAME } from "@/lib/brand";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_55%)] opacity-10 pointer-events-none" />
      <div className="max-w-md w-full relative bg-[var(--color-surface)] p-8 sm:p-10 rounded-2xl shadow-2xl shadow-black/30 border border-[var(--color-border)] space-y-8">

        <div className="text-center">
          <div className="flex justify-center mb-5">
            <Logo size={64} variant="mark" priority />
          </div>
          <h2 className="text-3xl font-display font-bold text-[var(--color-text-dark)] tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {BRAND_NAME} — sign in to your portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {decodeURIComponent(error)}
          </div>
        )}

        <form className="space-y-5" action={login}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full px-3.5 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-muted)] placeholder-[var(--color-text-muted)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] sm:text-sm transition-shadow"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="block w-full px-3.5 py-2.5 pr-10 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-muted)] placeholder-[var(--color-text-muted)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] sm:text-sm transition-shadow"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <Link href="/register" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              New student? Register here
            </Link>
            <Link href="/forgot-password" className="text-[var(--color-primary)] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-[var(--color-primary)] hover:bg-[#cf5626] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] shadow-sm hover:shadow transition-all"
          >
            Sign in
          </button>
        </form>

        <p className="text-xs text-[var(--color-text-muted)] text-center leading-relaxed">
          After sign in you are redirected to your dashboard based on your account role.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
