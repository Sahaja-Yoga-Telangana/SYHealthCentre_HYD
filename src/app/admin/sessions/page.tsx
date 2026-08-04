import React from 'react';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import SessionForm from './SessionForm';
import { deleteSessionAction, updateSessionAction } from '../actions';
import Image from 'next/image';

export const revalidate = 0; // Disable caching to fetch real-time session list

export default async function SessionsAdminPage() {
  let sessions: any[] = [];

  try {
    await dbConnect();
    sessions = await Session.find({}).sort({ date: 1 });
  } catch (error) {
    console.error('Error fetching sessions list for admin:', error);
  }

  // Server actions for deletion & status toggle
  const handleDelete = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    if (id) {
      await deleteSessionAction(id);
    }
  };

  const handleToggleActive = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const currentActive = formData.get('isActive') === 'true';
    if (id) {
      await updateSessionAction(id, { isActive: !currentActive });
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">SESSIONS & EVENTS MANAGEMENT</h1>
        <p className="text-xs text-neutral-400 mt-1">Create and manage upcoming health sessions, collective clearance events, picture banners, and seat limitations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
        {/* Sessions list */}
        <div className="border border-neutral-200 bg-white p-6 space-y-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
            Scheduled Sessions & Events ({sessions.length})
          </h3>

          {sessions.length === 0 ? (
            <p className="text-xs text-neutral-400 font-light py-10 text-center border border-dashed border-neutral-200 rounded">
              No sessions scheduled yet. Use the form on the right to create your first session / event with banner pictures and seat controls.
            </p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {sessions.map((session) => {
                const isUnlimited = session.limitSeats === false;
                const remainingSeats = isUnlimited ? 'Unlimited' : Math.max(0, session.maxParticipants - session.registeredCount);

                return (
                  <div key={session._id.toString()} className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Picture Thumbnail if present (top aligned) */}
                    {session.imageUrl && (
                      <div className="relative w-20 h-20 rounded border border-neutral-200 overflow-hidden bg-neutral-100 shrink-0">
                        <Image src={session.imageUrl} alt={session.title} fill className="object-cover object-top" />
                      </div>
                    )}

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4 className="text-sm font-bold text-neutral-900">{session.title}</h4>
                        <span className={`inline-block px-2 py-0.5 border text-[9px] font-bold tracking-wider uppercase rounded ${
                          session.isActive 
                            ? 'border-neutral-900 bg-neutral-900 text-white' 
                            : 'border-neutral-200 text-neutral-400 bg-neutral-50'
                        }`}>
                          {session.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {/* Only show badge if seats are limited */}
                        {!isUnlimited && (
                          <span className="inline-block px-2 py-0.5 border text-[9px] font-bold tracking-wider uppercase rounded border-blue-700 bg-blue-50 text-blue-800">
                            LIMITED: {session.maxParticipants} SEATS
                          </span>
                        )}
                        <span className={`inline-block px-2 py-0.5 border text-[9px] font-bold tracking-wider uppercase rounded ${
                          session.stayAvailable 
                            ? 'border-neutral-200 bg-neutral-100 text-neutral-800' 
                            : 'border-amber-700 bg-amber-50 text-amber-800'
                        }`}>
                          {session.stayAvailable ? 'STAY: YES' : 'STAY: NO'}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 font-light max-w-xl line-clamp-2">{session.description}</p>

                      {/* Doctor & Seats Stats */}
                      <div className="text-[11px] text-neutral-600 font-mono flex flex-wrap gap-x-4 gap-y-1 bg-neutral-50 p-2.5 border border-neutral-100 rounded">
                        <span>Coordinator/Doctor: <strong className="text-neutral-900">{session.instructor}</strong></span>
                        <span>Date: <strong className="text-neutral-900">{new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                        <span>Time: <strong className="text-neutral-900">{session.time}</strong></span>
                        <span>Registered: <strong className="text-neutral-900">{session.registeredCount}</strong></span>
                        {/* Only show remaining seats stat if limitSeats is enabled */}
                        {!isUnlimited && (
                          <span className="text-blue-700 font-bold">
                            Seats Available: {remainingSeats}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 shrink-0 w-full md:w-auto justify-end">
                      <form action={handleToggleActive}>
                        <input type="hidden" name="id" value={session._id.toString()} />
                        <input type="hidden" name="isActive" value={session.isActive ? 'true' : 'false'} />
                        <button
                          type="submit"
                          className="text-[10px] font-semibold tracking-wider border border-neutral-200 px-3 py-1.5 hover:border-neutral-900 transition-colors rounded"
                        >
                          {session.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                        </button>
                      </form>

                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={session._id.toString()} />
                        <button
                          type="submit"
                          className="text-[10px] font-semibold tracking-wider border border-red-200 text-red-500 px-3 py-1.5 hover:border-red-950 hover:bg-red-50 transition-colors rounded"
                        >
                          DELETE
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Container */}
        <div>
          <SessionForm />
        </div>
      </div>
    </div>
  );
}
