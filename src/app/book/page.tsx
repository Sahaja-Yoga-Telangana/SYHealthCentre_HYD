import Image from 'next/image';
import React from 'react';
import dbConnect from '@/lib/db';
import Doctor, { IAvailabilitySchedule } from '@/models/Doctor';
import '@/models/User';
import BookingWizard from './BookingWizard';
import Link from 'next/link';
import shriMatajiPortrait from '../../../ShriMatajisPictures/1990_Cairns-X3.jpg';

export const revalidate = 0; // Disable caching to fetch the latest doctor directory on page load

interface DoctorItem {
  id: string;
  name: string;
  specialty: string;
  availabilityDays: number[];
}

export default async function BookingPage() {
  let doctorsList: DoctorItem[] = [];
  let errorMsg = '';

  try {
    await dbConnect();
    // Fetch active doctors and populate user data
    const activeDocs = await Doctor.find({ active: true })
      .populate('userId', 'name')
      .sort({ createdAt: 1 });

    doctorsList = activeDocs.map((doc) => ({
      id: doc._id.toString(),
      name: (doc.userId as any)?.name || 'Unknown Doctor',
      specialty: doc.specialty,
      availabilityDays: doc.availability?.map((slot: IAvailabilitySchedule) => slot.dayOfWeek) || [],
    }));
  } catch (error: unknown) {
    console.error('Error loading booking page doctors:', error);
    errorMsg = 'Could not load doctors directory. Please try again later.';
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Logo Navigation */}
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <Link href="/" className="flex flex-col group">
            <span className="font-bold tracking-widest text-sm text-neutral-900">SAHAJA YOGA</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider group-hover:text-neutral-900 transition-colors">
              ← BACK TO HOME
            </span>
          </Link>
          <span className="text-[10px] bg-white border border-neutral-200 px-3 py-1 font-mono text-neutral-500 uppercase">
            Reservations System
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Centred Booking Flow</p>
              <h1 className="text-xl font-light tracking-wide text-neutral-900">
                Reserve treatment, day stay, or accommodation
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Guided by the serene atmosphere of the Hyderabad centre, this booking flow checks Sahaja Yoga eligibility, consultation timing, and accommodation preferences before your request reaches the admissions desk.
              </p>
            </div>
          </div>
        </div>

        {/* Wizard */}
        <BookingWizard doctors={doctorsList} />
      </div>
    </div>
  );
}
