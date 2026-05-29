"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo/logo.webp"
              alt="Her Lab Academy"
              width={56}
              height={56}
              className="rounded-full object-cover"
              priority
            />
          </div>
          <h2 className="text-3xl font-display font-bold text-[var(--color-text-dark)]">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Her Lab Academy — sign in to your portal
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-blue-100 bg-blue-50 py-2 px-1">
            <span className="text-lg">🎓</span>
            <p className="font-semibold text-blue-700 mt-0.5">Student</p>
            <p className="text-blue-500 leading-tight">Your learning dashboard</p>
          </div>
          <div className="rounded-lg border border-green-100 bg-green-50 py-2 px-1">
            <span className="text-lg">👩🏫</span>
            <p className="font-semibold text-green-700 mt-0.5">Teacher</p>
            <p className="text-green-500 leading-tight">Manage your courses</p>
          </div>
          <div className="rounded-lg border border-orange-100 bg-orange-50 py-2 px-1">
            <span className="text-lg">🛡️</span>
            <p className="font-semibold text-orange-700 mt-0.5">Admin</p>
            <p className="text-orange-500 leading-tight">Platform management</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {decodeURIComponent(error)}
          </div>
        )}

        <form className="space-y-5" action={login}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent sm:text-sm"
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

          <div className="flex items-center justify-between text-sm">
            <Link href="/register" className="text-gray-500 hover:text-[var(--color-primary)] transition-colors">
              New student? Register here
            </Link>
            <Link href="/forgot-password" className="text-[var(--color-primary)] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[var(--color-primary)] hover:bg-[#cf5626] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          You will be automatically redirected to your portal after sign in.
          Teachers &amp; Admins — use the credentials provided by your administrator.
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
