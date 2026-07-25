'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeaderNav from '@/components/HeaderNav';

function AuthForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const errorParam = searchParams.get('error');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(
    errorParam === 'OAuthRedirectError' || errorParam === 'OAuthCallbackError'
      ? 'Authentication error. Please enter your admin credentials below.'
      : ''
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await signIn('credentials', {
          redirect: false,
          email: username,
          password: password,
          callbackUrl: callbackUrl,
        });

        if (res?.error) {
          setError(res.error || 'Invalid admin credentials');
        } else if (res?.ok) {
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (err: any) {
        setError('An error occurred during login. Please try again.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-mono text-center rounded-lg leading-relaxed">
          {error}
        </div>
      )}

      {/* ADMIN LOGIN FORM */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/60 font-semibold mb-1">
            Username *
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-3 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
            placeholder="admin"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/60 font-semibold mb-1">
            Password *
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
          className="w-full text-xs font-bold tracking-wider uppercase py-3.5 bg-saffron text-white hover:bg-saffron-dark transition-colors rounded-md shadow-sm disabled:bg-warm-gray mt-2"
        >
          {isPending ? 'LOGGING IN...' : 'LOGIN TO ADMIN PORTAL'}
        </button>
      </form>
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
              Admin <span className="font-semibold">Login</span>
            </h2>
            <p className="text-xs text-warm-charcoal/50 font-light">
              Sahaja Yoga Health Centre, Hyderabad
            </p>
          </div>

          <Suspense fallback={<div className="text-xs text-warm-charcoal/40 font-mono text-center py-8">Loading login...</div>}>
            <AuthForms />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
