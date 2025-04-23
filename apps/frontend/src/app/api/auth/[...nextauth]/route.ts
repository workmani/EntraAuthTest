import NextAuth, { type AuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

if (!process.env.AZURE_AD_CLIENT_ID) {
  throw new Error('Missing AZURE_AD_CLIENT_ID environment variable');
}
if (!process.env.AZURE_AD_CLIENT_SECRET) {
  throw new Error('Missing AZURE_AD_CLIENT_SECRET environment variable');
}
if (!process.env.AZURE_AD_TENANT_ID) {
  throw new Error('Missing AZURE_AD_TENANT_ID environment variable');
}
if (!process.env.AUTH_SECRET) {
  // In production, ensure this is a strong, persistent secret
  // You can generate one using `openssl rand -base64 32`
  console.warn(
    'Missing AUTH_SECRET environment variable. Using a default for development.'
  );
  // throw new Error("Missing AUTH_SECRET environment variable"); // Uncomment for production
}

// --- Add Logging ---
console.log('[Auth Route] Checking Environment Variables:');
console.log(`[Auth Route] BACKEND_API_SCOPE: ${process.env.BACKEND_API_SCOPE}`);
// --- End Logging ---

// Define backend API scope
const backendApiScope =
  process.env.BACKEND_API_SCOPE || 'api://YOUR_BACKEND_CLIENT_ID/.default';
const finalScope = `openid profile email ${backendApiScope}`;

// --- Add Logging ---
console.log(`[Auth Route] Final Constructed Scope: ${finalScope}`);
// --- End Logging ---

export const authOptions: AuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      // Explicitly set the issuer for v2.0 endpoint
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: finalScope, // Use the constructed variable
          tenant: process.env.AZURE_AD_TENANT_ID!,
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Explicitly set JWT strategy
  },
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at;
        token.refreshToken = account.refresh_token;
      }
      // TODO: Add token refresh logic if necessary
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      // Do NOT expose sensitive tokens like refreshToken here
      // Add other client-safe properties if needed (e.g., roles from token.roles)
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || 'default-dev-secret',
  // Optional: Add debug flag for development
  // debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
