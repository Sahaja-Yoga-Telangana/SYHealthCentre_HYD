'use client';

import { useTransition } from 'react';
import { seedDatabase } from './actions';

export default function SeedButton() {
  const [isPending, startTransition] = useTransition();

  const handleSeed = () => {
    startTransition(async () => {
      const result = await seedDatabase();
      if (result.success) {
        alert('Database seeded successfully! Page will refresh.');
      } else {
        alert('Failed to seed: ' + result.error);
      }
    });
  };

  return (
    <button
      onClick={handleSeed}
      disabled={isPending}
      className="px-4 py-2 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-50 font-semibold text-xs tracking-wider uppercase transition-all"
    >
      {isPending ? 'SEEDING...' : 'SEED SAMPLE DATABASE'}
    </button>
  );
}
