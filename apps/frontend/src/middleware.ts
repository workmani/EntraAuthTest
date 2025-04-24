// apps/frontend/src/middleware.ts
import NextAuth from 'next-auth';
import authConfig from './auth.config';

// Use the authConfig to initialize NextAuth for middleware
// @ts-expect-error - NextAuth types are not fully compatible with the auth config
const { auth } = NextAuth(authConfig);

// Export the middleware function, optionally configuring matcher
// This protects all routes by default, redirecting to login if not authenticated
export default auth;

// Optionally, define which routes the middleware should apply to:
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - images (your static image folder)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
//   ],
// }
