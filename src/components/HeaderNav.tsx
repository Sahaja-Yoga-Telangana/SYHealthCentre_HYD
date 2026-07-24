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
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-warm-gray">
      {announcement && (
        <div className="bg-saffron text-white text-xs font-semibold py-2 px-4 text-center tracking-wide shadow-inner">
          {announcement}
        </div>
      )}

      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-3">
        {/* Single Line Brand Logo — No subtext, right next to title */}
        <Link href="/" prefetch={true} className="flex items-center gap-2 group">
          <span className="font-bold text-sm sm:text-base tracking-widest text-teal-dark">SAHAJA YOGA</span>
          <span className="text-[11px] sm:text-xs font-medium text-warm-charcoal/60 group-hover:text-saffron transition-colors">
            Health Centre Hyderabad
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium tracking-wide">
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
            href="/about"
            prefetch={true}
            className={`transition-colors ${
              pathname === '/about' ? 'text-saffron font-bold' : 'text-warm-charcoal/70 hover:text-saffron'
            }`}
          >
            About
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {user.role === 'Admin' ? (
                <Link
                  href="/admin"
                  prefetch={true}
                  className="text-xs font-semibold px-3 sm:px-4 py-2 border border-teal text-teal hover:bg-teal hover:text-white transition-colors rounded-md"
                >
                  ADMIN PORTAL
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="text-xs font-semibold px-3 sm:px-4 py-2 border border-teal text-teal hover:bg-teal hover:text-white transition-colors rounded-md"
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
          ) : (
            <Link
              href="/login"
              prefetch={true}
              className={`hidden md:inline-block text-xs font-semibold px-3.5 py-2 border border-warm-gray text-warm-charcoal hover:border-saffron transition-colors rounded-md ${
                pathname === '/login' ? 'bg-cream-dark font-bold' : ''
              }`}
            >
              LOGIN
            </Link>
          )}

          <Link
            href="/book"
            prefetch={true}
            className="text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-2 bg-saffron text-white hover:bg-saffron-dark transition-colors whitespace-nowrap rounded-md shadow-sm"
          >
            REGISTER NOW
          </Link>
        </div>
      </div>
    </header>
  );
}
