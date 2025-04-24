'use client';

import { useSession } from 'next-auth/react';

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated' || !session?.user) {
    return <p>Not signed in.</p>;
  }

  return (
    <div className="mt-4 rounded border p-4">
      <h2 className="mb-2 text-xl font-semibold">User Profile</h2>
      {/* Optional: Display user image if available 
      {session.user.image && (
        <img 
          src={session.user.image} 
          alt="User Avatar" 
          width={50} 
          height={50} 
          className="mb-2 rounded-full"
        />
      )}
      */}
      <p>
        <strong>Name:</strong> {session.user.name ?? 'N/A'}
      </p>
      <p>
        <strong>Email:</strong> {session.user.email ?? 'N/A'}
      </p>
      {/* Display custom session properties if needed */}
      {/* 
      <p>
        <strong>Access Token:</strong> {session.accessToken ? 'Present' : 'Missing'}
      </p>
      */}
    </div>
  );
}
