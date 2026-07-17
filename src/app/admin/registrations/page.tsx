import React from 'react';
import dbConnect from '@/lib/db';
import SessionRegistration from '@/models/SessionRegistration';
import Session from '@/models/Session';
import RegistrationsClient from './RegistrationsClient';

export const revalidate = 0; // Fresh load for registrations list

export default async function RegistrationsAdminPage() {
  let registrationsList: any[] = [];
  let sessionsList: { id: string; title: string }[] = [];

  try {
    await dbConnect();
    // Load all registrations
    const regs = await SessionRegistration.find({})
      .populate('sessionId', 'title date time')
      .sort({ createdAt: -1 });

    registrationsList = regs.map((r) => ({
      id: r._id.toString(),
      mrdNumber: r.mrdNumber,
      name: r.name,
      age: r.age,
      gender: r.gender,
      dob: r.dob.toISOString(),
      bloodGroup: r.bloodGroup,
      address: r.address,
      phone: r.phone,
      emergencyContact: r.emergencyContact,
      centerAddress: r.centerAddress,
      coordinatorNumber: r.coordinatorNumber,
      familyLinkage: r.familyLinkage || '',
      existingDiseases: r.existingDiseases || '',
      status: r.status,
      checkInStatus: r.checkInStatus || 'Pending',
      tokenNumber: r.tokenNumber || '',
      createdAt: r.createdAt.toISOString(),
      session: {
        id: r.sessionId?._id?.toString() || 'deleted',
        title: r.sessionId?.title || 'Deleted Session',
        date: r.sessionId?.date?.toISOString() || '',
        time: r.sessionId?.time || '',
      },
      billing: r.billing ? {
        samarpanAmount: r.billing.samarpanAmount || 0,
        paymentMode: r.billing.paymentMode || 'Pending',
        paymentStatus: r.billing.paymentStatus || 'Outstanding',
      } : undefined
    }));

    // Load active sessions for filtering
    const sessions = await Session.find({ isActive: true }).sort({ date: 1 });
    sessionsList = sessions.map((s) => ({
      id: s._id.toString(),
      title: s.title,
    }));
  } catch (error) {
    console.error('Error fetching registrations in admin:', error);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">SESSION REGISTRATIONS</h1>
        <p className="text-xs text-neutral-400 mt-1">Review seeker personal profiles, verify center affiliations, and manage check-in statuses.</p>
      </div>

      <RegistrationsClient initialRegistrations={registrationsList} sessions={sessionsList} />
    </div>
  );
}
