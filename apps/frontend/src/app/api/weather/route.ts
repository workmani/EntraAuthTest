import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Server-side API Route (Route Handler) to proxy requests to the backend API.
 * This demonstrates the Backend-for-Frontend (BFF) pattern.
 * The Next.js frontend calls this route, which then securely calls the actual backend API.
 *
 * Why use a proxy?
 * 1. Security: The frontend browser never directly handles the backend `accessToken`.
 * 2. Abstraction: Hides backend details from the frontend.
 * 3. Simplification: Can consolidate multiple backend calls or transform data.
 */
export async function GET(req: NextRequest) {
  // --- Authentication & Token Retrieval ---
  // Use `getToken` from 'next-auth/jwt' to directly access the decrypted JWT payload
  // stored in the session cookie. This is necessary because the standard `auth()` helper
  // returns the *session* object (from the `session` callback in auth.config.ts),
  // which deliberately omits the sensitive `accessToken`.
  // We need the raw `accessToken` here to authenticate with the backend API.
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Extract the accessToken from the JWT payload (defined in the JWT interface and populated
  // in the `jwt` callback in auth.config.ts).
  const accessToken = token?.accessToken as string | undefined;

  // --- Authorization Check ---
  // Ensure the user is authenticated and the necessary token is present.
  if (!token || !accessToken) {
    return NextResponse.json(
      {
        message:
          'Unauthorized: Missing authentication token or backend access token.',
      },
      { status: 401 }
    );
  }

  // --- Backend API Call Configuration ---
  const backendApiUrl = process.env.API_BASE_URL; // Get the backend URL from environment variables
  if (!backendApiUrl) {
    console.error('API_BASE_URL environment variable is not set.'); // Keep critical config errors
    return NextResponse.json(
      { message: 'API endpoint configuration error' },
      { status: 500 }
    );
  }

  // --- Proxying the Request to the Backend ---
  try {
    // Use the extracted `accessToken` to make an authenticated call to the backend API.
    const response = await fetch(`${backendApiUrl}/weatherforecast`, {
      headers: {
        // Pass the access token in the standard 'Authorization: Bearer <token>' header.
        // The backend API should be configured to validate this token.
        Authorization: `Bearer ${accessToken}`,
        // Add other headers if your backend requires them (e.g., Content-Type for POST/PUT).
      },
      // Disable caching for this proxy request to ensure fresh data from the backend.
      // Adjust caching strategy based on your application's needs.
      cache: 'no-store',
    });

    // --- Handling Backend Response ---
    if (!response.ok) {
      // If the backend returned an error, forward the status code and message.
      const errorBody = await response.text(); // Get potential error details
      console.error(
        // Log backend errors server-side for debugging
        `Backend API error: ${response.status} ${response.statusText}`,
        errorBody
      );
      return NextResponse.json(
        {
          message: `Error from backend API: ${response.statusText}`,
          details: errorBody, // Optionally include backend error details
        },
        { status: response.status } // Forward the backend status code
      );
    }

    // If the backend response is successful, parse the JSON data.
    const data = await response.json();

    // Return the successful backend data to the frontend client.
    return NextResponse.json(data);
  } catch (error) {
    // --- General Error Handling ---
    console.error('Error in API proxy route:', error); // Log unexpected errors
    return NextResponse.json(
      { message: 'Internal Server Error while contacting backend API' },
      { status: 500 }
    );
  }
}
