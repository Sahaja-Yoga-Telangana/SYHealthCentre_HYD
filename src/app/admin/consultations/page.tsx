import React from 'react';
import dbConnect from '@/lib/db';
import SessionRegistration from '@/models/SessionRegistration';
import ConsultationsClient from './ConsultationsClient';

export const revalidate = 0; // Fresh load for queue

export default async function ConsultationsAdminPage() {
  let patientsList: any[] = [];

  try {
    await dbConnect();
    // Load all registrations that are Checked In and pending consultation
    const regs = await SessionRegistration.find({
      checkInStatus: 'Checked In',
      'consultation.status': 'Pending'
    })
      .populate('sessionId', 'title')
      .sort({ tokenNumber: 1 }); // Sort by token number order

    patientsList = regs.map((r) => ({
      id: r._id.toString(),
      mrdNumber: r.mrdNumber,
      name: r.name,
      age: r.age,
      gender: r.gender,
      tokenNumber: r.tokenNumber || 'T-XX',
      existingDiseases: r.existingDiseases || '',
      chiefComplaint: r.consultation?.chiefComplaint || '',
      examinationFindings: r.consultation?.examinationFindings || '',
      doctorNotes: r.consultation?.doctorNotes || '',
      consultationStatus: r.consultation?.status || 'Pending',
      sessionTitle: r.sessionId?.title || 'General Clearance',
    }));
  } catch (error) {
    console.error('Error fetching consultation queue:', error);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">VIBRATORY CONSULTATION DESK</h1>
        <p className="text-xs text-neutral-400 mt-1">Diagnose chakras, check channel balances, and write holistic clearing recommendations.</p>
      </div>

      <ConsultationsClient initialPatients={patientsList} />
    </div>
  );
}
