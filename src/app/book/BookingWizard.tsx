'use client';

import React, { useState, useTransition } from 'react';
import { createBookingAction } from '../admin/actions';
import Link from 'next/link';
import {
  DAY_STAY_PRICE,
  OPD_PRICE,
  OPD_TIME_SLOTS,
  calculateStayDays,
  calculateStayPricing,
  type Gender,
  type Nationality,
  type RoomCategory,
} from '@/lib/healthCentre';

interface DoctorItem {
  id: string;
  name: string;
  specialty: string;
  availabilityDays: number[];
}

interface BookingWizardProps {
  doctors: DoctorItem[];
}

export default function BookingWizard({ doctors }: BookingWizardProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [nationality, setNationality] = useState<Nationality>('Indian');
  const [yogiExperienceMonths, setYogiExperienceMonths] = useState<number>(12);

  // Booking Type State
  const [bookingType, setBookingType] = useState<'OPD' | 'Day Stay' | 'IPD'>('OPD');

  // Specific Booking Details — lazy initializer avoids setState during render
  const [selectedDoctorId, setSelectedDoctorId] = useState(() => doctors[0]?.id || '');

  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<string>(OPD_TIME_SLOTS[0]);

  // Stay (IPD) Details
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomCategory, setRoomCategory] = useState<RoomCategory>('Double');
  const [sharingOccupants, setSharingOccupants] = useState<number>(1);
  const [error, setError] = useState('');

  // Eligibility Statuses
  const isEligibleForAny = yogiExperienceMonths >= 6;
  const isEligibleForIPD = yogiExperienceMonths >= 12;

  // Gender change handler that adjusts room category
  const handleGenderChange = (val: Gender) => {
    setGender(val);
    if (roomCategory === 'Ladies Dormitory' && val === 'Male') {
      setRoomCategory("Men's Dormitory");
    } else if (roomCategory === "Men's Dormitory" && val === 'Female') {
      setRoomCategory('Ladies Dormitory');
    }
  };

  // Pricing Engine logic (Derived State)
  const stayDays = calculateStayDays(checkInDate, checkOutDate);
  const { pricePerDay, rateLabel, totalAmount } = calculateStayPricing({
    nationality,
    roomCategory,
    sharingOccupants,
    stayDays,
  });

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !contactNumber) {
      setError('Please fill out all personal details.');
      return;
    }

    if (!isEligibleForAny) {
      setError('Under centre guidelines, patients must have practiced Sahaja Yoga for at least 6 months.');
      return;
    }

    // Auto switch booking type if ineligible for IPD
    if (bookingType === 'IPD' && !isEligibleForIPD) {
      setBookingType('OPD');
    }

    setStep(2);
  };

  const handleSubmitBooking = () => {
    setError('');

    // Pre-validation for Step 2
    if (bookingType === 'OPD') {
      if (!selectedDoctorId || !appointmentDate || !timeSlot) {
        setError('Please select a doctor, appointment date, and time slot.');
        return;
      }
    } else if (bookingType === 'Day Stay') {
      if (!appointmentDate) {
        setError('Please select a date.');
        return;
      }
    } else if (bookingType === 'IPD') {
      if (!checkInDate || !checkOutDate) {
        setError('Please select check-in and check-out dates.');
        return;
      }
      if (new Date(checkOutDate) <= new Date(checkInDate)) {
        setError('Check-out date must be after check-in date.');
        return;
      }
    }

    const bookingPayload = {
      name,
      email,
      contactNumber,
      gender,
      nationality,
      yogiExperienceMonths,
      bookingType,
      details: {
        ...(bookingType === 'OPD' && {
          doctorId: selectedDoctorId,
          appointmentDate,
          timeSlot,
        }),
        ...(bookingType === 'Day Stay' && {
          appointmentDate,
        }),
        ...(bookingType === 'IPD' && {
          checkInDate,
          checkOutDate,
          roomCategory,
          sharingOccupants,
        }),
      },
    };

    startTransition(async () => {
      const result = await createBookingAction(bookingPayload);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to submit booking request.');
      }
    });
  };

  if (success) {
    return (
      <div className="border border-neutral-200 bg-white p-8 space-y-6 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full border border-neutral-900 flex items-center justify-center mx-auto bg-neutral-900 text-white">
          ✓
        </div>
        <h2 className="text-xl font-medium tracking-wide">BOOKING REQUEST SUBMITTED</h2>
        <div className="w-8 h-[1px] bg-neutral-300 mx-auto"></div>
        <p className="text-sm text-neutral-500 font-light leading-relaxed">
          Your request for a <strong className="font-semibold text-neutral-800">{bookingType}</strong> booking has been recorded. 
          The administration desk at Nirmal Nagari, Hyderabad will review your eligibility credentials on check-in.
        </p>
        <div className="bg-neutral-50 border p-4 text-xs space-y-1 font-mono text-left">
          <p><strong>Patient:</strong> {name}</p>
          <p><strong>Email:</strong> {email}</p>
          {bookingType === 'IPD' ? (
            <>
              <p><strong>Room Category:</strong> {roomCategory}</p>
              <p><strong>Duration:</strong> {stayDays} day(s)</p>
              <p><strong>Total Estimate:</strong> ₹{totalAmount}</p>
            </>
          ) : (
            <p><strong>Scheduled:</strong> {appointmentDate} {bookingType === 'OPD' ? `(${timeSlot})` : ''}</p>
          )}
        </div>
        <div className="pt-4 flex justify-center space-x-4">
          <Link href="/" className="px-4 py-2 border text-xs font-semibold uppercase tracking-wider hover:border-neutral-900">
            Back to Home
          </Link>
          <button 
            onClick={() => {
              setStep(1);
              setSuccess(false);
              setName('');
              setEmail('');
              setContactNumber('');
              setCheckInDate('');
              setCheckOutDate('');
            }} 
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800"
          >
            New Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto border border-neutral-200 bg-white p-8 space-y-8">
      {/* Wizard Header Progress */}
      <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-800">
            {step === 1 ? 'Step 1: Patient Credentials' : 'Step 2: Session details'}
          </h2>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
            Sahaja Yoga Health Centre Reservation Wizard
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-neutral-400">
          {step} / 2
        </span>
      </div>

      {error && (
        <div className="p-3 bg-neutral-50 text-neutral-900 border border-neutral-300 text-xs font-mono">
          BLOCKER: {error}
        </div>
      )}

      {/* STEP 1: Personal Info & Eligibility Check */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white"
                placeholder="Yogi Name"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white"
                placeholder="yogi@gmail.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => handleGenderChange(e.target.value as 'Male' | 'Female')}
                className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Nationality
              </label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value as 'Indian' | 'Non-Indian')}
                className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
              >
                <option value="Indian">Indian Nationality</option>
                <option value="Non-Indian">Foreign Nationality</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Sahaja Yoga Practice Duration
              </label>
              <select
                value={yogiExperienceMonths}
                onChange={(e) => setYogiExperienceMonths(parseInt(e.target.value))}
                className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
              >
                <option value={3}>Less than 6 months</option>
                <option value={8}>6 months to 1 year (OPD/Day stay eligibility)</option>
                <option value={18}>1 to 2 years (Full IPD/Stay eligibility)</option>
                <option value={36}>Over 2 years (Full IPD/Stay eligibility)</option>
              </select>
            </div>
          </div>

          {/* Guidelines Notice */}
          <div className="p-4 border border-neutral-200 bg-neutral-50 text-[11px] text-neutral-600 space-y-1.5 leading-relaxed">
            <span className="font-bold text-neutral-950 uppercase block tracking-widest text-[9px]">Admission Guidelines:</span>
            <p>&bull; Outpatient (OPD) and Day Stay visits require a minimum of 6 months practice in Sahaja Yoga.</p>
            <p>&bull; Full inpatient admission (IPD Stays) requires a minimum of 1 year active practice in Sahaja Yoga.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest"
            >
              PROCEED TO BOOKING →
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Selection of Stays / Appointments */}
      {step === 2 && (
        <div className="space-y-8">
          {/* Choice of Booking Types */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Select Reservation Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setBookingType('OPD')}
                className={`py-3 border text-xs font-semibold uppercase tracking-wider transition-all ${
                  bookingType === 'OPD'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                OPD (Consultation)
              </button>

              <button
                type="button"
                onClick={() => setBookingType('Day Stay')}
                className={`py-3 border text-xs font-semibold uppercase tracking-wider transition-all ${
                  bookingType === 'Day Stay'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                Day Stay (Meals)
              </button>

              <button
                type="button"
                onClick={() => setBookingType('IPD')}
                disabled={!isEligibleForIPD}
                className={`py-3 border text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-30 ${
                  bookingType === 'IPD'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                IPD (Stay) {!isEligibleForIPD && '(Locked)'}
              </button>
            </div>
            {!isEligibleForIPD && (
              <p className="text-[10px] text-neutral-400 italic">
                * IPD stay booking is locked. A practice duration of 1+ year in Sahaja Yoga is required.
              </p>
            )}
          </div>

          {/* OPD Booking Fields */}
          {bookingType === 'OPD' && (
            <div className="border border-neutral-200 p-6 bg-neutral-50/50 space-y-4">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">OPD Setup</span>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Select Consulting Doctor
                </label>
                {doctors.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No doctors available. Check database.</p>
                ) : (
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Select Date (Mon-Sat)
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Consultation Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
                  >
                    {OPD_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot === '10:00 - 10:30' && '10:00 AM - 10:30 AM'}
                        {slot === '10:30 - 11:00' && '10:30 AM - 11:00 AM'}
                        {slot === '11:00 - 11:30' && '11:00 AM - 11:30 AM'}
                        {slot === '11:30 - 12:00' && '11:30 AM - 12:00 PM'}
                        {slot === '12:00 - 12:30' && '12:00 PM - 12:30 PM'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="text-xs text-neutral-400">Total Consultation Charge:</span>
                <span className="font-mono text-lg font-semibold">₹{OPD_PRICE}</span>
              </div>
            </div>
          )}

          {/* Day Stay Fields */}
          {bookingType === 'Day Stay' && (
            <div className="border border-neutral-200 p-6 bg-neutral-50/50 space-y-4">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Day Stay Setup</span>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Select Date (Mon-Sat)
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
                />
              </div>

              <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                Day Stay timings are from <strong className="font-medium text-neutral-900">10:00 AM to 5:00 PM</strong>. Includes vibratory evaluations, clearance sessions, meditations, and wholesome vegetarian meals.
              </p>

              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="text-xs text-neutral-400">Tariff per day:</span>
                <span className="font-mono text-lg font-semibold">₹{DAY_STAY_PRICE}</span>
              </div>
            </div>
          )}

          {/* IPD Booking Fields */}
          {bookingType === 'IPD' && (
            <div className="border border-neutral-200 p-6 bg-neutral-50/50 space-y-6">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                IPD Accommodation Setup
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Room Type
                  </label>
                  <select
                    value={roomCategory}
                    onChange={(e) => {
                      setRoomCategory(e.target.value as RoomCategory);
                      setSharingOccupants(1);
                    }}
                    className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
                  >
                    <option value="Double">Double Room</option>
                    <option value="Family">Family Room (up to 4)</option>
                    {gender === 'Female' && <option value="Ladies Dormitory">Ladies Dormitory</option>}
                    {gender === 'Male' && <option value="Men's Dormitory">Men&apos;s Dormitory</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Occupants count
                  </label>
                  {roomCategory === 'Double' ? (
                    <select
                      value={sharingOccupants}
                      onChange={(e) => setSharingOccupants(parseInt(e.target.value))}
                      className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
                    >
                      <option value={1}>1 Adult (Single Occupancy)</option>
                      <option value={2}>2 Adults (Shared Room)</option>
                    </select>
                  ) : roomCategory === 'Family' ? (
                    <select
                      value={sharingOccupants}
                      onChange={(e) => setSharingOccupants(parseInt(e.target.value))}
                      className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
                    >
                      <option value={1}>1 Adult</option>
                      <option value={2}>2 Adults</option>
                      <option value={3}>3 Adults</option>
                      <option value={4}>4 Adults</option>
                    </select>
                  ) : (
                    <div className="border border-neutral-200 p-2 bg-neutral-100 text-xs text-neutral-500 font-semibold h-[34px] flex items-center">
                      1 occupant (Dorm Bed)
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Bill Summary */}
              <div className="pt-4 border-t border-neutral-200 text-xs font-mono space-y-1.5 text-neutral-600 bg-white p-4 border">
                <span className="font-bold text-neutral-950 uppercase block tracking-widest text-[9px] mb-2 font-sans">
                  Billing Breakdowns
                </span>
                <p><strong>Room Category:</strong> {roomCategory}</p>
                <p><strong>Daily Rate:</strong> ₹{pricePerDay} {rateLabel}</p>
                <p><strong>Occupants count:</strong> {sharingOccupants}</p>
                <p><strong>Stay Duration:</strong> {stayDays} day(s)</p>
                <div className="pt-2 border-t border-dashed border-neutral-200 flex justify-between items-baseline font-sans text-sm font-bold text-neutral-950">
                  <span>TOTAL ESTIMATED TARIFF:</span>
                  <span className="font-mono text-base">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isPending}
              className="px-6 py-2.5 border border-neutral-200 text-neutral-600 hover:border-neutral-400 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              ← BACK
            </button>
            <button
              type="button"
              onClick={handleSubmitBooking}
              disabled={isPending}
              className="px-6 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              {isPending ? 'SUBMITTING...' : 'CONFIRM & REQUEST BOOKING'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
