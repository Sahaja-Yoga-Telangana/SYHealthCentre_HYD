import Image from 'next/image';
import React from 'react';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import BookingWizard from './BookingWizard';
import Link from 'next/link';
import shriMatajiPortrait from '../../../ShriMatajisPictures/PhotoSM-206.jpg';

import { getSiteSettings } from '@/app/admin/actions';

export const revalidate = 0;

interface SessionItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  instructor: string;
  maxParticipants: number;
  registeredCount: number;
  stayAvailable: boolean;
  isActive: boolean;
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  let sessionsList: SessionItem[] = [];
  let errorMsg = '';
  let settings = {
    reviewsEnabled: true,
    bookingEnabled: true,
    helpdeskPhone: '',
    contactEmail: 'syhydhealthcentre@gmail.com',
    upiId: '',
    upiQrCodeUrl: '',
    upiPayeeName: 'Sahaja Yoga Health Centre',
    announcementBanner: '',
  };
  const { sessionId: preselectedSessionId } = await searchParams;

  try {
    await dbConnect();
    const [settingsData, activeSessions] = await Promise.all([
      getSiteSettings(),
      Session.find({ isActive: true }).sort({ date: 1 }),
    ]);

    settings = settingsData;
    sessionsList = activeSessions.map((session) => ({
      id: session._id.toString(),
      title: session.title,
      description: session.description,
      date: session.date.toISOString(),
      time: session.time,
      instructor: session.instructor,
      maxParticipants: session.maxParticipants,
      registeredCount: session.registeredCount,
      stayAvailable: session.stayAvailable ?? true,
      isActive: session.isActive,
    }));
  } catch (error: unknown) {
    console.error('Error loading registration page sessions:', error);
    errorMsg = 'Could not load session details. Please try refreshing the page.';
  }

  return (
    <div className="min-h-screen bg-cream text-warm-charcoal font-sans selection:bg-saffron selection:text-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Logo Navigation */}
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <Link href="/" className="flex flex-col group">
            <span className="font-bold tracking-widest text-sm text-teal-dark">SAHAJA YOGA</span>
            <span className="text-[10px] text-warm-charcoal/50 uppercase tracking-wider group-hover:text-saffron transition-colors">
              ← BACK TO HOME
            </span>
          </Link>
          <span className="text-[10px] bg-white border border-warm-gray px-3 py-1 font-mono text-warm-charcoal/50 uppercase rounded-md">
            Session Registration
          </span>
        </div>

        {errorMsg && (
          <div className="max-w-2xl mx-auto p-4 bg-white border border-red-300 text-red-500 text-xs font-mono text-center rounded-md">
            {errorMsg}
          </div>
        )}

        <div className="max-w-2xl mx-auto border border-warm-gray bg-white overflow-hidden rounded-xl shadow-sm">
          <div className="grid md:grid-cols-[180px_1fr] items-stretch">
            <div className="relative min-h-[200px] bg-cream-dark">
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-saffron font-semibold">Health Session Registration</p>
              <h1 className="text-xl font-light tracking-wide text-teal-dark">
                Register for a Session
              </h1>
              <p className="text-sm text-warm-charcoal/60 leading-relaxed font-light">
                Choose a session, provide your details, and receive a confirmation receipt. No account or login required — just your phone number and name.
              </p>
            </div>
          </div>
        </div>

        {/* Wizard or Paused Message */}
        {settings.bookingEnabled ? (
          <BookingWizard 
            sessions={sessionsList} 
            preselectedId={preselectedSessionId || ''} 
            upiId={settings.upiId}
            upiQrCodeUrl={settings.upiQrCodeUrl}
            upiPayeeName={settings.upiPayeeName}
          />
        ) : (
          <div className="max-w-2xl mx-auto border border-warm-gray bg-white p-8 text-center space-y-4 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-saffron/10 text-saffron rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ℹ
            </div>
            <h2 className="text-lg font-semibold text-teal-dark">Session Registrations Temporarily Paused</h2>
            <p className="text-xs text-warm-charcoal/60 leading-relaxed max-w-md mx-auto">
              Online session registration is currently paused by administration. Please contact the helpdesk directly or check back later.
            </p>
            <div className="pt-2">
              <Link href="/" className="inline-block text-xs font-semibold px-6 py-2.5 bg-saffron text-white rounded-md hover:bg-saffron-dark transition-colors">
                RETURN TO HOME
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
