import { handlers } from '@/auth'; // Use path alias or adjust relative path: ../../../auth

// Export the GET and POST handlers from the core NextAuth configuration
export const { GET, POST } = handlers;

// You can also export specific handlers individually if needed:
// export const GET = handlers.GET;
// export const POST = handlers.POST;
