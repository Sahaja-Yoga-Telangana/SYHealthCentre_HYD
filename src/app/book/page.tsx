import Image from 'next/image';
import React from 'react';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import BookingWizard from './BookingWizard';
import Link from 'next/link';
import shriMatajiPortrait from '../../../ShriMatajisPictures/1990_Cairns-X3.jpg';

export const revalidate = 0; // Fresh fetch on every load

interface SessionItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  instructor: string;
  maxParticipants: number;
  registeredCount: number;
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  let sessionsList: SessionItem[] = [];
  let errorMsg = '';
  const { sessionId: preselectedSessionId } = await searchParams;

  try {
    await dbConnect();
    // Fetch active sessions that are not past and have available spots
    const activeSessions = await Session.find({ isActive: true })
      .sort({ date: 1 });

    sessionsList = activeSessions.map((session) => ({
      id: session._id.toString(),
      title: session.title,
      description: session.description,
      date: session.date.toISOString(),
      time: session.time,
      instructor: session.instructor,
      maxParticipants: session.maxParticipants,
      registeredCount: session.registeredCount,
    }));
  } catch (error: unknown) {
    console.error('Error loading registration page sessions:', error);
    errorMsg = 'Could not load sessions directory. Please try again later.';
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Logo Navigation */}
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <Link href="/" className="flex flex-col group">
            <span className="font-bold tracking-widest text-sm text-neutral-900">SAHAJA YOGA</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider group-hover:text-neutral-900 transition-colors">
              ← BACK TO PORTAL
            </span>
          </Link>
          <span className="text-[10px] bg-white border border-neutral-200 px-3 py-1 font-mono text-neutral-500 uppercase">
            Seeker Registration System
          </span>
        </div>

        {errorMsg && (
          <div className="max-w-2xl mx-auto p-4 bg-white border border-red-300 text-red-500 text-xs font-mono text-center">
            {errorMsg}
          </div>
        )}

        <div className="max-w-2xl mx-auto border border-neutral-200 bg-white overflow-hidden">
          <div className="grid md:grid-cols-[180px_1fr] items-stretch">
            <div className="relative min-h-[220px] bg-neutral-100">
              <Image
                src={shriMatajiPortrait}
                alt="Shri Mataji Nirmala Devi"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 180px"
                priority
              />
            </div>
            <div className="p-6 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Yogi Registration Flow</p>
              <h1 className="text-xl font-light tracking-wide text-neutral-900">
                Register for Collective Sessions
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Guided by the serene atmosphere of the Hyderabad centre, this registration flow captures your seeker details, center affiliation, and signs you up for upcoming collective meditation and clearing sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Wizard */}
        <BookingWizard sessions={sessionsList} preselectedId={preselectedSessionId || ''} />
      </div>
    </div>
  );
}
