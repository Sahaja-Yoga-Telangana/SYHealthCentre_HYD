'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

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
        <nav className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 px-8 py-6 space-y-4 z-50 shadow-md">
          <a href="#hero" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Home</a>
          <div className="space-y-2">
            <span className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold">About</span>
            <a href="#shri-mataji" onClick={() => setOpen(false)} className="block pl-4 text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Shri Mataji</a>
            <a href="#sahaja-yoga" onClick={() => setOpen(false)} className="block pl-4 text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Sahaja Yoga</a>
            <a href="#about-us" onClick={() => setOpen(false)} className="block pl-4 text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">About Us</a>
          </div>
          <a href="https://sahajogtelangana.vercel.app/events" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Events</a>
          <a href="#upcoming-sessions" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Upcoming Sessions</a>
          <a href="#reviews" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Reviews</a>
          
          <div className="border-t border-neutral-100 pt-4 space-y-2">
            {user ? (
              <>
                <div className="text-[10px] text-neutral-400 font-mono">
                  Logged in as: <strong className="text-neutral-700">{user.name}</strong>
                </div>
                {user.role === 'Admin' && (
                  <Link 
                    href="/admin" 
                    onClick={() => setOpen(false)}
                    className="block text-sm font-semibold hover:text-neutral-500 transition-colors"
                  >
                    ADMIN PANEL
                  </Link>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block w-full text-left text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setOpen(false)}
                className="block text-sm font-semibold hover:text-neutral-500 transition-colors"
              >
                LOGIN
              </Link>
            )}
            
            <Link 
              href="/book" 
              onClick={() => setOpen(false)}
              className="block text-sm font-bold text-center py-2.5 bg-neutral-900 text-white tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            >
              Register Now
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
