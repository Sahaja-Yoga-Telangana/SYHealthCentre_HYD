import React from 'react';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Link from 'next/link';
import Image from 'next/image';
import HeaderNav from '@/components/HeaderNav';

export const revalidate = 0;

interface SessionItem {
  id: string;
  type?: 'Session' | 'Event';
  title: string;
  description?: string;
  date: Date;
  time: string;
  instructor?: string;
  imageUrl?: string;
  limitSeats?: boolean;
  maxParticipants: number;
  registeredCount: number;
  stayAvailable: boolean;
  samarpanAmount?: number;
  upiQrCodeUrl?: string;
  upiId?: string;
  isActive: boolean;
}

export default async function SessionsPage() {
  let upcomingSessions: SessionItem[] = [];
  let pastSessions: SessionItem[] = [];

  try {
    await dbConnect();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [upcomingDb, pastDb] = await Promise.all([
      Session.find({ isActive: true, date: { $gte: today } }).sort({ date: 1 }),
      Session.find({ $or: [{ date: { $lt: today } }, { isActive: false }] }).sort({ date: -1 }).limit(10),
    ]);

    upcomingSessions = upcomingDb.map((s) => ({
      id: s._id.toString(),
      type: s.type || 'Session',
      title: s.title,
      description: s.description || '',
      date: s.date,
      time: s.time,
      instructor: s.instructor || '',
      imageUrl: s.imageUrl || '',
      limitSeats: s.limitSeats !== undefined ? s.limitSeats : true,
      maxParticipants: s.maxParticipants,
      registeredCount: s.registeredCount,
      stayAvailable: s.stayAvailable ?? true,
      samarpanAmount: s.samarpanAmount ?? 0,
      upiQrCodeUrl: s.upiQrCodeUrl || '',
      upiId: s.upiId || '',
      isActive: s.isActive,
    }));

    pastSessions = pastDb.map((s) => ({
      id: s._id.toString(),
      type: s.type || 'Session',
      title: s.title,
      description: s.description || '',
      date: s.date,
      time: s.time,
      instructor: s.instructor || '',
      imageUrl: s.imageUrl || '',
      limitSeats: s.limitSeats !== undefined ? s.limitSeats : true,
      maxParticipants: s.maxParticipants,
      registeredCount: s.registeredCount,
      stayAvailable: s.stayAvailable ?? true,
      samarpanAmount: s.samarpanAmount ?? 0,
      upiQrCodeUrl: s.upiQrCodeUrl || '',
      upiId: s.upiId || '',
      isActive: s.isActive,
    }));
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }

  return (
    <div className="min-h-screen bg-cream text-warm-charcoal font-sans">
      {/* Navigation */}
      <HeaderNav />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-saffron">Collective Seminars & Events</span>
          <h1 className="text-3xl sm:text-4xl font-light text-teal-dark">
            Health Centre <span className="font-semibold">Sessions & Events</span>
          </h1>
        </div>

        {/* Upcoming Sessions & Events Section */}
        <div className="space-y-6">
          <div className="border-b border-warm-gray pb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-teal-dark">Upcoming Sessions & Events ({upcomingSessions.length})</h2>
            <span className="text-xs font-mono bg-saffron/10 text-saffron px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Open & Active
            </span>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((sess) => {
                const isEvent = sess.type === 'Event';
                const remaining = Math.max(0, sess.maxParticipants - sess.registeredCount);
                const isFull = !isEvent && sess.limitSeats !== false && remaining === 0;
                const sessionUrl = `/sessions/${sess.id}`;

                return (
                  <div
                    key={sess.id}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                      isFull ? 'border-warm-gray opacity-60' : 'border-warm-gray hover:border-saffron/50'
                    }`}
                  >
                    {/* Clickable Image Banner with object-top if present */}
                    {sess.imageUrl && (
                      <Link href={sessionUrl} className="block relative w-full aspect-[16/9] bg-cream-dark border-b border-warm-gray group">
                        <Image
                          src={sess.imageUrl}
                          alt={sess.title}
                          fill
                          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>
                    )}

                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={sessionUrl} className="hover:text-saffron transition-colors">
                            <h3 className="text-base font-semibold text-teal-dark leading-snug">{sess.title}</h3>
                          </Link>
                          <span
                            className={`shrink-0 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full ${
                              isEvent
                                ? 'bg-saffron/10 text-saffron border border-saffron/30'
                                : sess.stayAvailable
                                ? 'bg-sage/10 text-sage border border-sage/30'
                                : 'bg-warm-gray text-warm-charcoal/60'
                            }`}
                          >
                            {isEvent ? 'Collective Event' : sess.stayAvailable ? 'Stay Available' : 'Day Visit'}
                          </span>
                        </div>
                        {sess.description && (
                          <p className="text-xs text-warm-charcoal/60 font-light leading-relaxed line-clamp-3">
                            {sess.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs font-mono text-warm-charcoal/60 pt-2 border-t border-warm-gray">
                        {!isEvent && sess.instructor && sess.instructor !== 'Sahaja Yoga Health Centre' && (
                          <div className="flex items-center gap-2">
                            <span>Coordinator / Dr. <strong className="text-warm-charcoal">{sess.instructor}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span>{new Date(sess.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{sess.time}</span>
                        </div>
                        {sess.samarpanAmount !== undefined && (
                          <div className="flex items-center gap-2">
                            <span>Samarpan: <strong className="text-teal-dark">{sess.samarpanAmount > 0 ? `₹${sess.samarpanAmount}` : 'Free'}</strong></span>
                            {sess.upiQrCodeUrl && (
                              <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">UPI QR</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-warm-gray">
                        <div>
                          {/* If limitSeats === false or Event, show nothing */}
                          {!isEvent && sess.limitSeats !== false && (
                            <>
                              <span className={`text-xs font-bold ${isFull ? 'text-red-500' : remaining < 10 ? 'text-saffron' : 'text-sage'}`}>
                                {isFull ? 'FULLY BOOKED' : `${remaining} seats left`}
                              </span>
                              <span className="text-[10px] text-warm-charcoal/40 block font-mono">{sess.maxParticipants} capacity</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 w-full justify-end">
                          <Link
                            href={sessionUrl}
                            className="text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-md border border-warm-gray text-teal-dark hover:bg-warm-gray transition-colors"
                          >
                            DETAILS
                          </Link>
                          {!isEvent && (
                            <Link
                              href={isFull ? '#' : `/book?sessionId=${sess.id}`}
                              className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-md transition-colors ${
                                isFull
                                  ? 'bg-warm-gray text-warm-charcoal/40 cursor-not-allowed'
                                  : 'bg-saffron text-white hover:bg-saffron-dark shadow-sm'
                              }`}
                            >
                              {isFull ? 'FULL' : 'REGISTER →'}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-warm-gray rounded-2xl">
              <p className="text-xs text-warm-charcoal/50 font-light">No upcoming sessions or events currently scheduled.</p>
            </div>
          )}
        </div>

        {/* Previous / Past Sessions & Events Section */}
        <div className="space-y-6 pt-6">
          <div className="border-b border-warm-gray pb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-warm-charcoal/70">Previous Sessions & Events</h2>
            <span className="text-xs font-mono bg-warm-gray text-warm-charcoal/50 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Completed
            </span>
          </div>

          {pastSessions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-80">
              {pastSessions.map((sess) => {
                const sessionUrl = `/sessions/${sess.id}`;
                return (
                  <div key={sess.id} className="bg-white border border-warm-gray rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={sessionUrl} className="hover:text-saffron transition-colors">
                        <h3 className="text-sm font-semibold text-warm-charcoal">{sess.title}</h3>
                      </Link>
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-warm-gray text-warm-charcoal/60 rounded-full">
                        {sess.type === 'Event' ? 'Event' : 'Past'}
                      </span>
                    </div>
                    {sess.description && (
                      <p className="text-xs text-warm-charcoal/60 font-light leading-relaxed line-clamp-2">
                        {sess.description}
                      </p>
                    )}
                    <div className="text-[11px] font-mono text-warm-charcoal/50 border-t border-warm-gray pt-2 flex justify-between">
                      <span>{new Date(sess.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span>{sess.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-white border border-warm-gray rounded-2xl">
              <p className="text-xs text-warm-charcoal/40 font-light">No past records archived.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
