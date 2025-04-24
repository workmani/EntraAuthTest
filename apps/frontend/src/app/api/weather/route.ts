import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  // Use getToken to get the raw JWT payload directly from the request/cookie
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  console.log('API Route token from getToken:', JSON.stringify(token, null, 2)); // Log the raw token

  // Access accessToken directly from the token payload (as defined in JWT interface)
  const accessToken = token?.accessToken as string | undefined; // Access token from JWT
  console.log(
    'API Route extracted accessToken (from getToken):',
    accessToken ? accessToken.substring(0, 10) + '...' : 'null/undefined'
  ); // Log extracted token

  // Check if the token exists and contains the accessToken
  if (!token || !accessToken) {
    return NextResponse.json(
      {
        message: 'Not authenticated or token/accessToken missing via getToken',
      },
      { status: 401 }
    );
  }

  const backendApiUrl = process.env.API_BASE_URL; // Your C# backend URL from .env
  if (!backendApiUrl) {
    console.error('API_BASE_URL environment variable is not set.');
    return NextResponse.json(
      { message: 'API endpoint configuration error' },
      { status: 500 }
    );
  }

  try {
    console.log(
      `Proxying GET /weatherforecast to ${backendApiUrl} with token.`
    );
    const response = await fetch(`${backendApiUrl}/weatherforecast`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Add other necessary headers if required by your backend
      },
      cache: 'no-store', // Ensure fresh data is fetched
    });

    if (!response.ok) {
      // Forward the status code and potentially the error message from the backend
      const errorBody = await response.text(); // Read error body as text first
      console.error(
        `Backend API error: ${response.status} ${response.statusText}`,
        errorBody
      );
      return NextResponse.json(
        {
          message: `Error from backend: ${response.statusText}`,
          details: errorBody,
        },
        { status: response.status }
      );
    }

    // If response is OK, parse and return the JSON data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data in API proxy route:', error);
    return NextResponse.json(
      { message: 'Internal Server Error in proxy route' },
      { status: 500 }
    );
  }
}
