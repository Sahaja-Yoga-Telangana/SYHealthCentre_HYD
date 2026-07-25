'use client';

import React, { useState, useTransition } from 'react';
import { createSessionAction } from '../actions';
import Image from 'next/image';

export default function SessionForm() {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM - 01:00 PM');
  const [instructor, setInstructor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [limitSeats, setLimitSeats] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(45);
  const [stayAvailable, setStayAvailable] = useState(true);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim() || !description.trim() || !date || !time.trim() || !instructor.trim()) {
      setError('Please fill out all required session details.');
      return;
    }

    startTransition(async () => {
      const res = await createSessionAction({
        title,
        description,
        date,
        time,
        instructor,
        imageUrl,
        limitSeats,
        maxParticipants: limitSeats ? Number(maxParticipants) : 999999,
        stayAvailable,
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
      } else {
        setError(res.error || 'Failed to create session');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 bg-white p-6 space-y-4 rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2 flex items-center justify-between">
        <span>Create New Session / Event</span>
        <span className="text-[10px] text-neutral-400 font-mono font-normal">Sahaja Yoga Hyderabad</span>
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-700 text-white text-xs font-mono text-center rounded">
          Session / Event created successfully!
        </div>
      )}

      <div className="space-y-4">
        {/* Session Picture Upload / URL */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
            Event / Session Picture (Upload Image or Paste Image URL)
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
              className="flex-1 w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
              placeholder="https://example.com/event-banner.jpg"
            />
          </div>
          {imageUrl && (
            <div className="mt-2 relative w-full h-32 rounded border border-neutral-200 overflow-hidden bg-neutral-50">
              <Image src={imageUrl} alt="Event Preview" fill className="object-cover" />
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

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
            Session Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
            placeholder="e.g. Collective Clearance & Vibratory Health Seminar"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
            Description / Guidelines *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            rows={3}
            className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
            placeholder="Describe the session schedule, element treatment focus, or stay details..."
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded font-mono"
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
              placeholder="e.g. 09:00 AM - 01:00 PM"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
              Doctor / Coordinator Name *
            </label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2.5 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded"
              placeholder="e.g. Dr. Ramesh Verma"
              required
            />
          </div>

          {/* Seats Limit Toggle */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
              Seat Limitations
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setLimitSeats(true)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase border rounded transition-colors ${
                  limitSeats
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200'
                }`}
              >
                LIMITED SEATS
              </button>
              <button
                type="button"
                onClick={() => setLimitSeats(false)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase border rounded transition-colors ${
                  !limitSeats
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-neutral-600 border-neutral-200'
                }`}
              >
                UNLIMITED SEATS
              </button>
            </div>
            {limitSeats && (
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                disabled={isPending}
                className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 rounded mt-2 font-mono"
                placeholder="Max Capacity (e.g. 45)"
                min={1}
                required
              />
            )}
          </div>
        </div>

        {/* Stay Option (Yes / No) */}
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-neutral-700 font-semibold">
              Overnight Stay Accommodation Option
            </span>
            <span className="text-[10px] text-neutral-400">
              Allow seekers to book overnight stay accommodation for this session?
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setStayAvailable(true)}
              className={`px-3 py-1 text-[10px] font-bold uppercase border rounded transition-colors ${
                stayAvailable
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200'
              }`}
            >
              STAY: YES
            </button>
            <button
              type="button"
              onClick={() => setStayAvailable(false)}
              className={`px-3 py-1 text-[10px] font-bold uppercase border rounded transition-colors ${
                !stayAvailable
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200'
              }`}
            >
              STAY: NO
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full text-[10px] font-bold tracking-widest uppercase py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 rounded shadow-sm"
      >
        {isPending ? 'CREATING SESSION...' : 'CREATE SESSION / EVENT ✓'}
      </button>
    </form>
  );
}
