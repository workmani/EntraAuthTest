import NextAuth from 'next-auth';
import authConfig from './auth.config';

// @ts-expect-error - NextAuth types are not fully compatible with the auth config
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// handlers: Contains { GET, POST } for the auth API route (if needed, often automatic in App Router)
// auth: The core helper function to get session data in Server Components, API Routes, Server Actions. Replaces getServerSession.
// signIn: Function to trigger sign-in.
// signOut: Function to trigger sign-out.
