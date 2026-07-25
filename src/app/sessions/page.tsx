import React from 'react';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Link from 'next/link';
import HeaderNav from '@/components/HeaderNav';

export const revalidate = 0;

interface SessionItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  instructor: string;
  maxParticipants: number;
  registeredCount: number;
  stayAvailable: boolean;
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
      title: s.title,
      description: s.description,
      date: s.date,
      time: s.time,
      instructor: s.instructor,
      maxParticipants: s.maxParticipants,
      registeredCount: s.registeredCount,
      stayAvailable: s.stayAvailable ?? true,
      isActive: s.isActive,
    }));

    pastSessions = pastDb.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      description: s.description,
      date: s.date,
      time: s.time,
      instructor: s.instructor,
      maxParticipants: s.maxParticipants,
      registeredCount: s.registeredCount,
      stayAvailable: s.stayAvailable ?? true,
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
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-saffron">Collective Seminars</span>
          <h1 className="text-3xl sm:text-4xl font-light text-teal-dark">
            Health Centre <span className="font-semibold">Sessions</span>
          </h1>
        </div>

        {/* Upcoming Sessions Section */}
        <div className="space-y-6">
          <div className="border-b border-warm-gray pb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-teal-dark">Upcoming Sessions ({upcomingSessions.length})</h2>
            <span className="text-xs font-mono bg-saffron/10 text-saffron px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Open for Registration
            </span>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((sess) => {
                const remaining = Math.max(0, sess.maxParticipants - sess.registeredCount);
                const isFull = remaining === 0;
                return (
                  <div
                    key={sess.id}
                    className={`bg-white border rounded-2xl p-6 space-y-4 shadow-sm transition-all hover:shadow-md ${
                      isFull ? 'border-warm-gray opacity-60' : 'border-warm-gray hover:border-saffron/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-teal-dark leading-snug">{sess.title}</h3>
                        <span
                          className={`shrink-0 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full ${
                            sess.stayAvailable
                              ? 'bg-sage/10 text-sage border border-sage/30'
                              : 'bg-saffron/10 text-saffron border border-saffron/30'
                          }`}
                        >
                          {sess.stayAvailable ? 'Stay: Yes' : 'Day Visit'}
                        </span>
                      </div>
                      <p className="text-xs text-warm-charcoal/60 font-light leading-relaxed line-clamp-3">
                        {sess.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono text-warm-charcoal/60">
                      <div className="flex items-center gap-2">
                        <span>Dr. <strong className="text-warm-charcoal">{sess.instructor}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{new Date(sess.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{sess.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-warm-gray">
                      <div>
                        <span className={`text-xs font-bold ${isFull ? 'text-red-500' : remaining < 10 ? 'text-saffron' : 'text-sage'}`}>
                          {isFull ? 'FULLY BOOKED' : `${remaining} seats left`}
                        </span>
                        <span className="text-[10px] text-warm-charcoal/40 block font-mono">{sess.maxParticipants} max capacity</span>
                      </div>
                      <Link
                        href={isFull ? '#' : `/book?sessionId=${sess.id}`}
                        className={`text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-md transition-colors ${
                          isFull
                            ? 'bg-warm-gray text-warm-charcoal/40 cursor-not-allowed'
                            : 'bg-saffron text-white hover:bg-saffron-dark shadow-sm'
                        }`}
                      >
                        {isFull ? 'FULL' : 'REGISTER →'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-warm-gray rounded-2xl">
              <p className="text-xs text-warm-charcoal/50 font-light">No upcoming sessions currently open for registration.</p>
            </div>
          )}
        </div>

        {/* Previous / Past Sessions Section */}
        <div className="space-y-6 pt-6">
          <div className="border-b border-warm-gray pb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-warm-charcoal/70">Previous & Completed Sessions</h2>
            <span className="text-xs font-mono bg-warm-gray text-warm-charcoal/50 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Completed
            </span>
          </div>

          {pastSessions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-80">
              {pastSessions.map((sess) => (
                <div key={sess.id} className="bg-white border border-warm-gray rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-warm-charcoal">{sess.title}</h3>
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-warm-gray text-warm-charcoal/60 rounded-full">
                      Past
                    </span>
                  </div>
                  <p className="text-xs text-warm-charcoal/60 font-light leading-relaxed line-clamp-2">
                    {sess.description}
                  </p>
                  <div className="text-[11px] font-mono text-warm-charcoal/50 border-t border-warm-gray pt-2 flex justify-between">
                    <span>Dr. {sess.instructor}</span>
                    <span>{new Date(sess.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white border border-warm-gray rounded-2xl">
              <p className="text-xs text-warm-charcoal/40 font-light">No past session records archived.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
