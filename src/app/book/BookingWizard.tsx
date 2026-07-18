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
}

export default function BookingWizard({ sessions, preselectedId }: BookingWizardProps) {
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

  // Form States - Step 2: Personal Information & Medical Acknowledgement
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [existingDiseases, setExistingDiseases] = useState('');

  // Form States - Step 3: Stay, Center Affiliation & Billing details
  const [centerAddress, setCenterAddress] = useState('');
  const [coordinatorNumber, setCoordinatorNumber] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Samarpan Payment options
  const [stayDays, setStayDays] = useState('1');
  const [paymentMode, setPaymentMode] = useState<'Pending' | 'UPI'>('Pending');
  const [transactionId, setTransactionId] = useState('');

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Calculations
  const totalPeopleCount = 1 + familyMembers.length;
  const stayDaysCount = parseInt(stayDays, 10) || 1;
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

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSessionId) {
      setError('Please select a stay date from the calendar.');
      return;
    }

    const session = sessions.find(s => s.id === selectedSessionId);
    if (session && session.registeredCount >= session.maxParticipants) {
      setError('This stay date is already fully booked. Please select another date.');
      return;
    }

    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !age || !dob || !bloodGroup.trim() || !address.trim() || !phone.trim() || !email.trim() || !emergencyContact.trim()) {
      setError('Please fill in all personal details.');
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
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

    const parsedDays = parseInt(stayDays, 10);
    if (isNaN(parsedDays) || parsedDays <= 0) {
      setError('Please enter a valid stay duration.');
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
        sessionId: selectedSessionId,
        name,
        age: parseInt(age, 10),
        gender,
        dob,
        bloodGroup,
        address,
        phone,
        email: email.trim(),
        emergencyContact,
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
      <div className="max-w-2xl mx-auto border border-neutral-200 bg-white p-8 text-center space-y-6">
        <div className="w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-light tracking-wide uppercase">Booking Confirmed</h2>
          <p className="text-xs text-neutral-400 font-mono">
            Thank you! Your stay booking is successful.
          </p>
        </div>

        <div className="border border-neutral-200 p-6 bg-neutral-50 space-y-4 max-w-md mx-auto text-left">
          <div className="border-b border-neutral-200 pb-2">
            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Patient ID (MRD Number)</span>
            <span className="text-lg font-mono font-bold text-neutral-900 tracking-wider block mt-0.5">
              {generatedMrd}
            </span>
          </div>

          <div className="text-xs space-y-2 text-neutral-600 font-light">
            <p>
              <strong className="font-semibold text-neutral-800">Stay Slot:</strong> {selectedSession?.title}
            </p>
            <p>
              <strong className="font-semibold text-neutral-800">Consulting Time:</strong> {selectedSession?.time}
            </p>
            <p>
              <strong className="font-semibold text-neutral-800">Yogi Seeker:</strong> {name}
            </p>
            <p>
              <strong className="font-semibold text-neutral-800">Duration:</strong> {stayDays} Day(s) of Stay
            </p>
            <p>
              <strong className="font-semibold text-neutral-800">Total Seeker(s):</strong> {totalPeopleCount} Person(s)
            </p>
            <p>
              <strong className="font-semibold text-neutral-800">Samarpan Fee:</strong> ₹{computedTotalSamarpan} &bull; <span className="uppercase font-semibold text-neutral-900">{paymentMode === 'UPI' ? 'UPI (Awaiting Verification)' : 'Pay on Arrival'}</span>
            </p>
            {paymentMode === 'UPI' && transactionId && (
              <p>
                <strong className="font-semibold text-neutral-800">Transaction ID:</strong> <span className="font-mono text-neutral-900">{transactionId}</span>
              </p>
            )}
            
            {familyMembers.length > 0 && (
              <div className="pt-2 border-t border-neutral-200 mt-2 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Family Members Registered:</span>
                <ul className="list-disc list-inside text-neutral-600 pl-1">
                  {familyMembers.map((fm, i) => (
                    <li key={i}>{fm.name} ({fm.age} yrs, {fm.gender})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-neutral-400 max-w-sm mx-auto leading-relaxed">
          Please keep this Patient ID safe. You will need to present it at the check-in counter upon arrival to receive your Doctor token.
        </p>

        <div className="pt-4 flex justify-center space-x-4">
          <button
            onClick={() => window.print()}
            className="text-[10px] font-semibold tracking-wider border border-neutral-200 px-6 py-2.5 hover:border-neutral-900 transition-colors"
          >
            PRINT CONFIRMATION
          </button>
          <Link
            href="/"
            className="text-[10px] font-semibold tracking-wider bg-neutral-900 text-white px-6 py-2.5 hover:bg-neutral-800 transition-colors"
          >
            BACK TO PORTAL
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto border border-neutral-200 bg-white overflow-hidden">
      {/* Step Indicators */}
      <div className="grid grid-cols-3 border-b border-neutral-200 text-[10px] font-semibold uppercase tracking-wider text-center bg-neutral-50 select-none">
        <div className={`p-4 border-r border-neutral-200 ${step === 1 ? 'bg-white text-neutral-950 font-bold' : 'text-neutral-400'}`}>
          1. Select Stay Date
        </div>
        <div className={`p-4 border-r border-neutral-200 ${step === 2 ? 'bg-white text-neutral-950 font-bold' : 'text-neutral-400'}`}>
          2. Personal Details
        </div>
        <div className={`p-4 ${step === 3 ? 'bg-white text-neutral-950 font-bold' : 'text-neutral-400'}`}>
          3. Stay Info & Payment
        </div>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono">
            {error}
          </div>
        )}

        {/* STEP 1: Select Stay Slot */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Select Check-In Date
              </label>

              {/* Monthly calendar view for date selection */}
              <div className="border border-neutral-200 bg-white p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <h3 className="text-xs font-bold text-neutral-900 tracking-widest uppercase">
                    {MONTH_NAMES[month]} {year}
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 border border-neutral-200 hover:border-neutral-900 text-xs font-semibold"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 border border-neutral-200 hover:border-neutral-900 text-xs font-semibold"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 border-t border-l border-neutral-200 text-neutral-600 text-center select-none text-[10px]">
                  {/* Day Headers */}
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="p-2.5 border-b border-r border-neutral-200 font-bold bg-neutral-50 text-neutral-400">
                      {day}
                    </div>
                  ))}

                  {/* Empty offsets */}
                  {Array.from({ length: startDayIndex }).map((_, index) => (
                    <div key={`empty-${index}`} className="p-2.5 border-b border-r border-neutral-100 bg-neutral-50/10 min-h-[50px]" />
                  ))}

                  {/* Active and Selectable Days */}
                  {Array.from({ length: totalDays }).map((_, index) => {
                    const dayNum = index + 1;
                    const daySession = getSessionForDay(dayNum);
                    const isSelected = daySession && selectedSessionId === daySession.id;

                    if (!daySession) {
                      return (
                        <div
                          key={`day-${dayNum}`}
                          className="p-2.5 border-b border-r border-neutral-100 text-neutral-300 min-h-[50px] flex items-center justify-center cursor-not-allowed bg-neutral-50/20 font-light"
                        >
                          {dayNum}
                        </div>
                      );
                    }

                    const spotsLeft = Math.max(0, daySession.maxParticipants - daySession.registeredCount);
                    const isFull = spotsLeft === 0;

                    if (isFull) {
                      return (
                        <div
                          key={`day-${dayNum}`}
                          className="p-1 border-b border-r border-neutral-200 text-red-400 min-h-[50px] flex flex-col justify-between items-center cursor-not-allowed bg-red-50/30 opacity-70"
                        >
                          <span className="font-bold">{dayNum}</span>
                          <span className="text-[7px] font-bold tracking-wider">FULL</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`day-${dayNum}`}
                        onClick={() => setSelectedSessionId(daySession.id)}
                        className={`p-1 border-b border-r border-neutral-200 min-h-[50px] flex flex-col justify-between items-center cursor-pointer transition-colors hover:bg-neutral-50 ${
                          isSelected
                            ? 'bg-neutral-900 text-white hover:bg-neutral-900 border-2 border-double border-neutral-950 font-bold'
                            : 'bg-white text-neutral-950 font-bold border-l-2 border-l-neutral-900'
                        }`}
                      >
                        <span className="text-xs">{dayNum}</span>
                        <span className={`text-[6px] tracking-wider font-bold block ${isSelected ? 'text-white' : 'text-neutral-500'}`}>
                          {spotsLeft} LEFT
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Date Summary */}
            <div className="pt-4 border-t border-neutral-100">
              {selectedSession ? (
                <div className="bg-neutral-50 p-4 border border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold block">Selected Stay Details</span>
                    <h4 className="text-xs font-bold text-neutral-950">{selectedSession.title}</h4>
                    <p className="text-[10px] text-neutral-500 leading-relaxed font-light">
                      Time slot: {selectedSession.time} &bull; Consulting Physician: {selectedSession.instructor}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto text-[10px] font-bold tracking-wider uppercase py-2.5 px-6 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                  >
                    CONTINUE TO DETAILS →
                  </button>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-neutral-200 text-center text-[10px] text-neutral-400 font-light italic bg-neutral-50">
                  Select a highlighted active check-in date from the calendar grid above to continue stay booking.
                </div>
              )}
            </div>
          </form>
        )}

        {/* STEP 2: Personal Details & Medical acknowledgement */}
        {step === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="e.g. 35"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
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

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="e.g. +91 99999 99999"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="e.g. rahul@example.com"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Emergency Contact Details
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="e.g. Spouse Name, Phone (+91 98888 88888)"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Advance Acknowledgement of Existing Diseases (Optional)
                </label>
                <textarea
                  value={existingDiseases}
                  onChange={(e) => setExistingDiseases(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="List any acute or chronic illnesses, allergies, or physical constraints..."
                ></textarea>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[10px] font-semibold tracking-wider border border-neutral-200 px-6 py-2.5 hover:border-neutral-900 transition-colors"
              >
                ← BACK
              </button>
              <button
                type="submit"
                className="text-[10px] font-semibold tracking-wider bg-neutral-900 text-white px-6 py-2.5 hover:bg-neutral-800 transition-colors"
              >
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

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Stay Duration (Days)
                </label>
                <input
                  type="number"
                  value={stayDays}
                  onChange={(e) => setStayDays(e.target.value)}
                  min={1}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 font-semibold text-neutral-900"
                  required
                />
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
                      {/* Big Scannable Dynamic QR Code */}
                      <div className="w-48 h-48 border border-neutral-200 p-2 bg-white flex items-center justify-center shadow-sm relative shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            `upi://pay?pa=syhealthcentre@upi&pn=Sahaja%20Yoga%20Health%20Centre&am=${computedTotalSamarpan}&cu=INR`
                          )}`}
                          alt="Scan to Pay UPI QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="space-y-1.5 w-full">
                        <p className="text-xs font-bold text-neutral-900 tracking-wide">
                          UPI ID: <span className="font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 border select-all">syhealthcentre@upi</span>
                        </p>
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
