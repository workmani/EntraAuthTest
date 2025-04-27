// apps/frontend/src/middleware.ts
import NextAuth from 'next-auth';
import authConfig from './auth.config';

// Initialize NextAuth using the shared authConfig.
// This provides the `auth` middleware helper function.
// See auth.ts for explanation of @ts-expect-error.
// @ts-expect-error - NextAuth types are not fully compatible with the inferred auth config type
const { auth } = NextAuth(authConfig);

// Export the `auth` function directly as the middleware.
// By default, this protects ALL routes in your application.
// If a user is not authenticated, they will be redirected to the
// configured sign-in page (usually /api/auth/signin by default,
// which then redirects to the provider's login page).
export default auth;

// --- Optional Route Matching Configuration ---
// If you want to protect only specific routes, or exclude certain routes
// (like public landing pages, API routes for webhooks, static assets),
// you can export a `config` object with a `matcher` property.

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes - typically handle their own auth or are public)
//      * - _next/static (Next.js static files)
//      * - _next/image (Next.js image optimization files)
//      * - favicon.ico (favicon file)
//      * - images (assuming a public /images folder)
//      * - /public (explicitly exclude anything in /public)
//      * - / (allow access to the root path, e.g., landing page)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico|images|public|^/$).*)',
//     // Example: Protect only specific sections
//     // '/dashboard/:path*',
//     // '/profile',
//   ],
// }
