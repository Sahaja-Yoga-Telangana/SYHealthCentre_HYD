import React from 'react';
import dbConnect from '@/lib/db';
import Doctor from '@/models/Doctor';
import User from '@/models/User'; // Required to populate User relation
import DoctorForm from './DoctorForm';

export const revalidate = 0; // Disable cache to reflect new doctor additions in real-time

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default async function AdminDoctorsPage() {
  let doctorsList: any[] = [];
  let errorMsg = '';

  try {
    await dbConnect();
    // Fetch active doctors and populate user data
    doctorsList = await Doctor.find({})
      .populate('userId', 'name email gender contactNumber')
      .sort({ createdAt: -1 });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    errorMsg = error.message || 'Failed to fetch doctor database.';
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-4">
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">DOCTOR MANAGEMENT</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Configure active physicians, specialties, and weekly consulting time slots (OPD).
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-mono">
          SYSTEM ERROR: {errorMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctors Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-neutral-200 p-6 bg-white space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
              Doctors Directory ({doctorsList.length})
            </h3>

            {doctorsList.length === 0 ? (
              <p className="text-xs text-neutral-400 font-light py-8 text-center bg-neutral-50/50">
                No doctors registered. Complete the form to register a doctor, or seed the database.
              </p>
            ) : (
              <div className="divide-y divide-neutral-200">
                {doctorsList.map((doc) => {
                  const user = doc.userId;
                  return (
                    <div key={doc._id.toString()} className="py-4 flex flex-col md:flex-row md:justify-between md:items-start space-y-3 md:space-y-0">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-neutral-950">
                          {user?.name || 'Name Unknown'}
                        </h4>
                        <p className="text-xs text-neutral-500 font-light">
                          Specialty: <strong className="font-medium text-neutral-800">{doc.specialty}</strong>
                        </p>
                        <p className="text-xs text-neutral-400 font-light">
                          Email: {user?.email || 'N/A'} &bull; Contact: {user?.contactNumber || 'N/A'} &bull; Gender: {user?.gender || 'N/A'}
                        </p>
                      </div>

                      <div className="text-left md:text-right space-y-2 shrink-0">
                        <span className={`inline-block px-2 py-0.5 border text-[9px] font-bold tracking-wider uppercase ${
                          doc.active 
                            ? 'border-neutral-900 bg-neutral-900 text-white' 
                            : 'border-neutral-200 text-neutral-400'
                        }`}>
                          {doc.active ? 'Active' : 'Inactive'}
                        </span>
                        
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Available Days
                          </p>
                          <div className="flex flex-wrap gap-1 md:justify-end">
                            {doc.availability?.map((slot: any, index: number) => (
                              <span 
                                key={index} 
                                className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-600 text-[9px] font-mono"
                              >
                                {DAY_NAMES[slot.dayOfWeek].substring(0, 3)}: {slot.startTime}-{slot.endTime}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Onboarding Form */}
        <div className="lg:col-span-1">
          <DoctorForm />
        </div>
      </div>
    </div>
  );
}
