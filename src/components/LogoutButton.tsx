'use client';

import React from 'react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-xs font-semibold px-4 py-2 border border-neutral-200 hover:border-neutral-900 transition-colors cursor-pointer"
    >
      LOGOUT
    </button>
  );
}
