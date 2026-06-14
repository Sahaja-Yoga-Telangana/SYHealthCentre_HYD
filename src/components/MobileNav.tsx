'use client';

import { useState } from 'react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 border border-neutral-200 hover:border-neutral-900 transition-colors"
        aria-label="Toggle navigation menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-neutral-900"
        >
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 px-8 py-6 space-y-4 z-50">
          <a href="#about" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">About</a>
          <a href="#tariffs" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Tariffs</a>
          <a href="#subtle-system" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Subtle System</a>
          <a href="#contact" onClick={() => setOpen(false)} className="block text-sm font-medium tracking-wide hover:text-neutral-500 transition-colors">Contact</a>
        </nav>
      )}
    </div>
  );
}
