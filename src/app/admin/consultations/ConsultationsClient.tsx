'use client';

import React, { useState, useTransition } from 'react';
import { submitConsultationAction } from '../actions';

interface CheckedInPatient {
  id: string;
  mrdNumber: string;
  name: string;
  age: number;
  gender: string;
  tokenNumber: string;
  existingDiseases?: string;
  chiefComplaint?: string;
  examinationFindings?: string;
  doctorNotes?: string;
  consultationStatus: 'Pending' | 'Completed';
  sessionTitle: string;
}

interface ConsultationsClientProps {
  initialPatients: CheckedInPatient[];
}

export default function ConsultationsClient({ initialPatients }: ConsultationsClientProps) {
  const [patients, setPatients] = useState<CheckedInPatient[]>(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState<CheckedInPatient | null>(null);
  
  // Form State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [examFindings, setExamFindings] = useState('');
  const [docNotes, setDocNotes] = useState('');
  
  const [isPending, startTransition] = useTransition();

  const handlePatientSelect = (p: CheckedInPatient) => {
    setSelectedPatient(p);
    setChiefComplaint(p.chiefComplaint || '');
    setExamFindings(p.examinationFindings || '');
    setDocNotes(p.doctorNotes || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    startTransition(async () => {
      const res = await submitConsultationAction(selectedPatient.id, {
        chiefComplaint,
        examinationFindings: examFindings,
        doctorNotes: docNotes,
      });

      if (res.success) {
        alert('Consultation saved and closed successfully!');
        
        // Remove from waiting queue list or mark as completed
        setPatients((prev) => prev.filter((p) => p.id !== selectedPatient.id));
        setSelectedPatient(null);
      } else {
        alert(res.error || 'Failed to submit consultation notes');
      }
    });
  };

  const waitingQueue = patients.filter((p) => p.consultationStatus === 'Pending');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
      {/* Waiting List Queue */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2 flex justify-between items-center">
          <span>Waiting Queue</span>
          <span className="text-[10px] bg-green-50 border border-green-200 px-2 py-0.5 text-green-700 font-bold font-mono">
            {waitingQueue.length} Yogis
          </span>
        </h3>

        {waitingQueue.length === 0 ? (
          <p className="text-xs text-neutral-400 font-light py-8 text-center border border-dashed border-neutral-200">
            No seekers currently checked in or waiting in the queue.
          </p>
        ) : (
          <div className="space-y-2">
            {waitingQueue.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePatientSelect(p)}
                className={`w-full text-left p-3 border flex justify-between items-center transition-all ${
                  selectedPatient?.id === p.id 
                    ? 'border-neutral-900 bg-neutral-50 shadow-sm' 
                    : 'border-neutral-200 hover:border-neutral-900 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-neutral-900">{p.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">MRD: {p.mrdNumber}</div>
                  <div className="text-[9px] text-neutral-400 truncate max-w-[180px]">{p.sessionTitle}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-green-700 block">{p.tokenNumber}</span>
                  <span className="text-[9px] text-neutral-400 block">{p.age} yrs / {p.gender[0]}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Consultation Entry Form Panel */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
          Consultation notes / EMR Entry
        </h3>

        {selectedPatient ? (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-50 p-4 border border-neutral-200">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Patient Name</span>
                <span className="text-xs font-semibold text-neutral-800">{selectedPatient.name}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Patient ID (MRD)</span>
                <span className="text-xs font-mono font-semibold text-neutral-800">{selectedPatient.mrdNumber}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Token / Session</span>
                <span className="text-xs font-semibold text-green-700">{selectedPatient.tokenNumber}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Age / Gender</span>
                <span className="text-xs font-semibold text-neutral-800">{selectedPatient.age} years / {selectedPatient.gender}</span>
              </div>
            </div>

            {selectedPatient.existingDiseases && (
              <div className="bg-amber-50/50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed font-light">
                <strong>Patient Acknowledged Diseases:</strong> {selectedPatient.existingDiseases}
              </div>
            )}

            {/* Free-text inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">
                  1. Chief Complaint (Symptoms & Vibratory Blocks)
                </label>
                <textarea
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  className="w-full text-xs p-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="Describe seeker's symptoms, blocks on specific chakras, left/right channel imbalance..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">
                  2. Examination Findings
                </label>
                <textarea
                  value={examFindings}
                  onChange={(e) => setExamFindings(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  className="w-full text-xs p-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="Doctor observations, cool/hot breeze diagnostic report, pulse diagnostics..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">
                  3. Doctor notes & Clearing Prescriptions
                </label>
                <textarea
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  disabled={isPending}
                  rows={4}
                  className="w-full text-xs p-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="Prescribed clearances (e.g. Footsoaking, ice pack pingla channel, mantra clearance, meditation duration)..."
                  required
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full text-[10px] font-bold tracking-widest uppercase py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
            >
              {isPending ? 'SAVING NOTES...' : 'COMPLETE CONSULTATION & CLOSE CASE FILE ✓'}
            </button>
          </form>
        ) : (
          <p className="text-xs text-neutral-400 font-light py-16 text-center border border-dashed border-neutral-200 bg-neutral-50/50">
            Select a Yogi from the waiting queue on the left to start their vibratory consultation.
          </p>
        )}
      </div>
    </div>
  );
}
