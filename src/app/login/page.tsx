'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HeaderNav from '@/components/HeaderNav';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const urlError = searchParams.get('error');

  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    urlError === 'OAuthCallback' || urlError === 'redirect_uri_mismatch'
      ? 'Google Sign-in is not configured with this domain yet. Please log in with email/password or use session registration.'
      : ''
  );

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
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-mono text-center rounded-lg leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/60 font-semibold mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-3 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
            placeholder="e.g. yogi@gmail.com"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/60 font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-3 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full text-xs font-bold tracking-wider uppercase py-3 bg-saffron text-white hover:bg-saffron-dark transition-colors rounded-md shadow-sm disabled:bg-warm-gray"
        >
          {isPending ? 'LOGGING IN...' : 'LOGIN TO PORTAL'}
        </button>
      </form>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-warm-gray"></div>
        <span className="flex-shrink mx-4 text-[10px] text-warm-charcoal/40 font-bold uppercase font-mono">OR</span>
        <div className="flex-grow border-t border-warm-gray"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full text-xs font-semibold tracking-wider uppercase py-3 border border-warm-gray hover:border-saffron transition-colors flex items-center justify-center space-x-2 bg-cream hover:bg-cream-dark text-warm-charcoal rounded-md"
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

      {/* Clear Distinction: New Seeker Session Registration */}
      <div className="pt-4 border-t border-warm-gray bg-cream p-4 rounded-xl text-center space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-saffron block">New Seeker / OPD Registration</span>
        <p className="text-xs text-warm-charcoal/60 font-light">Register for an upcoming health session without creating an account.</p>
        <Link
          href="/book"
          className="inline-block text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-teal text-white hover:bg-teal-dark transition-colors rounded-md shadow-sm mt-1"
        >
          Register for OPD Session →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream text-warm-charcoal font-sans flex flex-col">
      {/* Universal Header */}
      <HeaderNav />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full border border-warm-gray bg-white p-8 space-y-6 rounded-2xl shadow-sm">
          
          {/* Header */}
          <div className="text-center space-y-1 border-b border-warm-gray pb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-saffron block">Portal Access</span>
            <h2 className="text-2xl font-light text-teal-dark">
              Seeker & Admin Login
            </h2>
            <p className="text-xs text-warm-charcoal/50 font-light">
              Sahaja Yoga Health Centre, Hyderabad
            </p>
          </div>

          <Suspense fallback={<div className="text-xs text-warm-charcoal/40 font-mono text-center py-8">Loading sign in options...</div>}>
            <LoginForm />
          </Suspense>

          <div className="pt-2 text-center border-t border-warm-gray text-[11px] text-warm-charcoal/40 font-mono space-y-1">
            <p>Admin Login: <strong className="text-warm-charcoal">admin@syhealthcentre.org</strong></p>
            <p>Password: <strong className="text-warm-charcoal">password123</strong></p>
          </div>
        </div>
      </main>
    </div>
  );
}
