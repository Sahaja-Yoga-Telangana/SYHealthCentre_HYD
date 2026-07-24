'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl,
        });

        if (res?.error) {
          setError(res.error || 'Invalid credentials. Please try again.');
        } else {
          // Fetch current session to check role
          const sessionRes = await fetch('/api/auth/session');
          const sessionData = await sessionRes.json();
          if (sessionData?.user?.role === 'Admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
          router.refresh();
        }
      } catch (err: any) {
        setError('An unexpected error occurred. Please try again.');
      }
    });
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
            placeholder="e.g. yogi@gmail.com"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full text-[10px] font-bold tracking-widest uppercase py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
        >
          {isPending ? 'LOGGING IN...' : 'LOGIN WITH EMAIL'}
        </button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-neutral-200"></div>
        <span className="flex-shrink mx-4 text-[10px] text-neutral-400 font-bold uppercase font-mono">OR</span>
        <div className="flex-grow border-t border-neutral-200"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full text-[10px] font-bold tracking-widest uppercase py-3 border border-neutral-200 hover:border-neutral-900 transition-colors flex items-center justify-center space-x-2 bg-neutral-50 hover:bg-white"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.15C3.26 21.3 7.37 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.24A7.12 7.12 0 0 1 4.9 12c0-.79.13-1.57.37-2.24V6.61H1.29A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.29 5.39l3.98-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.37 0 3.26 2.7 1.29 6.61l3.98 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
        <span>SIGN IN WITH GOOGLE</span>
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full border border-neutral-200 bg-white p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="font-bold tracking-widest text-sm text-neutral-900 block hover:text-neutral-500 transition-colors">
            SAHAJA YOGA
          </Link>
          <h2 className="text-xl font-light tracking-wide text-neutral-800 uppercase">
            Seeker Portal Login
          </h2>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
            Research & Health Centre, Hyderabad
          </p>
        </div>

        <Suspense fallback={<div className="text-xs text-neutral-400 font-mono text-center py-8">Loading session provider...</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-[10px] text-neutral-400 text-center font-light leading-relaxed">
          Default Admin Credentials:<br />
          <span className="font-mono font-semibold text-neutral-700">admin@syhealthcentre.org</span> &bull; Password: <span className="font-mono font-semibold text-neutral-700">password123</span>
        </p>

        <div className="pt-2 text-center border-t border-neutral-100">
          <Link href="/" className="text-[10px] text-neutral-500 hover:text-neutral-900 underline uppercase tracking-wider">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
