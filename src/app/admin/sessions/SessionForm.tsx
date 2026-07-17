'use client';

import React, { useState, useTransition } from 'react';
import { createSessionAction } from '../actions';

export default function SessionForm() {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 11:30 AM');
  const [instructor, setInstructor] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim() || !description.trim() || !date || !time.trim() || !instructor.trim()) {
      setError('Please fill out all session details.');
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
      });

      if (res.success) {
        setSuccess(true);
        setTitle('');
        setDescription('');
        setDate('');
        setInstructor('');
        setMaxParticipants(50);
      } else {
        setError(res.error || 'Failed to create session');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 bg-white p-6 space-y-4">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
        Schedule New Session
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-neutral-900 border border-neutral-900 text-white text-xs font-mono text-center">
          Session scheduled successfully!
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Session Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
            placeholder="e.g. Nadi Cleansing Session"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            rows={3}
            className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
            placeholder="Describe the topics covered, techniques practiced..."
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
              Time Range
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
              placeholder="e.g. 10:00 AM - 11:30 AM"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Instructor / Doctor
            </label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              disabled={isPending}
              className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
              placeholder="e.g. Dr. Ramesh Sharma"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Max Participants
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
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full text-[10px] font-bold tracking-widest uppercase py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
      >
        {isPending ? 'SCHEDULING...' : 'SCHEDULE SESSION ✓'}
      </button>
    </form>
  );
}
