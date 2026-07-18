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

  // Form States - Step 1: Session Selection
  const [selectedSessionId, setSelectedSessionId] = useState(() => {
    if (preselectedId && sessions.some(s => s.id === preselectedId)) {
      return preselectedId;
    }
    return sessions[0]?.id || '';
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
  const [familyLinkage, setFamilyLinkage] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Samarpan Payment options
  const [stayDays, setStayDays] = useState('1');
  const [paymentMode, setPaymentMode] = useState<'Pending' | 'UPI'>('Pending');
  const [upiScreenshot, setUpiScreenshot] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [uploading, setUploading] = useState(false);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSessionId) {
      setError('Please select a stay slot to attend.');
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

    setStep(3);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'df6iivqm6';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'sahaja_events_unsigned';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'sy-healthcentre-upi');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setUpiScreenshot(data.secure_url);
      } else {
        setError('Transaction screenshot upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Screenshot upload error:', err);
      setError('Connection error. Failed to upload transaction screenshot.');
    } finally {
      setUploading(false);
    }
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

    if (paymentMode === 'UPI' && !transactionId.trim()) {
      setError('Please enter your UPI Transaction ID / UTR Number.');
      return;
    }

    if (paymentMode === 'UPI' && !upiScreenshot) {
      setError('Please upload your UPI payment screenshot to complete the booking.');
      return;
    }

    if (!disclaimerAccepted) {
      setError('You must accept the medical disclaimer to book a stay.');
      return;
    }

    startTransition(async () => {
      const computedAmount = parsedDays * 500;
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
        familyLinkage: familyLinkage.trim() || undefined,
        existingDiseases: existingDiseases.trim() || undefined,
        disclaimerAccepted,
        billing: {
          samarpanAmount: computedAmount,
          paymentMode: paymentMode,
          paymentStatus: 'Outstanding' as const,
          upiScreenshot: paymentMode === 'UPI' ? upiScreenshot : '',
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
              <strong className="font-semibold text-neutral-800">Samarpan Fee:</strong> ₹{parseInt(stayDays, 10) * 500} &bull; <span className="uppercase font-semibold text-neutral-900">{paymentMode === 'UPI' ? 'UPI (Awaiting Verification)' : 'Pay on Arrival'}</span>
            </p>
            {paymentMode === 'UPI' && transactionId && (
              <p>
                <strong className="font-semibold text-neutral-800">Transaction ID:</strong> <span className="font-mono text-neutral-900">{transactionId}</span>
              </p>
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
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Choose Stay Date Slot
              </label>
              {sessions.length === 0 ? (
                <div className="p-4 border border-dashed text-center text-xs text-neutral-400 font-mono bg-neutral-50">
                  No upcoming stay dates scheduled.
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const spotsLeft = Math.max(0, session.maxParticipants - session.registeredCount);
                    const isSelected = selectedSessionId === session.id;
                    const isFull = spotsLeft === 0;

                    return (
                      <div
                        key={session.id}
                        onClick={() => !isFull && setSelectedSessionId(session.id)}
                        className={`border p-4 flex justify-between items-center transition-all select-none ${
                          isFull 
                            ? 'border-neutral-100 bg-neutral-50/50 opacity-50 cursor-not-allowed' 
                            : isSelected
                            ? 'border-neutral-900 bg-neutral-50 cursor-pointer'
                            : 'border-neutral-200 hover:border-neutral-950 cursor-pointer bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-neutral-900">{session.title}</h4>
                          <p className="text-[10px] text-neutral-500 font-light font-mono">
                            Date: {new Date(session.date).toLocaleDateString()} &bull; Time: {session.time} &bull; Doctor: {session.instructor}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${
                            isFull 
                              ? 'border-red-200 text-red-500 bg-red-50' 
                              : isSelected
                              ? 'border-neutral-900 bg-neutral-900 text-white'
                              : 'border-neutral-200 text-neutral-500'
                          }`}>
                            {isFull ? 'FULL' : `${spotsLeft} spots left`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="submit"
                disabled={!selectedSessionId}
                className="text-[10px] font-semibold tracking-wider bg-neutral-900 text-white px-6 py-2.5 hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
              >
                CONTINUE TO PERSONAL DETAILS →
              </button>
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
                  Current Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="Street, City, State, Pin Code Address"
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

              {/* Advance Disease Acknowledgement (Requested in Step 2) */}
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

              {/* Total Fee Indicator */}
              <div className="flex flex-col justify-end bg-neutral-50 p-2 border border-neutral-200 text-center">
                <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">Total Samarpan Fee</span>
                <span className="text-xl font-bold font-mono text-neutral-900 mt-1">
                  ₹{parseInt(stayDays, 10) ? parseInt(stayDays, 10) * 500 : 0}
                </span>
                <span className="text-[9px] text-neutral-400 block font-light mt-0.5">Based on ₹500/day daily rate</span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                  Family Linkage (Optional)
                </label>
                <input
                  type="text"
                  value={familyLinkage}
                  onChange={(e) => setFamilyLinkage(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
                  placeholder="Link with family registrations by typing their names or Patient IDs"
                />
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
                            `upi://pay?pa=syhealthcentre@upi&pn=Sahaja%20Yoga%20Health%20Centre&am=${parseInt(stayDays, 10) * 500}&cu=INR`
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
                          Payable Samarpan: <span className="font-bold font-mono text-neutral-900">₹{parseInt(stayDays, 10) * 500}</span>
                        </p>
                        <p className="text-[10px] text-neutral-400 max-w-sm mx-auto leading-relaxed">
                          Scan the QR code with GPay, PhonePe, Paytm, or any UPI app to pay. Once completed, enter the Transaction ID and upload your receipt screenshot below.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
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

                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                          Upload Payment Screenshot
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading || isPending}
                            className="text-xs file:mr-4 file:py-1.5 file:px-3 file:border file:border-neutral-200 file:bg-white hover:file:border-neutral-900 file:text-[10px] file:font-semibold file:uppercase cursor-pointer"
                          />
                          {uploading && (
                            <span className="text-[10px] text-neutral-500 font-mono animate-pulse">Uploading to Cloudinary...</span>
                          )}
                          {!uploading && upiScreenshot && (
                            <span className="text-[10px] text-green-600 font-bold">✓ Screenshot Staged</span>
                          )}
                        </div>
                        {upiScreenshot && (
                          <div className="mt-2 relative w-32 aspect-video border bg-neutral-100 overflow-hidden">
                            <img src={upiScreenshot} alt="UPI receipt preview" className="object-cover w-full h-full" />
                          </div>
                        )}
                      </div>
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
                    disabled={isPending || uploading}
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
                disabled={isPending || uploading}
                className="text-[10px] font-semibold tracking-wider border border-neutral-200 px-6 py-2.5 hover:border-neutral-900 transition-colors"
              >
                ← BACK
              </button>
              <button
                type="submit"
                disabled={isPending || uploading}
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
