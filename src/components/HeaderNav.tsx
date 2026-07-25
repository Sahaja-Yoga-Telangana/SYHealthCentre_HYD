'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function HeaderNav({ announcement }: { announcement?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      {/* Announcement Banner (if set by Admin) */}
      {announcement && (
        <div className="bg-saffron text-white text-xs font-semibold py-2 px-4 text-center tracking-wide shadow-inner sticky top-0 z-40">
          {announcement}
        </div>
      )}

      {/* Top Simple Brand Header */}
      <div className="py-4 px-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" prefetch={true} className="group">
          <span className="text-base sm:text-xl font-bold text-teal-dark tracking-tight group-hover:text-saffron transition-colors">
            Sahaja Yoga Hyderabad
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            {user.role === 'Admin' ? (
              <Link
                href="/admin"
                prefetch={true}
                className="text-xs font-semibold px-3 py-1.5 border border-teal text-teal hover:bg-teal hover:text-white transition-colors rounded-full"
              >
                ADMIN PORTAL
              </Link>
            ) : (
              <Link
                href="/dashboard"
                prefetch={true}
                className="text-xs font-semibold px-3 py-1.5 border border-teal text-teal hover:bg-teal hover:text-white transition-colors rounded-full"
              >
                MY PORTAL
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs font-semibold text-warm-charcoal/60 hover:text-saffron transition-colors"
            >
              LOGOUT
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Oval Navigation Pill */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-warm-charcoal/90 text-white backdrop-blur-xl border border-white/20 px-5 sm:px-7 py-2.5 rounded-full shadow-2xl flex items-center gap-4 sm:gap-7 transition-all duration-300">
        <Link
          href="/"
          prefetch={true}
          className={`text-xs sm:text-sm font-medium tracking-wide transition-colors ${
            pathname === '/' ? 'text-saffron font-bold' : 'text-white/80 hover:text-white'
          }`}
        >
          Home
        </Link>

        <span className="w-1 h-1 bg-white/30 rounded-full"></span>

        <Link
          href="/sessions"
          prefetch={true}
          className={`text-xs sm:text-sm font-medium tracking-wide transition-colors ${
            pathname === '/sessions' ? 'text-saffron font-bold' : 'text-white/80 hover:text-white'
          }`}
        >
          Sessions
        </Link>

        <span className="w-1 h-1 bg-white/30 rounded-full"></span>

        <Link
          href="/book"
          prefetch={true}
          className="text-[11px] sm:text-xs font-bold px-4 py-2 bg-saffron text-white hover:bg-saffron-dark transition-all rounded-full shadow-md tracking-wider uppercase whitespace-nowrap"
        >
          Register for Session
        </Link>
      </nav>
    </>
  );
}
