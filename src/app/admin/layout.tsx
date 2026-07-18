import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'Admin') {
    redirect('/login?callbackUrl=/admin');
  }
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans md:flex">
      {/* Sidebar */}
      <aside className="border-b border-neutral-200 md:w-64 md:border-b-0 md:border-r md:flex md:flex-col md:justify-between md:shrink-0">
        <div>
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-neutral-200">
            <Link href="/" className="flex flex-col group">
              <span className="font-semibold tracking-widest text-sm text-neutral-900">SAHAJA YOGA</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider group-hover:text-neutral-900 transition-colors">
                ← Back to Portal
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 md:p-4 flex gap-2 overflow-x-auto md:block md:space-y-1">
            <Link
              href="/admin"
              className="whitespace-nowrap flex items-center space-x-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-50 border border-neutral-200 md:border-transparent md:hover:border-neutral-200 transition-all"
            >
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/doctors"
              className="whitespace-nowrap flex items-center space-x-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-50 border border-neutral-200 md:border-transparent md:hover:border-neutral-200 transition-all"
            >
              <span>Doctors</span>
            </Link>
            <Link
              href="/admin/sessions"
              className="whitespace-nowrap flex items-center space-x-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-50 border border-neutral-200 md:border-transparent md:hover:border-neutral-200 transition-all"
            >
              <span>Stay Dates</span>
            </Link>
            <Link
              href="/admin/registrations"
              className="whitespace-nowrap flex items-center space-x-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-50 border border-neutral-200 md:border-transparent md:hover:border-neutral-200 transition-all"
            >
              <span>Registrations</span>
            </Link>
            <Link
              href="/admin/calendar"
              className="whitespace-nowrap flex items-center space-x-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-50 border border-neutral-200 md:border-transparent md:hover:border-neutral-200 transition-all"
            >
              <span>Calendar</span>
            </Link>
            <Link
              href="/admin/consultations"
              className="whitespace-nowrap flex items-center space-x-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-50 border border-neutral-200 md:border-transparent md:hover:border-neutral-200 transition-all"
            >
              <span>Consultations</span>
            </Link>
            <Link
              href="/admin/reviews"
              className="whitespace-nowrap flex items-center space-x-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-50 border border-neutral-200 md:border-transparent md:hover:border-neutral-200 transition-all"
            >
              <span>Reviews</span>
            </Link>
            <Link
              href="/admin/admins"
              className="whitespace-nowrap flex items-center space-x-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-50 border border-neutral-200 md:border-transparent md:hover:border-neutral-200 transition-all"
            >
              <span>Admins</span>
            </Link>
          </nav>
        </div>

        {/* Footer info */}
        <div className="hidden md:block p-6 border-t border-neutral-200 text-[10px] text-neutral-400">
          <div>SYHC Hyderabad Admin Panel</div>
          <div className="mt-1">v1.0.0</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="min-h-16 border-b border-neutral-200 px-4 py-3 md:px-8 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <h2 className="text-xs uppercase font-bold tracking-widest text-neutral-400">Management Panel</h2>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-mono bg-neutral-100 px-2 py-1 border border-neutral-200 text-neutral-600">
              Role: System Administrator
            </span>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
