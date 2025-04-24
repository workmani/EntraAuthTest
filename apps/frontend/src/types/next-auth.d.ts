import 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string; // ADDING BACK: For server-side access via auth()
    idToken?: string; // Optionally add idToken if you need it
    error?: string; // To handle custom errors like RefreshAccessTokenError
    user?: {
      id?: string | null; // Ensure ID is optional based on your provider
    } & DefaultSession['user']; // Keep existing user fields
  }

  /** The OAuth profile returned from your provider */
  // interface Profile { // Comment out or remove original empty interface
  //   // Add any provider-specific properties if needed
  //   // oid?: string;
  // }
  type Profile = Record<string, unknown>; // Use type alias instead of empty interface

  // interface Account {}
  // interface User {}
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string; // To handle custom errors like RefreshAccessTokenError
    user?: Session['user']; // Embed user info in the JWT
  }
}
