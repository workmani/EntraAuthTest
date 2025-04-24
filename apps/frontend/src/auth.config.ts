import type { Account, Profile, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

// Types are extended in apps/ui/types/next-auth.d.ts

// --- Environment Variable Check for debugging ---
console.log('--- Environment Variable Check (auth.config.ts) ---');
console.log(
  'AUTH_MICROSOFT_ENTRA_ID_ID:',
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID
);
console.log(
  'AUTH_MICROSOFT_ENTRA_ID_SECRET:',
  process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET ? '[Exists]' : '[Missing]'
);
console.log(
  'AUTH_MICROSOFT_ENTRA_ID_TENANT_ID:',
  process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID
);
console.log(
  'AUTH_MICROSOFT_ENTRA_ID_BACKEND_CLIENT_ID:',
  process.env.AUTH_MICROSOFT_ENTRA_ID_BACKEND_CLIENT_ID
);
console.log('AUTH_SECRET:', process.env.AUTH_SECRET ? '[Exists]' : '[Missing]');
console.log('API_BASE_URL:', process.env.API_BASE_URL);
console.log('--- End Environment Variable Check ---');

const backendClientId = process.env.AUTH_MICROSOFT_ENTRA_ID_BACKEND_CLIENT_ID;
if (!backendClientId) {
  console.error(
    'AUTH_MICROSOFT_ENTRA_ID_BACKEND_CLIENT_ID is not set. Cannot construct correct API scope.'
  );
}
// Construct the scope using the BACKEND Client ID
const backendApiScope = `api://${backendClientId}/API.Read`; // Or adjust scope name as needed

const authConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: `openid profile email ${backendApiScope}`,
          tenant: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID!,
        },
      },
    }),
  ],
  // Fix the URL/port issue - specify the correct URL for authentication
  urls: {
    baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  secret: process.env.AUTH_SECRET,
  session: {
    // Use JWT strategy for sessions, required for BFF pattern where the Next.js
    // backend manages the session token containing backend API access details.
    strategy: 'jwt',
  },
  callbacks: {
    /**
     * Called whenever a JWT is created (initial sign-in) or updated (session accessed).
     * The returned object is encrypted and stored in the session cookie.
     * We use this to persist the `accessToken` received from Entra ID
     * so our server-side API proxy can use it to call the backend.
     * We also persist roles for authorization checks.
     */
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account: Account | null;
      profile?: Profile | null;
    }) {
      console.log('--- JWT Callback Start ---');

      // On initial sign-in, account and profile are available.
      if (account && profile) {
        console.log('JWT: Processing initial sign-in');
        // Persist the access token, expiry, and refresh token (if available) in the JWT
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at; // Unix timestamp (seconds)
        token.refreshToken = account.refresh_token;

        // Persist roles from the profile into the JWT
        token.roles = profile.roles || [];

        // TODO: Consider adding logic here to handle access token expiry/refresh using the refreshToken
      }

      console.log('--- JWT Callback End ---');
      // Log the final token object being returned/saved
      console.log('JWT Callback: Final token state being returned:', token);
      return token; // This object is encrypted in the session cookie
    },

    /**
     * Called whenever the session is accessed (e.g., `useSession`, `auth()` client-side).
     * The `token` parameter is the decrypted JWT from the `jwt` callback.
     * We use this to expose ONLY CLIENT-SAFE data to the frontend.
     * IMPORTANT: Do NOT expose sensitive tokens like `accessToken` here.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('--- Session Callback Start ---');

      // Pass necessary user details (like roles) to the client-side session object
      if (session.user) {
        session.user.roles = token.roles || []; // Get roles from the JWT
      }

      // Do NOT expose the backend access token to the client-side session
      // session.accessToken = token.accessToken;
      session.error = token.error; // Pass potential errors (e.g., from refresh)

      console.log('--- Session Callback End ---');
      return session; // This object is returned to the client
    },
  },
  // Enable debug logs in development for easier troubleshooting
  debug: process.env.NODE_ENV === 'development',
};

export default authConfig;
