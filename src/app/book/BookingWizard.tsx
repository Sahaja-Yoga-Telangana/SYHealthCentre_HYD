'use client';

import React, { useState, useTransition } from 'react';
import { createRegistrationAction } from '../admin/actions';
import Link from 'next/link';

interface SessionItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  instructor: string;
  maxParticipants: number;
  registeredCount: number;
  stayAvailable?: boolean;
  isActive?: boolean;
}

interface FamilyMember {
  name: string;
  age: string;
  gender: 'Male' | 'Female';
  dob: string;
  bloodGroup: string;
}

interface BookingWizardProps {
  sessions: SessionItem[];
  preselectedId?: string;
  upiId?: string;
  upiQrCodeUrl?: string;
  upiPayeeName?: string;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStayNights(checkInDate: string, checkOutDate: string) {
  if (!checkInDate || !checkOutDate) return 1;

  const start = new Date(`${checkInDate}T00:00:00`);
  const end = new Date(`${checkOutDate}T00:00:00`);
  const diff = end.getTime() - start.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return nights > 0 ? nights : 1;
}

function formatDisplayDate(dateValue: string) {
  if (!dateValue) return 'Not selected';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));
}

export default function BookingWizard({ 
  sessions, 
  preselectedId,
  upiId = '',
  upiQrCodeUrl = '',
  upiPayeeName = 'Sahaja Yoga Health Centre'
}: BookingWizardProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [generatedMrd, setGeneratedMrd] = useState('');
  const [error, setError] = useState('');

  // Calendar Date Navigation
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    // If a session is pre-selected, default calendar to that session's month/year
    if (preselectedId) {
      const match = sessions.find(s => s.id === preselectedId);
      if (match && match.date) {
        return new Date(match.date);
      }
    }
    return new Date();
  });

  // Form States - Step 1: Session Selection
  const [selectedSessionId, setSelectedSessionId] = useState(() => {
    if (preselectedId && sessions.some(s => s.id === preselectedId)) {
      return preselectedId;
    }
    return '';
  });
  const [checkInDate, setCheckInDate] = useState(() => {
    if (preselectedId) {
      const match = sessions.find(s => s.id === preselectedId);
      if (match?.date) {
        return toDateInputValue(new Date(match.date));
      }
    }
    return '';
  });
  const [checkOutDate, setCheckOutDate] = useState('');

  // Form States - Step 2: Personal Information
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [existingDiseases, setExistingDiseases] = useState('');

  // Form States - Step 3: Stay, Center Affiliation & Billing details
  const [centerAddress, setCenterAddress] = useState('');
  const [coordinatorNumber, setCoordinatorNumber] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Samarpan Payment options
  const [paymentMode, setPaymentMode] = useState<'Pending' | 'UPI'>('Pending');
  const [transactionId, setTransactionId] = useState('');

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const selectedCheckInSession = sessions.find((s) => s.date && toDateInputValue(new Date(s.date)) === checkInDate);

  // Calculations
  const totalPeopleCount = 1 + familyMembers.length;
  const stayDaysCount = calculateStayNights(checkInDate, checkOutDate);
  const computedTotalSamarpan = stayDaysCount * totalPeopleCount * 500;

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  // Get total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get start day of month (aligned to Monday)
  const startDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to find session matching day
  const getSessionForDay = (day: number) => {
    return sessions.find((s) => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const selectCalendarDay = (day: number) => {
    const selected = toDateInputValue(new Date(year, month, day));
    const daySession = getSessionForDay(day);
    const isAdminBlocked = daySession && (!daySession.isActive || daySession.registeredCount >= daySession.maxParticipants);

    if (isAdminBlocked) {
      return;
    }

    if (!checkInDate || (checkInDate && checkOutDate) || selected < checkInDate) {
      setCheckInDate(selected);
      setCheckOutDate('');
      setSelectedSessionId(daySession?.id || '');
      return;
    }

    if (selected === checkInDate) {
      setCheckOutDate('');
      return;
    }

    setCheckOutDate(selected);
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!checkInDate || !checkOutDate) {
      setError('Please select your check-in and check-out dates.');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    const session = selectedCheckInSession;
    if (session && !session.isActive) {
      setError('This check-in date is currently closed by admin. Please select another date.');
      return;
    }

    if (session && session.registeredCount >= session.maxParticipants) {
      setError('This check-in date is fully booked by admin limitation. Please select another date.');
      return;
    }

    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !age || !dob || !bloodGroup.trim() || !phone.trim()) {
      setError('Please fill in all required fields (Name, Age, DOB, Blood Group, Phone).');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0) {
      setError('Please enter a valid age.');
      return;
    }

    // Phone validation
    const phoneRegex = /^(\+91[\-\s]?)?[6789][0-9]{9}$/;
    if (!phoneRegex.test(phone.trim().replace(/[\s\-]/g, ''))) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Email validation (optional)
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    setStep(3);
  };

  // Family members list builder
  const handleAddFamilyMember = () => {
    setFamilyMembers((prev) => [
      ...prev,
      { name: '', age: '', gender: 'Male', dob: '', bloodGroup: 'O+' }
    ]);
  };

  const handleRemoveFamilyMember = (index: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFamilyMemberChange = (index: number, key: keyof FamilyMember, value: string) => {
    setFamilyMembers((prev) =>
      prev.map((fm, i) => (i === index ? { ...fm, [key]: value } : fm))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!centerAddress.trim() || !coordinatorNumber.trim()) {
      setError('Please fill in your Center Address and Coordinator Number.');
      return;
    }

    // Validate family members
    for (let i = 0; i < familyMembers.length; i++) {
      const fm = familyMembers[i];
      if (!fm.name.trim() || !fm.age || !fm.dob || !fm.bloodGroup.trim()) {
        setError(`Please fill in all details for family member #${i + 1}.`);
        return;
      }
      const fAge = parseInt(fm.age, 10);
      if (isNaN(fAge) || fAge <= 0) {
        setError(`Please enter a valid age for family member #${i + 1}.`);
        return;
      }
    }

    if (paymentMode === 'UPI' && !transactionId.trim()) {
      setError('Please enter your UPI Transaction ID / UTR Number.');
      return;
    }

    if (!disclaimerAccepted) {
      setError('You must accept the medical disclaimer to book a stay.');
      return;
    }

    startTransition(async () => {
      const formattedFamily = familyMembers.map((fm) => ({
        name: fm.name.trim(),
        age: parseInt(fm.age, 10),
        gender: fm.gender,
        dob: fm.dob,
        bloodGroup: fm.bloodGroup,
      }));

      const payload = {
        sessionId: selectedSessionId || undefined,
        checkInDate,
        checkOutDate,
        stayDays: stayDaysCount,
        name,
        age: parseInt(age, 10),
        gender,
        dob,
        bloodGroup,
        address: '',
        phone,
        email: email.trim() || '',
        emergencyContact: '',
        centerAddress,
        coordinatorNumber,
        familyMembers: formattedFamily.length > 0 ? formattedFamily : undefined,
        existingDiseases: existingDiseases.trim() || undefined,
        disclaimerAccepted,
        billing: {
          samarpanAmount: computedTotalSamarpan,
          paymentMode: paymentMode,
          paymentStatus: 'Outstanding' as const,
          transactionId: paymentMode === 'UPI' ? transactionId.trim() : '',
        }
      };

      const res = await createRegistrationAction(payload);
      if (res.success && res.mrdNumber) {
        setGeneratedMrd(res.mrdNumber);
        setSuccess(true);
        setStep(4);
      } else {
        setError(res.error || 'Stay booking failed. Please try again.');
      }
    });
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto border border-warm-gray bg-white p-8 text-center space-y-6 rounded-xl">
        <div className="w-14 h-14 bg-teal text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-light tracking-wide text-teal-dark">Registration Confirmed</h2>
          <p className="text-xs text-warm-charcoal/50 font-mono">
            Thank you! Your session registration is successful.
          </p>
        </div>

        <div className="border border-warm-gray p-6 bg-cream rounded-lg space-y-4 max-w-md mx-auto text-left">
          <div className="border-b border-warm-gray pb-2">
            <span className="text-[9px] uppercase tracking-widest text-saffron font-bold block">Patient ID (MRD Number)</span>
            <span className="text-lg font-mono font-bold text-teal-dark tracking-wider block mt-0.5">
              {generatedMrd}
            </span>
          </div>

          <div className="text-xs space-y-2 text-warm-charcoal/70 font-light">
            <p><strong className="font-semibold text-warm-charcoal">Session:</strong> {selectedSession?.title || selectedCheckInSession?.title || 'Health Centre Session'}</p>
            <p><strong className="font-semibold text-warm-charcoal">Dates:</strong> {formatDisplayDate(checkInDate)} to {formatDisplayDate(checkOutDate)}</p>
            <p><strong className="font-semibold text-warm-charcoal">Participant:</strong> {name}</p>
            <p><strong className="font-semibold text-warm-charcoal">Phone:</strong> {phone}</p>
            <p><strong className="font-semibold text-warm-charcoal">Duration:</strong> {stayDaysCount} Night(s)</p>
            <p><strong className="font-semibold text-warm-charcoal">Total Participants:</strong> {totalPeopleCount}</p>
            <p><strong className="font-semibold text-warm-charcoal">Samarpan Fee:</strong> ₹{computedTotalSamarpan} &bull; <span className="uppercase font-semibold text-teal">{paymentMode === 'UPI' ? 'UPI (Awaiting Verification)' : 'Pay on Arrival'}</span></p>
            {paymentMode === 'UPI' && transactionId && (
              <p><strong className="font-semibold text-warm-charcoal">Transaction ID:</strong> <span className="font-mono">{transactionId}</span></p>
            )}
            {familyMembers.length > 0 && (
              <div className="pt-2 border-t border-warm-gray mt-2 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-saffron font-bold block">Family Members:</span>
                <ul className="list-disc list-inside pl-1">
                  {familyMembers.map((fm, i) => (<li key={i}>{fm.name} ({fm.age} yrs, {fm.gender})</li>))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-warm-charcoal/40 max-w-sm mx-auto leading-relaxed">
          Please keep this Patient ID safe. Present it at check-in to receive your consultation token.
        </p>

        <div className="pt-4 flex justify-center space-x-4">
          <button onClick={() => window.print()} className="text-[10px] font-semibold tracking-wider border border-warm-gray px-6 py-2.5 hover:border-saffron text-warm-charcoal transition-colors rounded-md">
            PRINT RECEIPT
          </button>
          <Link href="/" className="text-[10px] font-semibold tracking-wider bg-saffron text-white px-6 py-2.5 hover:bg-saffron-dark transition-colors rounded-md">
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto border border-warm-gray bg-white overflow-hidden rounded-xl shadow-sm">
      {/* Step Indicators */}
      <div className="grid grid-cols-3 border-b border-warm-gray text-[10px] font-semibold uppercase tracking-wider text-center bg-cream select-none">
        <div className={`p-4 border-r border-warm-gray transition-colors ${step === 1 ? 'bg-white text-saffron font-bold border-b-2 border-b-saffron' : step > 1 ? 'text-teal' : 'text-warm-charcoal/40'}`}>
          1. Select Session
        </div>
        <div className={`p-4 border-r border-warm-gray transition-colors ${step === 2 ? 'bg-white text-saffron font-bold border-b-2 border-b-saffron' : step > 2 ? 'text-teal' : 'text-warm-charcoal/40'}`}>
          2. Your Details
        </div>
        <div className={`p-4 transition-colors ${step === 3 ? 'bg-white text-saffron font-bold border-b-2 border-b-saffron' : 'text-warm-charcoal/40'}`}>
          3. Stay & Payment
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono rounded-md">
            {error}
          </div>
        )}

        {/* STEP 1: Select Available Session */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-900 mb-1">
                Select Available Health Session
              </h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Choose a doctor consultation / health session below. Each session shows doctor details, time slot, remaining seats, and stay accommodation availability.
              </p>
            </div>

            {sessions.length === 0 ? (
              <div className="p-8 border border-warm-gray bg-cream rounded-xl text-center space-y-3">
                <div className="w-10 h-10 bg-saffron/10 text-saffron rounded-full flex items-center justify-center mx-auto text-base font-bold">
                  !
                </div>
                <h4 className="text-sm font-semibold text-teal-dark">No Events Currently Available</h4>
                <p className="text-xs text-warm-charcoal/60 leading-relaxed max-w-sm mx-auto">
                  No active health sessions or events are scheduled at this time. Registration is disabled until an admin schedules an upcoming session.
                </p>
                <div className="pt-2">
                  <Link href="/" className="inline-block text-xs font-semibold px-5 py-2 bg-saffron text-white rounded-md hover:bg-saffron-dark transition-colors">
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const remainingSeats = Math.max(0, session.maxParticipants - session.registeredCount);
                  const isFull = remainingSeats === 0;
                  const isSelected = selectedSessionId === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        if (isFull) return;
                        setSelectedSessionId(session.id);
                        if (session.date) {
                          setCheckInDate(toDateInputValue(new Date(session.date)));
                        }
                      }}
                      className={`border p-5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-50/80 shadow-sm'
                          : isFull
                            ? 'border-neutral-200 bg-neutral-50/40 opacity-60 cursor-not-allowed'
                            : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4 className="text-sm font-bold text-neutral-950">{session.title}</h4>
                          <span
                            className={`inline-block px-2 py-0.5 border text-[9px] font-bold tracking-wider uppercase ${
                              session.stayAvailable !== false
                                ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                                : 'border-amber-700 bg-amber-50 text-amber-800'
                            }`}
                          >
                            {session.stayAvailable !== false ? 'STAY AVAILABLE: YES' : 'DAY VISIT ONLY (NO STAY)'}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-600 font-light leading-relaxed">
                          {session.description}
                        </p>

                        <div className="text-[11px] font-mono text-neutral-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          <span>Doctor / Specialist: <strong className="text-neutral-900">{session.instructor}</strong></span>
                          <span>Date: <strong className="text-neutral-900">{new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                          <span>Time: <strong className="text-neutral-900">{session.time}</strong></span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                        <div className="text-right mb-2">
                          <span
                            className={`text-xs font-mono font-bold block ${
                              isFull ? 'text-red-500' : remainingSeats < 10 ? 'text-amber-600' : 'text-emerald-700'
                            }`}
                          >
                            {isFull ? 'FULLY BOOKED' : `${remainingSeats} SEATS LEFT`}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-mono">
                            Total Capacity: {session.maxParticipants} seats
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isFull}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isFull) return;
                            setSelectedSessionId(session.id);
                            const sessDate = session.date ? toDateInputValue(new Date(session.date)) : toDateInputValue(new Date());
                            setCheckInDate(sessDate);
                            const checkOut = new Date(sessDate);
                            checkOut.setDate(checkOut.getDate() + 1);
                            setCheckOutDate(toDateInputValue(checkOut));
                            setStep(2);
                          }}
                          className={`w-full md:w-auto text-[10px] font-bold tracking-widest uppercase py-2.5 px-5 border transition-colors ${
                            isFull
                              ? 'border-neutral-200 text-neutral-400 bg-neutral-100 cursor-not-allowed'
                              : isSelected
                                ? 'bg-neutral-950 text-white border-neutral-950'
                                : 'bg-white text-neutral-950 border-neutral-900 hover:bg-neutral-950 hover:text-white'
                          }`}
                        >
                          {isFull ? 'FULL' : isSelected ? 'SELECTED ✓ CONTINUE →' : 'SELECT SESSION →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {sessions.length > 0 && (
              <div className="pt-4 border-t border-warm-gray flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    if (!selectedSessionId) {
                      setError('Please select an active health session from above.');
                      return;
                    }
                    if (selectedSession && selectedSession.date) {
                      setCheckInDate(toDateInputValue(new Date(selectedSession.date)));
                    }
                    if (!checkOutDate && checkInDate) {
                      const checkOut = new Date(checkInDate);
                      checkOut.setDate(checkOut.getDate() + 1);
                      setCheckOutDate(toDateInputValue(checkOut));
                    }
                    setStep(2);
                  }}
                  className="text-xs font-bold tracking-wider uppercase py-3 px-8 bg-saffron text-white hover:bg-saffron-dark transition-colors rounded-md shadow-sm"
                >
                  CONTINUE TO PERSONAL DETAILS →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Personal Details */}
        {step === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-teal-dark mb-1">Your Details</h3>
              <p className="text-xs text-warm-charcoal/50 font-light">Phone number is mandatory. Email is optional (for receiving confirmation).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Phone Number *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
                  placeholder="+91 99999 99999" required />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
                  placeholder="e.g. Rahul Sharma" required />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Age *</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
                  placeholder="e.g. 35" required />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Gender *</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Date of Birth *</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                  className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md font-mono" required />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Blood Group *</label>
                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md">
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Email Address <span className="text-warm-charcoal/30">(Optional — for receipt)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
                  placeholder="e.g. rahul@example.com" />
              </div>
            </div>

            <div className="pt-4 border-t border-warm-gray flex justify-between">
              <button type="button" onClick={() => setStep(1)}
                className="text-[10px] font-semibold tracking-wider border border-warm-gray px-6 py-2.5 hover:border-saffron text-warm-charcoal transition-colors rounded-md">
                ← BACK
              </button>
              <button type="submit"
                className="text-[10px] font-semibold tracking-wider bg-saffron text-white px-6 py-2.5 hover:bg-saffron-dark transition-colors rounded-md">
                CONTINUE TO STAY INFO →
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Stay, Center Affiliation & Payment / Disclaimer */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Center Address (Verification)
                </label>
                <input
                  type="text"
                  value={centerAddress}
                  onChange={(e) => setCenterAddress(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="e.g. Ghansimi Bazar Center, Hyd"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Coordinator Mobile Number
                </label>
                <input
                  type="tel"
                  value={coordinatorNumber}
                  onChange={(e) => setCoordinatorNumber(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="e.g. +91 95555 12345"
                  required
                />
              </div>

              <div className="flex flex-col justify-end bg-neutral-50 p-3 border border-neutral-200">
                <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">Selected Stay Dates</span>
                <span className="text-xs font-semibold text-neutral-900 mt-1">
                  {formatDisplayDate(checkInDate)} to {formatDisplayDate(checkOutDate)}
                </span>
                <span className="text-[9px] text-neutral-400 block font-light mt-0.5">
                  {stayDaysCount} night(s)
                </span>
              </div>

              {/* Total Fee Indicator (Responsive & Dynamic) */}
              <div className="flex flex-col justify-end bg-neutral-50 p-3 border border-neutral-200 text-center">
                <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">Total Samarpan Fee</span>
                <span className="text-xl font-bold font-mono text-neutral-900 mt-1">
                  ₹{computedTotalSamarpan}
                </span>
                <span className="text-[9px] text-neutral-400 block font-light mt-0.5">
                  ₹500 / day per person ({totalPeopleCount} person(s) &bull; {stayDaysCount} day(s))
                </span>
              </div>

              {/* Structured Family Members Builder */}
              <div className="md:col-span-2 border border-neutral-200 p-4 bg-neutral-50 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-800">
                    Family Members Staying With You
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddFamilyMember}
                    className="text-[9px] font-bold border border-neutral-900 px-3 py-1 uppercase bg-neutral-900 text-white hover:bg-neutral-800 tracking-wider transition-colors"
                  >
                    + Add Member
                  </button>
                </div>

                {familyMembers.length === 0 ? (
                  <p className="text-[10px] text-neutral-400 font-light italic">
                    No family members added yet. Add other seekers checking in together.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {familyMembers.map((fm, index) => (
                      <div key={index} className="p-4 border border-neutral-200 bg-white space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveFamilyMember(index)}
                          className="absolute top-2 right-3 text-[9px] font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider"
                        >
                          Remove
                        </button>
                        
                        <span className="text-[8px] font-bold font-mono text-neutral-400 block uppercase">Seeker #{index + 2} Details</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Full Name</label>
                            <input
                              type="text"
                              value={fm.name}
                              onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                              className="w-full text-xs p-1.5 border border-neutral-200 focus:outline-none bg-neutral-50"
                              placeholder="Full Name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Age</label>
                            <input
                              type="number"
                              value={fm.age}
                              onChange={(e) => handleFamilyMemberChange(index, 'age', e.target.value)}
                              className="w-full text-xs p-1.5 border border-neutral-200 focus:outline-none bg-neutral-50"
                              placeholder="Age"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Gender</label>
                            <select
                              value={fm.gender}
                              onChange={(e) => handleFamilyMemberChange(index, 'gender', e.target.value)}
                              className="w-full text-xs p-1.5 border border-neutral-200 focus:outline-none bg-neutral-50 bg-white"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Date of Birth</label>
                            <input
                              type="date"
                              value={fm.dob}
                              onChange={(e) => handleFamilyMemberChange(index, 'dob', e.target.value)}
                              className="w-full text-xs p-1.5 border border-neutral-200 focus:outline-none bg-neutral-50 font-mono"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Blood Group</label>
                            <select
                              value={fm.bloodGroup}
                              onChange={(e) => handleFamilyMemberChange(index, 'bloodGroup', e.target.value)}
                              className="w-full text-xs p-1.5 border border-neutral-200 focus:outline-none bg-neutral-50 bg-white"
                            >
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Samarpan Payment selector */}
              <div className="md:col-span-2 border border-neutral-200 p-4 bg-neutral-50 space-y-4">
                <div className="border-b pb-2 flex justify-between items-center">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-800">
                    Samarpan (Fee) Payment Method
                  </h4>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as 'Pending' | 'UPI')}
                    className="text-xs p-1 px-2 border border-neutral-300 bg-white focus:outline-none"
                  >
                    <option value="Pending">Pay on Arrival Check-in</option>
                    <option value="UPI">Pay Now via UPI (GPay/PhonePe)</option>
                  </select>
                </div>

                {paymentMode === 'UPI' && (
                  <div className="space-y-4 pt-1">
                    <div className="flex flex-col items-center justify-center bg-white p-6 border border-neutral-200 space-y-4 text-center">
                      {/* Scannable Dynamic or Admin-Provided QR Code */}
                      <div className="w-48 h-48 border border-neutral-200 p-2 bg-white flex items-center justify-center shadow-sm relative shrink-0">
                        <img
                          src={upiQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            `upi://pay?pa=${upiId || 'syhealthcentre@upi'}&pn=${encodeURIComponent(upiPayeeName)}&am=${computedTotalSamarpan}&cu=INR`
                          )}`}
                          alt="Scan to Pay UPI QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="space-y-1.5 w-full">
                        {upiId && (
                          <p className="text-xs font-bold text-neutral-900 tracking-wide">
                            UPI ID: <span className="font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 border select-all">{upiId}</span>
                          </p>
                        )}
                        <p className="text-xs text-neutral-600 font-medium">
                          Payable Samarpan: <span className="font-bold font-mono text-neutral-900">₹{computedTotalSamarpan}</span>
                        </p>
                        <p className="text-[10px] text-neutral-400 max-w-sm mx-auto leading-relaxed">
                          Scan the QR code with GPay, PhonePe, Paytm, or any UPI app to pay. Once completed, enter the UTR / Transaction ID below for manual verification on arrival.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                        UPI Transaction ID / UTR Number
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        disabled={isPending}
                        className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white font-mono"
                        placeholder="12-digit transaction ID / UTR (e.g. 326712345678)"
                        required={paymentMode === 'UPI'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Disclaimer */}
              <div className="md:col-span-2 border border-neutral-200 p-4 bg-neutral-50 space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-800">
                  Medical & Treatment Disclaimer
                </h4>
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  The Sahaja Yoga Research & Health Centre provides alternative clearing therapies using physical elements (footsoaking, ice packs) and collective meditation techniques.
                  <strong> No modern diagnostic machinery or pharmaceutical medicine is practiced here.</strong>
                  This program is dedicated exclusively to alternative holistic care and spiritual ascent. Seekers with critical diseases requiring intensive medical machinery or emergency hospitalization should not register.
                </p>
                <div className="flex items-start space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="disclaimer"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    disabled={isPending}
                    className="mt-0.5 border-neutral-300 focus:ring-neutral-900"
                    required
                  />
                  <label htmlFor="disclaimer" className="text-[10px] text-neutral-700 select-none cursor-pointer">
                    I read the disclaimer and confirm that I accept its guidelines.
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isPending}
                className="text-[10px] font-semibold tracking-wider border border-neutral-200 px-6 py-2.5 hover:border-neutral-900 transition-colors"
              >
                ← BACK
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="text-[10px] font-bold tracking-wider bg-neutral-900 text-white px-6 py-2.5 hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
              >
                {isPending ? 'BOOKING...' : 'CONFIRM & BOOK ✓'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
