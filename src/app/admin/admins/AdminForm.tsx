'use client';

import React, { useState, useTransition } from 'react';
import { createAdminAction } from '../actions';

export default function AdminForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all details.');
      return;
    }

    startTransition(async () => {
      const res = await createAdminAction({
        name,
        email,
        passwordHash: password,
      });

      if (res.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setError(res.error || 'Failed to onboard administrator');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 bg-white p-6 space-y-4">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
        Add Administrator
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-neutral-900 border border-neutral-900 text-white text-xs font-mono text-center">
          Administrator added successfully!
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
            placeholder="e.g. Manish Bhaiya"
            required
          />
        </div>

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
            placeholder="e.g. manish@syhealthcentre.org"
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
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full text-[10px] font-bold tracking-widest uppercase py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
      >
        {isPending ? 'ONBOARDING...' : 'ADD ADMINISTRATOR ✓'}
      </button>
    </form>
  );
}
