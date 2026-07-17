'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 border border-neutral-200 hover:border-neutral-900 transition-colors"
        aria-label="Toggle navigation menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-neutral-900"
        >
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 px-8 py-6 space-y-4 z-50">
          <Link href="/" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Home</Link>
          <div className="space-y-2">
            <span className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold">About</span>
            <a href="#shri-mataji" onClick={() => setOpen(false)} className="block pl-4 text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Shri Mataji</a>
            <a href="#sahaja-yoga" onClick={() => setOpen(false)} className="block pl-4 text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Sahaja Yoga</a>
            <a href="#about-us" onClick={() => setOpen(false)} className="block pl-4 text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">About Us</a>
          </div>
          <a href="#upcoming-sessions" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Upcoming Sessions</a>
          <a href="#reviews" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Reviews</a>
          <Link href="/book" onClick={() => setOpen(false)} className="block text-sm font-bold text-center py-2 bg-neutral-900 text-white tracking-widest uppercase hover:bg-neutral-800 transition-colors">Register</Link>
        </nav>
      )}
    </div>
  );
}
