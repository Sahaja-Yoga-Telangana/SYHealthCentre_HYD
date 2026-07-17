'use client';

import React, { useState, useTransition } from 'react';
import { confirmRegistrationAction, cancelRegistrationAction } from '../actions';

interface RegistrationItem {
  id: string;
  mrdNumber: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  bloodGroup: string;
  address: string;
  phone: string;
  emergencyContact: string;
  centerAddress: string;
  coordinatorNumber: string;
  familyLinkage?: string;
  existingDiseases?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  createdAt: string;
  session: {
    id: string;
    title: string;
    date: string;
    time: string;
  };
}

interface RegistrationsClientProps {
  initialRegistrations: RegistrationItem[];
  sessions: { id: string; title: string }[];
}

export default function RegistrationsClient({ initialRegistrations, sessions }: RegistrationsClientProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [search, setSearch] = useState('');
  const [filterSession, setFilterSession] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReg, setSelectedReg] = useState<RegistrationItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (id: string) => {
    if (!confirm('Confirm this registration?')) return;
    startTransition(async () => {
      const res = await confirmRegistrationAction(id);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'Confirmed' } : r))
        );
        if (selectedReg?.id === id) {
          setSelectedReg((prev) => prev ? { ...prev, status: 'Confirmed' } : null);
        }
      } else {
        alert(res.error || 'Operation failed');
      }
    });
  };

  const handleCancel = (id: string) => {
    if (!confirm('Cancel this registration?')) return;
    startTransition(async () => {
      const res = await cancelRegistrationAction(id);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r))
        );
        if (selectedReg?.id === id) {
          setSelectedReg((prev) => prev ? { ...prev, status: 'Cancelled' } : null);
        }
      } else {
        alert(res.error || 'Operation failed');
      }
    });
  };

  // Filter registrations
  const filteredRegs = registrations.filter((reg) => {
    const matchesSearch =
      reg.name.toLowerCase().includes(search.toLowerCase()) ||
      reg.mrdNumber.toLowerCase().includes(search.toLowerCase()) ||
      reg.phone.includes(search);

    const matchesSession = filterSession === 'all' || reg.session.id === filterSession;
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;

    return matchesSearch && matchesSession && matchesStatus;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
      {/* Table Section */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-neutral-100 pb-4">
          <input
            type="text"
            placeholder="Search seeker name, phone, or MRD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 flex-1"
          />

          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 shrink-0"
          >
            <option value="all">All Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 shrink-0"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {filteredRegs.length === 0 ? (
          <p className="text-xs text-neutral-400 font-light py-8 text-center border border-dashed border-neutral-200">
            No registrations found matching the filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100 uppercase tracking-wider text-neutral-700 font-semibold">
                  <th className="p-3">MRD Number</th>
                  <th className="p-3">Seeker Name</th>
                  <th className="p-3">Session</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-600">
                {filteredRegs.map((reg) => (
                  <tr key={reg.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-mono font-semibold text-neutral-900">{reg.mrdNumber}</td>
                    <td className="p-3">
                      <div>{reg.name}</div>
                      <div className="text-[10px] text-neutral-400">{reg.phone}</div>
                    </td>
                    <td className="p-3">
                      <div className="truncate max-w-[180px] font-medium text-neutral-800">{reg.session.title}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {new Date(reg.session.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-1.5 py-0.5 border text-[9px] font-bold tracking-wider uppercase ${
                        reg.status === 'Confirmed' 
                          ? 'border-neutral-900 bg-neutral-900 text-white' 
                          : reg.status === 'Pending'
                          ? 'border-neutral-300 text-neutral-600 bg-neutral-50'
                          : 'border-red-200 text-red-600 bg-red-50'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedReg(reg)}
                        className="text-[10px] font-semibold px-2 py-1 border hover:border-neutral-900 transition-colors"
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Side Panel */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6 sticky top-24">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
          Registration Details
        </h3>

        {selectedReg ? (
          <div className="space-y-4 text-xs">
            <div className="border-b border-neutral-100 pb-3 space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Patient ID (MRD Number)</span>
              <span className="text-sm font-mono font-bold text-neutral-900 tracking-wider block">
                {selectedReg.mrdNumber}
              </span>
            </div>

            <div className="space-y-2">
              <p><strong className="text-neutral-500 font-normal">Session:</strong> <span className="font-semibold text-neutral-800">{selectedReg.session.title}</span></p>
              <p><strong className="text-neutral-500 font-normal">Session Date/Time:</strong> <span className="font-semibold text-neutral-800 font-mono">{new Date(selectedReg.session.date).toLocaleDateString()} ({selectedReg.session.time})</span></p>
              <p><strong className="text-neutral-500 font-normal">Registered On:</strong> <span className="font-mono text-neutral-600">{new Date(selectedReg.createdAt).toLocaleString()}</span></p>
            </div>

            <div className="border-t border-neutral-100 pt-3 space-y-2">
              <h4 className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Personal Profile</h4>
              <p><strong className="text-neutral-500 font-normal">Name:</strong> {selectedReg.name}</p>
              <p><strong className="text-neutral-500 font-normal">Age/Gender:</strong> {selectedReg.age} years / {selectedReg.gender}</p>
              <p><strong className="text-neutral-500 font-normal">DOB:</strong> <span className="font-mono text-neutral-600">{new Date(selectedReg.dob).toLocaleDateString()}</span></p>
              <p><strong className="text-neutral-500 font-normal">Blood Group:</strong> {selectedReg.bloodGroup}</p>
              <p><strong className="text-neutral-500 font-normal">Phone:</strong> {selectedReg.phone}</p>
              <p><strong className="text-neutral-500 font-normal">Emergency Contact:</strong> {selectedReg.emergencyContact}</p>
              <p><strong className="text-neutral-500 font-normal">Address:</strong> {selectedReg.address}</p>
            </div>

            <div className="border-t border-neutral-100 pt-3 space-y-2">
              <h4 className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Verifications</h4>
              <p><strong className="text-neutral-500 font-normal">Center:</strong> {selectedReg.centerAddress}</p>
              <p><strong className="text-neutral-500 font-normal">Coordinator Mob:</strong> {selectedReg.coordinatorNumber}</p>
              {selectedReg.familyLinkage && (
                <p><strong className="text-neutral-500 font-normal">Family Linkage:</strong> {selectedReg.familyLinkage}</p>
              )}
            </div>

            {selectedReg.existingDiseases && (
              <div className="border-t border-neutral-100 pt-3 space-y-1">
                <h4 className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Acknowledged Diseases</h4>
                <p className="text-neutral-700 bg-neutral-50 p-2 border font-light italic">{selectedReg.existingDiseases}</p>
              </div>
            )}

            <div className="border-t border-neutral-100 pt-4 flex space-x-2">
              {selectedReg.status === 'Pending' && (
                <button
                  onClick={() => handleConfirm(selectedReg.id)}
                  disabled={isPending}
                  className="flex-1 text-[10px] font-semibold text-center py-2 bg-neutral-900 text-white tracking-widest uppercase hover:bg-neutral-800 transition-all"
                >
                  CONFIRM
                </button>
              )}
              {selectedReg.status !== 'Cancelled' && (
                <button
                  onClick={() => handleCancel(selectedReg.id)}
                  disabled={isPending}
                  className="flex-1 text-[10px] font-semibold text-center py-2 border border-red-200 text-red-500 tracking-widest uppercase hover:border-red-950 hover:bg-red-50 transition-all"
                >
                  CANCEL REGISTRATION
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 font-light py-8 text-center border border-dashed border-neutral-200">
            Select a registration from the table to view complete details, emergency contact info, and medical acknowledgements.
          </p>
        )}
      </div>
    </div>
  );
}
