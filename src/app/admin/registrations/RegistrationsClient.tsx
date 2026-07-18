'use client';

import React, { useState, useTransition } from 'react';
import { 
  confirmRegistrationAction, 
  cancelRegistrationAction, 
  checkInYogiAction, 
  collectPaymentAction,
  createWalkInRegistrationAction,
  updateBillingAction
} from '../actions';

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
  email?: string;
  emergencyContact: string;
  centerAddress: string;
  coordinatorNumber: string;
  familyMembers?: {
    name: string;
    age: number;
    gender: string;
    dob: string;
    bloodGroup: string;
  }[];
  existingDiseases?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  checkInStatus: 'Pending' | 'Checked In' | 'Checked Out' | 'Cancelled';
  tokenNumber?: string;
  createdAt: string;
  session: {
    id: string;
    title: string;
    date: string;
    time: string;
  };
  billing?: {
    samarpanAmount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Pending';
    paymentStatus: 'Paid' | 'Outstanding';
    upiScreenshot?: string;
    transactionId?: string;
  };
}

interface RegistrationsClientProps {
  initialRegistrations: RegistrationItem[];
  sessions: { id: string; title: string }[];
}

export default function RegistrationsClient({ initialRegistrations, sessions }: RegistrationsClientProps) {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>(initialRegistrations);
  const [search, setSearch] = useState('');
  const [filterSession, setFilterSession] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReg, setSelectedReg] = useState<RegistrationItem | null>(null);
  
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [editSamarpanAmount, setEditSamarpanAmount] = useState(500);
  const [editPaymentMode, setEditPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Pending'>('UPI');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'Paid' | 'Outstanding'>('Paid');
  const [editTransactionId, setEditTransactionId] = useState('');

  const handleSaveBillingEdit = () => {
    if (!selectedReg) return;

    startTransition(async () => {
      const billingPayload = {
        samarpanAmount: Number(editSamarpanAmount),
        paymentMode: editPaymentMode,
        paymentStatus: editPaymentStatus,
        upiScreenshot: selectedReg.billing?.upiScreenshot || '',
        transactionId: editTransactionId.trim(),
      };

      const res = await updateBillingAction(selectedReg.id, billingPayload);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === selectedReg.id
              ? { ...r, billing: billingPayload }
              : r
          )
        );
        setSelectedReg((prev) =>
          prev ? { ...prev, billing: billingPayload } : null
        );
        setIsEditingBilling(false);
      } else {
        alert(res.error || 'Failed to update billing configurations.');
      }
    });
  };
  
  // Check-In Form State
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [samarpanAmount, setSamarpanAmount] = useState(500);
  const [payMode, setPayMode] = useState<'Cash' | 'UPI' | 'Card' | 'Pending'>('UPI');
  const [payStatus, setPayStatus] = useState<'Paid' | 'Outstanding'>('Paid');
  
  // Walk-In Form State
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInSession, setWalkInSession] = useState(sessions[0]?.id || '');
  const [walkInName, setWalkInName] = useState('');
  const [walkInAge, setWalkInAge] = useState('');
  const [walkInGender, setWalkInGender] = useState<'Male' | 'Female'>('Male');
  const [walkInDob, setWalkInDob] = useState('');
  const [walkInBlood, setWalkInBlood] = useState('O+');
  const [walkInAddress, setWalkInAddress] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInEmergency, setWalkInEmergency] = useState('');
  const [walkInCenter, setWalkInCenter] = useState('');
  const [walkInCoordinator, setWalkInCoordinator] = useState('');
  const [walkInFamily, setWalkInFamily] = useState('');
  const [walkInDiseases, setWalkInDiseases] = useState('');
  
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
          prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled', checkInStatus: 'Cancelled' } : r))
        );
        if (selectedReg?.id === id) {
          setSelectedReg((prev) => prev ? { ...prev, status: 'Cancelled', checkInStatus: 'Cancelled' } : null);
        }
      } else {
        alert(res.error || 'Operation failed');
      }
    });
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;

    startTransition(async () => {
      const res = await checkInYogiAction(selectedReg.id, {
        samarpanAmount: Number(samarpanAmount),
        paymentMode: payMode,
        paymentStatus: payStatus,
      });

      if (res.success && res.tokenNumber) {
        const updatedBilling = {
          samarpanAmount: Number(samarpanAmount),
          paymentMode: payMode,
          paymentStatus: payStatus,
        };

        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === selectedReg.id
              ? {
                  ...r,
                  checkInStatus: 'Checked In',
                  tokenNumber: res.tokenNumber,
                  billing: updatedBilling,
                }
              : r
          )
        );

        setSelectedReg((prev) =>
          prev
            ? {
                ...prev,
                checkInStatus: 'Checked In',
                tokenNumber: res.tokenNumber,
                billing: updatedBilling,
              }
            : null
        );

        setShowCheckInForm(false);
      } else {
        alert(res.error || 'Failed to check in patient');
      }
    });
  };

  const handleCollectPayment = (id: string) => {
    if (!confirm('Mark Samarpan payment as Paid?')) return;
    startTransition(async () => {
      const res = await collectPaymentAction(id);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === id && r.billing
              ? { ...r, billing: { ...r.billing, paymentStatus: 'Paid' } }
              : r
          )
        );
        if (selectedReg?.id === id && selectedReg.billing) {
          setSelectedReg((prev) =>
            prev
              ? { ...prev, billing: prev.billing ? { ...prev.billing, paymentStatus: 'Paid' } : undefined }
              : null
          );
        }
      } else {
        alert(res.error || 'Payment collect action failed');
      }
    });
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInSession || !walkInName || !walkInAge || !walkInDob || !walkInPhone) {
      alert('Please fill out name, age, dob, phone and select a session.');
      return;
    }

    const phoneRegex = /^(\+91[\-\s]?)?[6789][0-9]{9}$/;
    if (!phoneRegex.test(walkInPhone.trim().replace(/[\s\-]/g, ''))) {
      alert('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    startTransition(async () => {
      const res = await createWalkInRegistrationAction({
        sessionId: walkInSession,
        name: walkInName,
        age: Number(walkInAge),
        gender: walkInGender,
        dob: walkInDob,
        bloodGroup: walkInBlood,
        address: walkInAddress || 'Walk-In Seeker Address',
        phone: walkInPhone,
        emergencyContact: walkInEmergency || walkInPhone,
        centerAddress: walkInCenter || 'Hyderabad Center',
        coordinatorNumber: walkInCoordinator || 'Local Walk-In',
        familyMembers: [],
        existingDiseases: walkInDiseases,
      });

      if (res.success && res.mrdNumber) {
        alert(`Walk-In registered successfully! Patient ID (MRD Number): ${res.mrdNumber}`);
        
        // Refresh local listings or append walk-in (simulate reload/state push)
        const sessionObj = sessions.find((s) => s.id === walkInSession);
        const newReg: RegistrationItem = {
          id: Math.random().toString(), // Temp local id
          mrdNumber: res.mrdNumber,
          name: walkInName,
          age: Number(walkInAge),
          gender: walkInGender,
          dob: walkInDob,
          bloodGroup: walkInBlood,
          address: walkInAddress || 'Walk-In Seeker Address',
          phone: walkInPhone,
          emergencyContact: walkInEmergency || walkInPhone,
          centerAddress: walkInCenter || 'Hyderabad Center',
          coordinatorNumber: walkInCoordinator || 'Local Walk-In',
          familyMembers: [],
          existingDiseases: walkInDiseases,
          status: 'Confirmed',
          checkInStatus: 'Pending',
          createdAt: new Date().toISOString(),
          session: {
            id: walkInSession,
            title: sessionObj?.title || 'Walk-In Session',
            date: new Date().toISOString(),
            time: 'Walk-In Slot',
          },
        };

        setRegistrations((prev) => [newReg, ...prev]);
        setShowWalkInForm(false);
        
        // Reset form
        setWalkInName('');
        setWalkInAge('');
        setWalkInDob('');
        setWalkInPhone('');
        setWalkInEmergency('');
        setWalkInCenter('');
        setWalkInCoordinator('');
        setWalkInFamily('');
        setWalkInDiseases('');
      } else {
        alert(res.error || 'Failed to create walk-in registration');
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
    <div className="space-y-6">
      {/* Action Header bar */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 p-4">
        <span className="text-xs text-neutral-400 font-mono">EMR Registration Console</span>
        <button
          onClick={() => {
            setShowWalkInForm(!showWalkInForm);
            setSelectedReg(null);
          }}
          className="text-[10px] font-bold tracking-widest uppercase border border-neutral-900 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
        >
          {showWalkInForm ? '← VIEW REGISTRATIONS' : '+ WALK-IN APPOINTMENT'}
        </button>
      </div>

      {/* Walk-in Form Container */}
      {showWalkInForm && (
        <div className="border border-neutral-200 bg-white p-6 space-y-6 max-w-2xl mx-auto">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800">
              Walk-In Seeker Registration Form
            </h3>
            <p className="text-[10px] text-neutral-400 mt-1">Register walk-in Yogis directly onto doctor consultation waiting queues.</p>
          </div>

          <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Target Session</label>
                <select
                  value={walkInSession}
                  onChange={(e) => setWalkInSession(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  required
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="e.g. Suresh Kumar"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Age</label>
                <input
                  type="number"
                  value={walkInAge}
                  onChange={(e) => setWalkInAge(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="35"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Gender</label>
                <select
                  value={walkInGender}
                  onChange={(e) => setWalkInGender(e.target.value as 'Male' | 'Female')}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Blood Group</label>
                <input
                  type="text"
                  value={walkInBlood}
                  onChange={(e) => setWalkInBlood(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="O+"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={walkInDob}
                  onChange={(e) => setWalkInDob(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="+919876543210"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={walkInEmergency}
                  onChange={(e) => setWalkInEmergency(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="Name / Mobile"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Local Center Address</label>
                <input
                  type="text"
                  value={walkInCenter}
                  onChange={(e) => setWalkInCenter(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="Secunderabad Center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Center Coordinator Mob</label>
                <input
                  type="text"
                  value={walkInCoordinator}
                  onChange={(e) => setWalkInCoordinator(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="+919999999999"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Family Linkage details</label>
                <input
                  type="text"
                  value={walkInFamily}
                  onChange={(e) => setWalkInFamily(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="Spouse already staying..."
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">Existing Disease reports</label>
              <textarea
                value={walkInDiseases}
                onChange={(e) => setWalkInDiseases(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                placeholder="List asthma, high blood pressure, diabetes, etc. if any"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full text-[10px] font-bold tracking-widest uppercase py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
            >
              {isPending ? 'REGISTERING...' : 'CONFIRM WALK-IN REGISTRATION ✓'}
            </button>
          </form>
        </div>
      )}

      {/* Main Listing & Inspection Desk */}
      {!showWalkInForm && (
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
                      <th className="p-3">Arrival Queuing</th>
                      <th className="p-3">Samarpan billing</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-600">
                    {filteredRegs.map((reg) => {
                      const hasOutstanding = reg.billing?.paymentStatus === 'Outstanding';
                      return (
                        <tr key={reg.id} className="hover:bg-neutral-50/50">
                          <td className="p-3 font-mono font-semibold text-neutral-900">{reg.mrdNumber}</td>
                          <td className="p-3">
                            <div>{reg.name}</div>
                            <div className="text-[10px] text-neutral-400">{reg.phone}</div>
                          </td>
                          <td className="p-3 space-y-1">
                            {/* Check-In Status */}
                            <div>
                              <span className={`inline-block px-1.5 py-0.5 border text-[8px] font-bold tracking-wider uppercase ${
                                reg.checkInStatus === 'Checked In'
                                  ? 'border-green-300 text-green-700 bg-green-50'
                                  : reg.checkInStatus === 'Checked Out'
                                  ? 'border-neutral-300 text-neutral-500 bg-neutral-100'
                                  : 'border-neutral-200 text-neutral-400 bg-neutral-50'
                              }`}>
                                {reg.checkInStatus === 'Checked In' && reg.tokenNumber 
                                  ? `CHECKED IN (${reg.tokenNumber})` 
                                  : reg.checkInStatus}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            {reg.billing ? (
                              <div className="space-y-1">
                                <span className={`inline-block px-1.5 py-0.5 border text-[8px] font-bold tracking-wider uppercase ${
                                  hasOutstanding 
                                    ? 'border-red-200 bg-red-50 text-red-600 font-bold animate-pulse' 
                                    : 'border-green-200 bg-green-50 text-green-600'
                                }`}>
                                  {hasOutstanding ? `OUTSTANDING: ₹${reg.billing.samarpanAmount}` : `PAID: ₹${reg.billing.samarpanAmount}`}
                                </span>
                                <div className="text-[9px] text-neutral-400">
                                  Mode: {reg.billing.paymentMode}
                                </div>
                              </div>
                            ) : (
                              <span className="text-neutral-300 font-light italic">No billing profile</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedReg(reg);
                                setShowCheckInForm(false);
                              }}
                              className="text-[10px] font-semibold px-2 py-1 border hover:border-neutral-900 transition-colors"
                            >
                              VIEW
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
                
                {/* Check-In Form */}
                {showCheckInForm ? (
                  <form onSubmit={handleCheckInSubmit} className="border border-neutral-200 p-4 space-y-3 bg-neutral-50/50">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-800 border-b pb-1">
                      Check-In & Billing Scheme
                    </h4>
                    
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                        Fixed Samarpan Fee (₹)
                      </label>
                      <input
                        type="number"
                        value={samarpanAmount}
                        onChange={(e) => setSamarpanAmount(Number(e.target.value))}
                        disabled={isPending}
                        className="w-full text-xs p-1.5 border border-neutral-200 focus:outline-none bg-white"
                        min={0}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                          Payment Mode
                        </label>
                        <select
                          value={payMode}
                          onChange={(e) => setPayMode(e.target.value as any)}
                          className="w-full text-xs p-1.5 border border-neutral-200 focus:outline-none bg-white"
                        >
                          <option value="UPI">UPI (GPay/PhonePe)</option>
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                          Initial Status
                        </label>
                        <select
                          value={payStatus}
                          onChange={(e) => setPayStatus(e.target.value as any)}
                          className="w-full text-xs p-1.5 border border-neutral-200 focus:outline-none bg-white"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Outstanding">Outstanding</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex space-x-2">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 text-[9px] font-bold tracking-widest uppercase py-2 bg-neutral-900 text-white hover:bg-neutral-800"
                      >
                        CONFIRM CHECK-IN
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCheckInForm(false)}
                        className="text-[9px] font-semibold border border-neutral-200 px-3 py-2 hover:bg-white"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Patient ID (MRD Number)</span>
                        <span className="text-sm font-mono font-bold text-neutral-900 tracking-wider block">
                          {selectedReg.mrdNumber}
                        </span>
                      </div>
                      <div>
                        {selectedReg.checkInStatus === 'Checked In' && selectedReg.tokenNumber && (
                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Daily Token</span>
                            <span className="text-lg font-mono font-bold text-green-700 tracking-wider block">
                              {selectedReg.tokenNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p><strong className="text-neutral-500 font-normal">Session:</strong> <span className="font-semibold text-neutral-800">{selectedReg.session.title}</span></p>
                      <p><strong className="text-neutral-500 font-normal">Registered On:</strong> <span className="font-mono text-neutral-600">{new Date(selectedReg.createdAt).toLocaleString()}</span></p>
                      <p>
                        <strong className="text-neutral-500 font-normal">Check-In Status:</strong>{' '}
                        <span className="font-semibold text-neutral-800">{selectedReg.checkInStatus}</span>
                      </p>
                    </div>

                    {/* Billing Summary */}
                    {selectedReg.billing && (
                      <div className="border border-neutral-200 p-4 bg-neutral-50 space-y-3">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1.5">
                          <strong>Stay Billing Details</strong>
                          <span className={`inline-block px-1.5 py-0.5 border text-[8px] font-bold tracking-wider uppercase ${
                            selectedReg.billing.paymentStatus === 'Outstanding'
                              ? 'border-red-200 bg-red-50 text-red-600 animate-pulse'
                              : 'border-green-200 bg-green-50 text-green-600'
                          }`}>
                            {selectedReg.billing.paymentStatus}
                          </span>
                        </div>

                        {isEditingBilling ? (
                          <div className="space-y-3 text-xs">
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                                Samarpan Amount (₹)
                              </label>
                              <input
                                type="number"
                                value={editSamarpanAmount}
                                onChange={(e) => setEditSamarpanAmount(Number(e.target.value))}
                                className="w-full text-xs p-1 border border-neutral-200 focus:outline-none bg-white font-mono"
                                min={0}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                                  Mode
                                </label>
                                <select
                                  value={editPaymentMode}
                                  onChange={(e) => setEditPaymentMode(e.target.value as any)}
                                  className="w-full text-xs p-1 border border-neutral-200 focus:outline-none bg-white"
                                >
                                  <option value="Cash">Cash</option>
                                  <option value="UPI">UPI</option>
                                  <option value="Card">Card</option>
                                  <option value="Pending">Pending</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                                  Status
                                </label>
                                <select
                                  value={editPaymentStatus}
                                  onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                                  className="w-full text-xs p-1 border border-neutral-200 focus:outline-none bg-white"
                                >
                                  <option value="Paid">Paid</option>
                                  <option value="Outstanding">Outstanding</option>
                                </select>
                              </div>
                            </div>

                            {editPaymentMode === 'UPI' && (
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                                  UPI Transaction ID / UTR
                                </label>
                                <input
                                  type="text"
                                  value={editTransactionId}
                                  onChange={(e) => setEditTransactionId(e.target.value)}
                                  className="w-full text-xs p-1 border border-neutral-200 focus:outline-none bg-white font-mono"
                                  placeholder="e.g. 326712345678"
                                />
                              </div>
                            )}

                            <div className="pt-1 flex space-x-2">
                              <button
                                type="button"
                                onClick={handleSaveBillingEdit}
                                disabled={isPending}
                                className="flex-1 text-[9px] font-bold py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 tracking-wider uppercase"
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingBilling(false)}
                                className="text-[9px] font-semibold border border-neutral-200 px-3 py-1.5 hover:bg-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-xs">
                            <p><strong className="text-neutral-500 font-normal">Samarpan Fee:</strong> ₹{selectedReg.billing.samarpanAmount}</p>
                            <p><strong className="text-neutral-500 font-normal">Payment Method:</strong> {selectedReg.billing.paymentMode}</p>
                            {selectedReg.billing.transactionId && (
                              <p><strong className="text-neutral-500 font-normal">UPI Transaction ID:</strong> <span className="font-mono text-neutral-800 font-medium">{selectedReg.billing.transactionId}</span></p>
                            )}
                            
                            <div className="pt-2 flex space-x-2">
                              {selectedReg.billing.paymentStatus === 'Outstanding' && (
                                <button
                                  onClick={() => handleCollectPayment(selectedReg.id)}
                                  disabled={isPending}
                                  className="flex-1 text-[9px] font-bold py-1.5 border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 tracking-wider uppercase"
                                >
                                  Mark as Paid ✓
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditSamarpanAmount(selectedReg.billing?.samarpanAmount || 500);
                                  setEditPaymentMode(selectedReg.billing?.paymentMode || 'UPI');
                                  setEditPaymentStatus(selectedReg.billing?.paymentStatus || 'Outstanding');
                                  setEditTransactionId(selectedReg.billing?.transactionId || '');
                                  setIsEditingBilling(true);
                                }}
                                className="text-[9px] font-semibold border border-neutral-300 px-3 py-1.5 hover:bg-white"
                              >
                                Edit Billing
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t border-neutral-100 pt-3 space-y-2">
                      <h4 className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Personal Profile</h4>
                      <p><strong className="text-neutral-500 font-normal">Name:</strong> {selectedReg.name}</p>
                      <p><strong className="text-neutral-500 font-normal">Age/Gender:</strong> {selectedReg.age} years / {selectedReg.gender}</p>
                      <p><strong className="text-neutral-500 font-normal">DOB:</strong> <span className="font-mono text-neutral-600">{new Date(selectedReg.dob).toLocaleDateString()}</span></p>
                      <p><strong className="text-neutral-500 font-normal">Blood Group:</strong> {selectedReg.bloodGroup}</p>
                      <p><strong className="text-neutral-500 font-normal">Phone:</strong> {selectedReg.phone}</p>
                      {selectedReg.email && (
                        <p><strong className="text-neutral-500 font-normal">Email:</strong> {selectedReg.email}</p>
                      )}
                      <p><strong className="text-neutral-500 font-normal">Emergency Contact:</strong> {selectedReg.emergencyContact}</p>
                      <p><strong className="text-neutral-500 font-normal">Address:</strong> {selectedReg.address}</p>
                    </div>

                    <div className="border-t border-neutral-100 pt-3 space-y-2">
                      <h4 className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Verifications</h4>
                      <p><strong className="text-neutral-500 font-normal">Center:</strong> {selectedReg.centerAddress}</p>
                      <p><strong className="text-neutral-500 font-normal">Coordinator Mob:</strong> {selectedReg.coordinatorNumber}</p>
                      {selectedReg.familyMembers && selectedReg.familyMembers.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Family Members Staying</span>
                          <div className="space-y-1.5 pl-2 border-l border-neutral-200">
                            {selectedReg.familyMembers.map((fm, idx) => (
                              <div key={idx} className="text-[10px] text-neutral-600">
                                <strong>{fm.name}</strong> ({fm.age} yrs, {fm.gender}, Blood: {fm.bloodGroup})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedReg.existingDiseases && (
                      <div className="border-t border-neutral-100 pt-3 space-y-1">
                        <h4 className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Acknowledged Diseases</h4>
                        <p className="text-neutral-700 bg-neutral-50 p-2 border font-light italic">{selectedReg.existingDiseases}</p>
                      </div>
                    )}

                    <div className="border-t border-neutral-100 pt-4 space-y-2">
                      {/* Check-In Trigger */}
                      {selectedReg.status === 'Confirmed' && selectedReg.checkInStatus === 'Pending' && (
                        <button
                          onClick={() => {
                            setSamarpanAmount(500);
                            setPayMode('UPI');
                            setPayStatus('Paid');
                            setShowCheckInForm(true);
                          }}
                          disabled={isPending}
                          className="w-full text-[10px] font-bold text-center py-2.5 bg-neutral-900 text-white tracking-widest uppercase hover:bg-neutral-800 transition-all"
                        >
                          ARRIVED & CHECK-IN PATIENT →
                        </button>
                      )}

                      <div className="flex space-x-2">
                        {selectedReg.status === 'Pending' && (
                          <button
                            onClick={() => handleConfirm(selectedReg.id)}
                            disabled={isPending}
                            className="flex-1 text-[10px] font-semibold text-center py-2 bg-neutral-900 text-white tracking-widest uppercase hover:bg-neutral-800 transition-all"
                          >
                            CONFIRM REGISTRATION
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
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 font-light py-8 text-center border border-dashed border-neutral-200">
                Select a registration from the table to view complete details, emergency contact info, and medical acknowledgements.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
