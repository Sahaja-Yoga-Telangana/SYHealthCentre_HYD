'use client';

import React, { useState, useTransition } from 'react';
import { addRoom } from '../actions';
import { ROOM_CAPACITY_OPTIONS, type RoomCategory } from '@/lib/healthCentre';

export default function RoomForm() {
  const [isPending, startTransition] = useTransition();
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState<RoomCategory>('Double');
  const [totalBeds, setTotalBeds] = useState(2);
  const [error, setError] = useState('');

  const handleCategoryChange = (val: RoomCategory) => {
    const cat = val;
    setCategory(cat);
    setTotalBeds(ROOM_CAPACITY_OPTIONS[cat][ROOM_CAPACITY_OPTIONS[cat].length - 1]);
  };

  const capacityOptions = ROOM_CAPACITY_OPTIONS[category];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomNumber) {
      setError('Please provide a room number.');
      return;
    }

    if (totalBeds <= 0) {
      setError('Total beds must be greater than zero.');
      return;
    }

    startTransition(async () => {
      const result = await addRoom(roomNumber, category, totalBeds);
      if (result.success) {
        setRoomNumber('');
        setError('');
        alert('Room and associated beds created successfully!');
      } else {
        setError(result.error || 'Failed to create room.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 p-6 bg-white space-y-6">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
        ADD NEW ROOM / DORMITORY
      </h3>

      {error && (
        <div className="p-3 bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-mono">
          ERROR: {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
            Room / Dorm Number
          </label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white"
            placeholder="e.g. 104, Dorm-East, etc."
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as RoomCategory)}
            className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
            disabled={isPending}
          >
            <option value="Double">Double Room (1-2 adults)</option>
            <option value="Family">Family Room (up to 4 adults)</option>
            <option value="Ladies Dormitory">Ladies Dormitory (max 36 beds)</option>
            <option value="Men's Dormitory">Men's Dormitory (max 25 beds)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
            Total Bed Capacity
          </label>
          <select
            value={totalBeds}
            onChange={(e) => setTotalBeds(parseInt(e.target.value, 10))}
            className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
            disabled={isPending}
          >
            {capacityOptions.map((capacity) => (
              <option key={capacity} value={capacity}>
                {capacity} {capacity === 1 ? 'bed' : 'beds'}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[10px] text-neutral-400">
            Double rooms support 1 or 2 adults, family rooms support up to 4, and dormitories stay fixed at their full bed counts.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          {isPending ? 'CREATING...' : 'CREATE ROOM & BEDS'}
        </button>
      </div>
    </form>
  );
}
