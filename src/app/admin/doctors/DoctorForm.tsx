'use client';

import React, { useState, useTransition } from 'react';
import { onboardDoctor } from '../actions';

const DAYS_OF_WEEK = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function DoctorForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [error, setError] = useState('');

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !specialty) {
      setError('Please fill in name, email, and specialty.');
      return;
    }

    if (selectedDays.length === 0) {
      setError('Please select at least one availability day.');
      return;
    }

    startTransition(async () => {
      const result = await onboardDoctor(name, email, specialty, selectedDays, gender);
      if (result.success) {
        setName('');
        setEmail('');
        setSpecialty('');
        setGender('Male');
        setSelectedDays([]);
        alert('Doctor onboarded successfully! Default password is: password123');
      } else {
        setError(result.error || 'Failed to onboard doctor.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 p-6 bg-white space-y-6">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
        ONBOARD NEW DOCTOR
      </h3>

      {error && (
        <div className="p-3 bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-mono">
          ERROR: {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white"
            placeholder="Dr. Shreya Rao"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white"
            placeholder="dr.shreya@syhealthcentre.org"
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
              Specialty
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white"
              placeholder="e.g. Nadi Balance"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
              className="w-full border border-neutral-200 p-2 text-xs focus:border-neutral-950 focus:outline-none bg-white h-[34px]"
              disabled={isPending}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
            Availability Days (10:00 AM - 12:30 PM)
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {DAYS_OF_WEEK.map((day) => {
              const selected = selectedDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  disabled={isPending}
                  className={`px-3 py-1.5 border text-xs font-semibold uppercase tracking-wider transition-all ${
                    selected
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          {isPending ? 'ONBOARDING...' : 'REGISTER & ONBOARD DOCTOR'}
        </button>
      </div>
    </form>
  );
}
