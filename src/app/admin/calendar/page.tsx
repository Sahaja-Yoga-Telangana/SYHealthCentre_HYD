import React from 'react';
import dbConnect from '@/lib/db';
import SessionRegistration from '@/models/SessionRegistration';
import Doctor from '@/models/Doctor';
import '@/models/Session'; // Ensure Session model is registered
import CalendarClient from './CalendarClient';

export const revalidate = 0; // Always fresh fetch

export default async function AdminCalendarPage() {
  let registrationsList: any[] = [];
  let doctorsList: { id: string; name: string }[] = [];

  try {
    await dbConnect();

    // 1. Fetch registrations populated with session details
    const regs = await SessionRegistration.find({
      status: { $ne: 'Cancelled' }
    })
      .populate('sessionId')
      .sort({ createdAt: -1 });

    registrationsList = regs.map((r) => ({
      id: r._id.toString(),
      mrdNumber: r.mrdNumber,
      name: r.name,
      age: r.age,
      gender: r.gender,
      phone: r.phone,
      checkInStatus: r.checkInStatus || 'Pending',
      status: r.status,
      session: {
        id: r.sessionId?._id?.toString() || 'deleted',
        title: r.sessionId?.title || 'Deleted Stay Slot',
        date: r.sessionId?.date?.toISOString() || '',
        time: r.sessionId?.time || '',
        instructor: r.sessionId?.instructor || 'Unassigned Doctor',
      },
      billing: r.billing ? {
        samarpanAmount: r.billing.samarpanAmount || 0,
        paymentMode: r.billing.paymentMode || 'Pending',
        paymentStatus: r.billing.paymentStatus || 'Outstanding',
      } : undefined
    }));

    // 2. Fetch doctors populated with User details
    const docs = await Doctor.find({ active: true }).populate('userId', 'name');
    doctorsList = docs.map((d) => ({
      id: d._id.toString(),
      name: d.userId?.name || 'Unknown Doctor',
    }));

  } catch (error) {
    console.error('Error fetching calendar data:', error);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">DOCTOR CALENDAR</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Effective staying seeker schedule dashboard. Track patient loads, check incoming arrivals, and select doctor filter schedules.
        </p>
      </div>

      <CalendarClient initialRegistrations={registrationsList} doctors={doctorsList} />
    </div>
  );
}
