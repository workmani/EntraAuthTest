'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })} // Redirect to home after sign out
      className="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
    >
      Sign out
    </button>
  );
}
