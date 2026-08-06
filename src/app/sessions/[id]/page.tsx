import React from 'react';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Link from 'next/link';
import Image from 'next/image';
import HeaderNav from '@/components/HeaderNav';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { id } = await params;

  let session: any = null;

  try {
    await dbConnect();
    session = await Session.findById(id);
  } catch (error) {
    console.error('Error fetching session detail:', error);
  }

  if (!session) {
    notFound();
  }

  const isEvent = session.type === 'Event';
  const isUnlimited = session.limitSeats === false;
  const remaining = Math.max(0, session.maxParticipants - session.registeredCount);
  const isFull = !isEvent && !isUnlimited && remaining === 0;

  return (
    <div className="min-h-screen bg-cream text-warm-charcoal font-sans">
      <HeaderNav />

      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/sessions"
            prefetch={true}
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-warm-charcoal/70 hover:text-saffron transition-colors"
          >
            ← Back to All Sessions & Events
          </Link>
        </div>

        {/* Detail Card */}
        <div className="bg-white border border-warm-gray rounded-3xl overflow-hidden shadow-sm space-y-6">
          {/* Banner Image with object-top if present */}
          {session.imageUrl && (
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-cream-dark border-b border-warm-gray">
              <Image
                src={session.imageUrl}
                alt={session.title}
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          )}

          <div className="p-6 sm:p-10 space-y-6">
            {/* Header Title & Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full ${
                    isEvent
                      ? 'bg-saffron text-white'
                      : session.stayAvailable
                      ? 'bg-sage/20 text-sage-dark'
                      : 'bg-warm-gray text-warm-charcoal/60'
                  }`}
                >
                  {isEvent ? 'Collective Event' : session.stayAvailable ? 'Stay Included' : 'Day Visit'}
                </span>

                <span
                  className={`px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full ${
                    session.isActive
                      ? 'bg-teal-dark text-white'
                      : 'bg-warm-gray text-warm-charcoal/50'
                  }`}
                >
                  {session.isActive ? 'Active' : 'Completed / Archived'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold text-teal-dark leading-snug">
                {session.title}
              </h1>
            </div>

            {/* Event / Session Info Grid */}
            <div className="grid sm:grid-cols-2 gap-4 p-5 bg-cream border border-warm-gray rounded-2xl text-xs sm:text-sm font-light text-warm-charcoal/80">
              <div>
                <strong className="font-semibold text-teal-dark block text-xs uppercase tracking-wider mb-0.5">
                  Date & Time
                </strong>
                {new Date(session.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                at {session.time}
              </div>

              {!isEvent && session.instructor && (
                <div>
                  <strong className="font-semibold text-teal-dark block text-xs uppercase tracking-wider mb-0.5">
                    Coordinator / Doctor
                  </strong>
                  {session.instructor}
                </div>
              )}

              {/* Only show seat availability for Session if limitSeats is enabled */}
              {!isEvent && !isUnlimited && (
                <div className="sm:col-span-2 pt-2 border-t border-warm-gray">
                  <strong className="font-semibold text-teal-dark block text-xs uppercase tracking-wider mb-0.5">
                    Seat Availability
                  </strong>
                  {isFull ? (
                    <span className="text-red-500 font-bold">Fully Booked ({session.maxParticipants} max)</span>
                  ) : (
                    <span className="text-teal font-bold">
                      {remaining} seats left out of {session.maxParticipants}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Optional Description */}
            {session.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-saffron">
                  {isEvent ? 'Event Details & Information' : 'About This Session'}
                </h3>
                <p className="text-sm sm:text-base text-warm-charcoal/80 font-light leading-relaxed whitespace-pre-line">
                  {session.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-warm-gray flex flex-col sm:flex-row gap-4">
              {!isEvent ? (
                isFull ? (
                  <button
                    disabled
                    className="w-full text-center text-xs sm:text-sm font-bold uppercase tracking-wider py-4 bg-warm-gray text-warm-charcoal/40 rounded-xl cursor-not-allowed"
                  >
                    Session Full
                  </button>
                ) : (
                  <Link
                    href={`/book?sessionId=${session._id.toString()}`}
                    className="w-full text-center text-xs sm:text-sm font-bold uppercase tracking-wider py-4 bg-saffron text-white hover:bg-saffron-dark transition-all rounded-xl shadow-md"
                  >
                    Register for This Session →
                  </Link>
                )
              ) : (
                <Link
                  href="/sessions"
                  className="w-full text-center text-xs sm:text-sm font-bold uppercase tracking-wider py-4 bg-teal-dark text-white hover:bg-teal transition-all rounded-xl shadow-md"
                >
                  ← Back to All Events & Sessions
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
