'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import MobileNav from './MobileNav';

export default function HeaderNav({ announcement }: { announcement?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-warm-gray shadow-sm">
      {announcement && (
        <div className="bg-saffron text-white text-xs font-semibold py-2 px-4 text-center tracking-wide shadow-inner">
          {announcement}
        </div>
      )}

      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-4">
        {/* Header Branding: Small Font top line + Sahaja Yoga Hyderabad bottom line */}
        <Link href="/" prefetch={true} className="flex flex-col group leading-tight">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-warm-charcoal/70 group-hover:text-saffron transition-colors">
            National Sahaja Yoga Resource Centre
          </span>
          <span className="text-base sm:text-xl font-bold text-teal-dark tracking-tight">
            Sahaja Yoga Hyderabad
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
          <Link
            href="/"
            prefetch={true}
            className={`transition-colors ${
              pathname === '/' ? 'text-saffron font-bold' : 'text-warm-charcoal/70 hover:text-saffron'
            }`}
          >
            Home
          </Link>
          <Link
            href="/sessions"
            prefetch={true}
            className={`transition-colors ${
              pathname === '/sessions' ? 'text-saffron font-bold' : 'text-warm-charcoal/70 hover:text-saffron'
            }`}
          >
            Sessions
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Action Button: Register for Session */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              {user.role === 'Admin' ? (
                <Link
                  href="/admin"
                  prefetch={true}
                  className="text-xs font-semibold px-3 py-2 border border-teal text-teal hover:bg-teal hover:text-white transition-colors rounded-md"
                >
                  ADMIN PORTAL
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="text-xs font-semibold px-3 py-2 border border-teal text-teal hover:bg-teal hover:text-white transition-colors rounded-md"
                >
                  MY PORTAL
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hidden sm:inline-block text-xs font-semibold text-warm-charcoal/50 hover:text-saffron transition-colors px-2 py-1"
              >
                LOGOUT
              </button>
            </>
          )}

          <Link
            href="/book"
            prefetch={true}
            className="text-[11px] sm:text-xs font-bold px-4 py-2.5 bg-saffron text-white hover:bg-saffron-dark transition-colors whitespace-nowrap rounded-md shadow-sm tracking-wide uppercase"
          >
            Register for Session
          </Link>
        </div>
      </div>
    </header>
  );
}
