import type { Account, Profile, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

// Types are extended in apps/ui/types/next-auth.d.ts

// --- Environment Variable Retrieval ---
// Retrieve necessary credentials and configuration from environment variables.
// Ensure these are set in your .env file for local development and in your deployment environment.
const entraClientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
const entraClientSecret = process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
const entraTenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID;
const backendClientId = process.env.AUTH_MICROSOFT_ENTRA_ID_BACKEND_CLIENT_ID;
const authSecret = process.env.AUTH_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'; // Default for local dev

// --- Environment Variable Validation (Optional but Recommended) ---
// Basic checks to ensure critical variables are present during startup.
if (!entraClientId) console.error('Missing AUTH_MICROSOFT_ENTRA_ID_ID');
if (!entraClientSecret) console.error('Missing AUTH_MICROSOFT_ENTRA_ID_SECRET');
if (!entraTenantId) console.error('Missing AUTH_MICROSOFT_ENTRA_ID_TENANT_ID');
if (!backendClientId)
  console.error('Missing AUTH_MICROSOFT_ENTRA_ID_BACKEND_CLIENT_ID');
if (!authSecret) console.error('Missing AUTH_SECRET');

// --- Scope Configuration ---
// Define the OAuth scopes required for authentication and API access.
// 'openid', 'profile', 'email' are standard OIDC scopes.
// The 'api://...' scope requests an access token for your custom backend API,
// registered in Microsoft Entra ID. The Client ID of the *backend* application
// registration is used here.
const backendApiScope = `api://${backendClientId}/API.Read`; // Adjust '/API.Read' if your scope has a different name

// --- NextAuth Configuration (authConfig) ---
const authConfig = {
  providers: [
    MicrosoftEntraID({
      // Frontend application's Client ID from Entra ID app registration
      clientId: entraClientId!,
      // Frontend application's Client Secret
      clientSecret: entraClientSecret!,
      // The specific Entra ID tenant and version endpoint
      issuer: `https://login.microsoftonline.com/${entraTenantId}/v2.0`,
      // Configure authorization parameters
      authorization: {
        params: {
          // Request the necessary scopes
          scope: `openid profile email ${backendApiScope}`,
          // Specify the tenant ID again for clarity/correctness
          tenant: entraTenantId!,
        },
      },
    }),
    // Add other providers here if needed (e.g., Google, GitHub)
  ],
  // --- URL Configuration ---
  // Ensure NextAuth uses the correct base URL, especially important behind proxies or in containers.
  // Uses NEXTAUTH_URL environment variable or defaults to localhost:3000.
  urls: {
    baseUrl: nextAuthUrl,
  },
  // --- Session Secret ---
  // A secret used to encrypt the session JWT. MUST be set in the environment.
  secret: authSecret,
  // --- Session Strategy ---
  session: {
    // Use JSON Web Tokens (JWT) for session management.
    // This is crucial for the Backend-for-Frontend (BFF) pattern, where the Next.js
    // server acts as a secure intermediary between the client and backend APIs.
    // The JWT stored in the session cookie contains the necessary tokens (like the backend access token)
    // that the Next.js server can use, without exposing them directly to the browser.
    strategy: 'jwt',
  },
  // --- Callbacks ---
  // Callbacks allow customizing the authentication flow and session data.
  callbacks: {
    /**
     * jwt Callback: Executed when a JWT is created or updated.
     *
     * Purpose: To embed necessary information into the JWT *before* it's encrypted
     *          and stored in the session cookie. This is the *only* place the
     *          Next.js server-side has access to the raw tokens from the provider
     *          during the session lifecycle (after initial sign-in).
     *
     * Use Case (BFF): Persist the `accessToken` obtained from Entra ID (which is scoped
     *                 for your backend API) into the JWT. This allows server-side
     *                 components or API routes within Next.js to extract this token
     *                 later and securely call the backend API on behalf of the user.
     *                 Also persist user roles or other critical server-side info.
     *
     * @param token The JWT object being built.
     * @param account Contains provider details like access_token, expires_at upon initial sign-in.
     * @param profile Contains user profile information from the provider upon initial sign-in.
     * @returns The modified token object to be encrypted and stored.
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
      // Check if this is the initial sign-in flow by seeing if `account` exists.
      if (account && profile) {
        // Persist the backend API access token in the JWT.
        token.accessToken = account.access_token;
        // Persist the token's expiry time (UTC seconds). Useful for refresh logic.
        token.expiresAt = account.expires_at;
        // Persist the refresh token if available and needed for session extension.
        token.refreshToken = account.refresh_token;
        // Persist user roles obtained from the Entra ID token claims (if configured).
        token.roles = profile.roles || []; // Ensure roles are always an array. Adjust 'profile.roles' based on your token claims.

        // Note: Implement token refresh logic here if needed.
        // Check if `token.accessToken` is expired using `token.expiresAt` and
        // use `token.refreshToken` to get a new `accessToken` from Entra ID.
        // Update token.accessToken and token.expiresAt accordingly.
        // If refresh fails, set an error flag: `token.error = "RefreshAccessTokenError"`
      }

      // Return the potentially modified token.
      // This object is encrypted and stored in the session cookie, accessible *only* server-side.
      return token;
    },

    /**
     * session Callback: Executed when a session is accessed client-side (e.g., `useSession`, `auth()`).
     *
     * Purpose: To control what data is exposed from the server-side JWT (managed by the `jwt` callback)
     *          to the client-side session object. This acts as a security boundary.
     *
     * Use Case (BFF): Expose only *client-safe* data. User details like name, email, and roles are
     *                 typically safe. **Crucially, DO NOT expose sensitive tokens like `accessToken`
     *                 or `refreshToken` here.** These should remain server-side only.
     *
     * @param session The client-side session object being built.
     * @param token The decrypted JWT payload from the `jwt` callback.
     * @returns The modified session object available to the client.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      // Transfer necessary user details from the JWT (token) to the client session.
      if (session.user) {
        // Make roles available to the client for UI adjustments or basic checks.
        session.user.roles = token.roles || [];
        // Add other safe user properties if needed.
        // session.user.id = token.sub; // Example: Exposing user ID (subject)
      }

      // Pass potential errors (e.g., from token refresh failure) to the client.
      session.error = token.error;

      // Explicitly AVOID exposing the backend access token to the client.
      // session.accessToken = token.accessToken; // <= DON'T DO THIS

      // Return the sanitized session object for client-side use.
      return session;
    },
  },
  // --- Debugging ---
  // Enable detailed NextAuth logs during development for easier troubleshooting.
  // Automatically disabled in production builds.
  debug: process.env.NODE_ENV === 'development',
};

export default authConfig;
