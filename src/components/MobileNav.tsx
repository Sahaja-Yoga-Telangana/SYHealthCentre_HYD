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
        className="p-2 border border-warm-gray hover:border-saffron transition-colors rounded-md"
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
          className="text-warm-charcoal"
        >
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav className="absolute top-full left-0 right-0 bg-cream border-b border-warm-gray px-8 py-6 space-y-4 z-50 shadow-lg">
          <Link href="/" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide text-warm-charcoal/70 hover:text-saffron transition-colors">Home</Link>
          <Link href="/about" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide text-warm-charcoal/70 hover:text-saffron transition-colors">About</Link>
          <Link href="/sessions" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide text-warm-charcoal/70 hover:text-saffron transition-colors">Sessions</Link>
          
          <div className="border-t border-warm-gray pt-4 space-y-3">
            {user ? (
              <>
                <div className="text-[10px] text-warm-charcoal/50 font-mono">
                  Logged in as: <strong className="text-teal">{user.name}</strong>
                </div>
                {user.role === 'Admin' ? (
                  <Link 
                    href="/admin" 
                    onClick={() => setOpen(false)}
                    className="block text-sm font-semibold text-teal hover:text-teal-dark transition-colors"
                  >
                    ADMIN PORTAL
                  </Link>
                ) : (
                  <Link 
                    href="/dashboard" 
                    onClick={() => setOpen(false)}
                    className="block text-sm font-semibold text-teal hover:text-teal-dark transition-colors"
                  >
                    MY PORTAL / HISTORY
                  </Link>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block w-full text-left text-sm font-semibold text-warm-charcoal/50 hover:text-saffron transition-colors"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setOpen(false)}
                className="block text-sm font-semibold text-warm-charcoal/70 hover:text-saffron transition-colors"
              >
                LOGIN
              </Link>
            )}
            
            <Link 
              href="/book" 
              onClick={() => setOpen(false)}
              className="block text-sm font-bold text-center py-2.5 bg-saffron text-white tracking-widest uppercase hover:bg-saffron-dark transition-colors rounded-md"
            >
              Register Now
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
