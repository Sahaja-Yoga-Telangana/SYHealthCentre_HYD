'use client';

import React, { useState, useTransition } from 'react';
import { createSessionAction } from '../actions';
import Image from 'next/image';

export default function SessionForm() {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<'Session' | 'Event'>('Session');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM - 01:00 PM');
  const [instructor, setInstructor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [limitSeats, setLimitSeats] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(45);
  const [stayAvailable, setStayAvailable] = useState(true);
  const [samarpanAmount, setSamarpanAmount] = useState('');
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState('');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // File upload to Base64 image URL conversion
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // UPI QR Code upload conversion
  const handleQrCodeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('QR Code image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpiQrCodeUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (type === 'Event') {
      // For Event: Title, Date, Time are compulsory. Photo, Samarpan, and Description are optional.
      if (!title.trim() || !date || !time.trim()) {
        setError('For Events: Title, Date, and Time are compulsory.');
        return;
      }
    } else {
      // For Session: Normal compulsory fields as before
      if (!title.trim() || !description.trim() || !date || !time.trim() || !instructor.trim()) {
        setError('For Sessions: Title, Description, Date, Time, and Coordinator/Doctor are required.');
        return;
      }
    }

    startTransition(async () => {
      const res = await createSessionAction({
        type,
        title,
        description,
        date,
        time,
        instructor: instructor.trim() || (type === 'Event' ? 'Sahaja Yoga Health Centre' : 'Sahaja Yoga Coordinator'),
        imageUrl,
        limitSeats: type === 'Event' ? false : limitSeats,
        maxParticipants: type === 'Event' ? 999999 : (limitSeats ? Number(maxParticipants) : 999999),
        stayAvailable: type === 'Event' ? false : stayAvailable,
        samarpanAmount: samarpanAmount ? Number(samarpanAmount) : 0,
        upiQrCodeUrl,
        upiId: upiId.trim(),
      });

      if (res.success) {
        setSuccess(true);
        setTitle('');
        setDescription('');
        setDate('');
        setInstructor('');
        setImageUrl('');
        setLimitSeats(true);
        setMaxParticipants(45);
        setStayAvailable(true);
        setSamarpanAmount('');
        setUpiQrCodeUrl('');
        setUpiId('');
      } else {
        setError(res.error || 'Failed to create entry');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 bg-white p-6 space-y-4 rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2 flex items-center justify-between">
        <span>Create New Entry</span>
        <span className="text-[10px] text-neutral-400 font-mono font-normal">Sahaja Yoga Hyderabad</span>
      </h3>

      {/* Entry Type Switch */}
      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
          Select Entry Type *
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
          <button
            type="button"
            onClick={() => setType('Session')}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              type === 'Session'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Health Session
          </button>
          <button
            type="button"
            onClick={() => setType('Event')}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              type === 'Event'
                ? 'bg-saffron text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Collective Event
          </button>
        </div>
        <p className="text-[10px] text-neutral-400 font-light mt-1">
          {type === 'Event'
            ? '⚡ Event mode: Title, Date & Time compulsory. Description & Photo optional.'
            : '🏥 Session mode: Full health session with doctor, seat registration, and stay controls.'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-700 text-white text-xs font-mono text-center rounded">
          {type === 'Event' ? 'Collective Event published successfully!' : 'Health Session created successfully!'}
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
            {type === 'Event' ? 'Event Title *' : 'Session Title *'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
            placeholder={type === 'Event' ? 'e.g. Navratri Puja & Collective Havan' : 'e.g. General Vibratory Clearance Session'}
            required
          />
        </div>

        {/* Date & Time (Compulsory for both) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
              Time Slot *
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
              placeholder="e.g. 10:00 AM - 01:00 PM"
              required
            />
          </div>
        </div>

        {/* Picture Upload / URL (Optional for both) */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
            {type === 'Event' ? 'Event Picture (Optional)' : 'Session Banner Picture (Optional)'}
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              disabled={isPending}
              className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
            />
            <span className="text-xs text-neutral-400 font-mono">OR</span>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isPending}
              className="flex-1 w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
              placeholder="https://example.com/event-banner.jpg"
            />
          </div>
          {imageUrl && (
            <div className="mt-2 relative w-full h-32 rounded border border-neutral-200 overflow-hidden bg-neutral-50">
              <Image src={imageUrl} alt="Preview" fill className="object-cover object-top" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-1 right-1 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-mono hover:bg-red-600"
              >
                Remove Picture
              </button>
            </div>
          )}
        </div>

        {/* Description (Optional for Event, Required for Session) */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
            {type === 'Event' ? 'Description (Optional)' : 'Description *'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            rows={3}
            className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
            placeholder={type === 'Event' ? 'Optional event details or announcement notes...' : 'Enter session details, guidelines, clearance focus...'}
            required={type === 'Session'}
          />
        </div>

        {/* Samarpan (Price / Contribution) & UPI QR Code Section */}
        <div className="p-4 border border-neutral-200 bg-neutral-50/70 rounded-lg space-y-4">
          <div className="border-b border-neutral-200/80 pb-2 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-800 font-bold">
              Samarpan & Payment Settings (Optional)
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">UPI / Fee</span>
          </div>

          {/* Samarpan Amount / Price */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
              Samarpan Amount (₹)
            </label>
            <input
              type="number"
              min={0}
              value={samarpanAmount}
              onChange={(e) => setSamarpanAmount(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white rounded"
              placeholder="e.g. 500 (Enter 0 or leave empty for Free / Voluntary)"
            />
            <p className="text-[10px] text-neutral-400 font-light mt-1">
              Set the required or suggested Samarpan fee for this event/session.
            </p>
          </div>

          {/* UPI QR Code Upload */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
              UPI QR Code for Payment
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleQrCodeFileChange}
                disabled={isPending}
                className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-200 file:text-neutral-700 hover:file:bg-neutral-300 cursor-pointer"
              />
              <span className="text-xs text-neutral-400 font-mono">OR</span>
              <input
                type="text"
                value={upiQrCodeUrl}
                onChange={(e) => setUpiQrCodeUrl(e.target.value)}
                disabled={isPending}
                className="flex-1 w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white rounded"
                placeholder="https://... or upload QR image"
              />
            </div>
            {upiQrCodeUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-white border border-neutral-200 rounded">
                <div className="relative w-16 h-16 rounded border border-neutral-200 overflow-hidden bg-neutral-50 shrink-0">
                  <Image src={upiQrCodeUrl} alt="UPI QR Preview" fill className="object-contain" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-neutral-800 block">UPI QR Code Uploaded</span>
                  <button
                    type="button"
                    onClick={() => setUpiQrCodeUrl('')}
                    className="text-[10px] text-red-600 hover:text-red-800 font-semibold uppercase tracking-wider mt-1"
                  >
                    Remove QR Code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Specific UPI ID */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
              UPI ID / VPA (Optional)
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white rounded font-mono"
              placeholder="e.g. syhealthcentre@sbi"
            />
          </div>
        </div>

        {/* Session-only fields */}
        {type === 'Session' && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                Coordinator / Doctor Name *
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                disabled={isPending}
                className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
                placeholder="e.g. Dr. K. Sharma / Session Team"
                required
              />
            </div>

            {/* Seat Limit Toggle */}
            <div className="p-3 border border-neutral-200 bg-neutral-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-neutral-800">Seat Limitation</span>
                  <span className="block text-[10px] text-neutral-400 font-light">Limit total number of registrations</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLimitSeats(!limitSeats)}
                  className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${
                    limitSeats ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {limitSeats ? 'LIMITED' : 'UNLIMITED'}
                </button>
              </div>

              {limitSeats && (
                <div className="pt-2 border-t border-neutral-200">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                    Max Participants Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    disabled={isPending}
                    className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white rounded"
                  />
                </div>
              )}
            </div>

            {/* Stay Available Toggle */}
            <div className="flex items-center justify-between p-3 border border-neutral-200 bg-neutral-50 rounded-lg">
              <div>
                <span className="block text-xs font-semibold text-neutral-800">Accommodation / Stay Included</span>
                <span className="block text-[10px] text-neutral-400 font-light">Allow participants to request stay at campus</span>
              </div>
              <button
                type="button"
                onClick={() => setStayAvailable(!stayAvailable)}
                className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${
                  stayAvailable ? 'bg-emerald-700 text-white' : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {stayAvailable ? 'YES' : 'NO'}
              </button>
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-saffron hover:bg-saffron-dark text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-sm"
      >
        {isPending ? 'CREATING...' : type === 'Event' ? 'PUBLISH COLLECTIVE EVENT' : 'CREATE HEALTH SESSION'}
      </button>
    </form>
  );
}
