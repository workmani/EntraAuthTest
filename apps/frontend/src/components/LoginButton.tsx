'use client';

import { signIn } from 'next-auth/react';

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn('microsoft-entra-id')} // Specify the provider ID
      className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
    >
      Sign in with Microsoft
    </button>
  );
}
