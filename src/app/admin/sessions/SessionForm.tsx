'use client';

import React, { useState, useTransition } from 'react';
import { createSessionAction } from '../actions';

export default function SessionForm() {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM - 01:00 PM');
  const [instructor, setInstructor] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(45);
  const [stayAvailable, setStayAvailable] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim() || !description.trim() || !date || !time.trim() || !instructor.trim()) {
      setError('Please fill out all session and doctor details.');
      return;
    }

    startTransition(async () => {
      const res = await createSessionAction({
        title,
        description,
        date,
        time,
        instructor,
        maxParticipants: Number(maxParticipants),
        stayAvailable,
      });

      if (res.success) {
        setSuccess(true);
        setTitle('');
        setDescription('');
        setDate('');
        setInstructor('');
        setMaxParticipants(45);
        setStayAvailable(true);
      } else {
        setError(res.error || 'Failed to create session');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 bg-white p-6 space-y-4">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
        Add Doctor Session / Stay Slot
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-neutral-900 border border-neutral-900 text-white text-xs font-mono text-center">
          Doctor session saved successfully!
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Session / Doctor Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
            placeholder="e.g. Nadi Clearance & Vibratory Health Session"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Description / Treatment Focus
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            rows={3}
            className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
            placeholder="Describe the consultation, chakra treatment notes, or admission guidelines..."
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Time Slot
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
              placeholder="e.g. 09:00 AM - 01:00 PM"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Doctor / Instructor Name
            </label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
              placeholder="e.g. Dr. Ramesh Verma"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Doctor Max Seats Limit
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              disabled={isPending}
              className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
              min={1}
              required
            />
          </div>
        </div>

        {/* Stay Option (Yes / No) */}
        <div className="p-3 bg-neutral-50 border border-neutral-200 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-neutral-700 font-semibold">
              Overnight Stay Accommodation Option
            </span>
            <span className="text-[10px] text-neutral-400">
              Allow patients to book overnight stay accommodation for this doctor session?
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setStayAvailable(true)}
              className={`px-3 py-1 text-[10px] font-bold uppercase border transition-colors ${
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
              className={`px-3 py-1 text-[10px] font-bold uppercase border transition-colors ${
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
        className="w-full text-[10px] font-bold tracking-widest uppercase py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
      >
        {isPending ? 'SCHEDULING SESSION...' : 'CREATE DOCTOR SESSION ✓'}
      </button>
    </form>
  );
}
