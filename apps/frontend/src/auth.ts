import NextAuth from 'next-auth';
import authConfig from './auth.config';

// The NextAuth function initializes authentication handlers and helper methods based on your configuration.
// It might show a TypeScript error because the complex discriminated union types used by NextAuth
// don't always perfectly align with the simpler config object structure, especially with custom providers/callbacks.
// Using `@ts-expect-error` here acknowledges this known type mismatch while ensuring the code works correctly.
// @ts-expect-error - NextAuth types are not fully compatible with the inferred auth config type
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// handlers: Contains { GET, POST } route handlers. NextAuth automatically creates API endpoints
//           (e.g., /api/auth/signin, /api/auth/callback/microsoft-entra-id) using these.
//           You generally don't need to manually create these routes in the App Router.
// auth:     The primary server-side helper to get the current session (user, roles, etc.).
//           Use this in Server Components, API Routes, and Server Actions.
// signIn:   A server-side or client-side function to initiate the sign-in flow.
// signOut:  A server-side or client-side function to initiate the sign-out flow.
