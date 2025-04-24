'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Define a type for the weather forecast data (adjust if needed)
type WeatherForecast = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  // Added state for weather data and errors
  const [weatherData, setWeatherData] = useState<WeatherForecast[] | null>(
    null
  );
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCookieDetails, setShowCookieDetails] = useState(false);

  // Modified fetchWeather to call the Next.js API route
  const fetchWeather = async () => {
    setWeatherData(null); // Clear previous data
    setFetchError(null); // Clear previous error

    try {
      // Call the Next.js API route
      const response = await fetch('/api/weather');

      if (!response.ok) {
        // Handle HTTP errors proxied from the API route
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP error! Status: ${response.status}` }));

        // Handle auth errors specifically
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            'Not authorized to access weather data. Please sign in first.'
          );
        }

        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data: WeatherForecast[] = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      if (error instanceof Error) {
        setFetchError(error.message);
      } else {
        setFetchError('An unknown error occurred.');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-6 md:p-24 grid-pattern">
      <div className="z-10 w-full max-w-lg flex flex-col items-center justify-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-6 sm:mb-12 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent py-2">
          Entra ID Auth Test
        </h1>

        <div className="w-full mb-8 sm:mb-12">
          {status === 'loading' ? (
            <div className="w-full p-4 sm:p-6 bg-black/30 border border-gray-700 rounded-lg animate-pulse flex items-center justify-center">
              <div className="h-6 w-24 bg-gray-700 rounded"></div>
            </div>
          ) : status === 'authenticated' && session ? (
            <div className="w-full p-4 sm:p-6 bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg">
              <p className="text-gray-300 mb-1 text-sm sm:text-base">
                Signed in as:
              </p>
              <p className="text-lg sm:text-xl font-medium text-white mb-2">
                {session.user?.name}
              </p>
              <p className="text-gray-300 mb-1 text-sm sm:text-base">Email:</p>
              <p className="text-base sm:text-lg text-white mb-4">
                {session.user?.email}
              </p>

              {/* Session Cookie Display */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Authentication Status:
                  </p>
                  <button
                    onClick={() => setShowCookieDetails(!showCookieDetails)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {showCookieDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                <p className="text-green-400 text-sm mb-1">
                  ✓ Authenticated (Session Active)
                </p>
                {showCookieDetails && (
                  <div className="bg-black/50 p-2 sm:p-3 rounded border border-gray-800 mt-2">
                    <p className="text-xs text-gray-400 mb-1">
                      Session Information:
                    </p>
                    <ul className="list-disc list-inside text-xs text-gray-400 pl-2">
                      <li>User ID: {session.user?.email}</li>
                      <li>Auth Provider: Microsoft Entra ID</li>
                      <li>Auth Type: JWT with HTTP-only Cookie</li>
                      <li>Status: Active</li>
                      <li>
                        Note: Session cookies are HTTP-only and cannot be
                        accessed by JavaScript for security
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8">
                <button
                  onClick={() => signOut()}
                  className="flex-1 min-w-[120px] px-4 py-2 bg-transparent border border-red-500 text-red-500 rounded-md hover:bg-red-500/10 transition-colors text-sm sm:text-base"
                >
                  Sign Out
                </button>
                <button
                  onClick={fetchWeather}
                  className="flex-1 min-w-[120px] px-4 py-2 bg-transparent border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500/10 transition-colors text-sm sm:text-base"
                >
                  Fetch Weather
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full p-4 sm:p-6 bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg">
              <p className="text-lg sm:text-xl text-white mb-4">
                Not signed in
              </p>

              {/* Session Cookie Display for logged out state */}
              <div className="mt-4 mb-4 sm:mb-6 pt-4 border-t border-gray-700">
                <p className="text-gray-300 text-xs sm:text-sm mb-2">
                  Authentication Status:
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  ✗ Not authenticated (No active session)
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  HTTP-only session cookies will be created after signing in
                </p>
              </div>

              <button
                onClick={() => signIn('microsoft-entra-id')}
                className="w-full sm:w-auto px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Sign In with Microsoft
              </button>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                <p className="text-gray-400 mb-3 text-xs sm:text-sm">
                  API Testing
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={fetchWeather}
                    className="w-full sm:w-auto px-4 py-2 bg-transparent border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500/10 transition-colors text-sm sm:text-base"
                  >
                    Test Fetch Weather
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {fetchError && (
          <div className="w-full p-4 sm:p-6 mb-6 sm:mb-8 bg-black/30 backdrop-blur-sm border border-red-900 rounded-lg">
            <p className="text-red-400 font-medium mb-2 text-sm sm:text-base">
              Error fetching weather:
            </p>
            <p className="text-red-300 text-sm">{fetchError}</p>
          </div>
        )}

        {weatherData && (
          <div className="w-full p-4 sm:p-6 bg-black/30 backdrop-blur-sm border border-green-900 rounded-lg">
            <h2 className="text-green-400 font-medium text-base sm:text-lg mb-4">
              Weather Forecast:
            </h2>
            <ul className="space-y-2 sm:space-y-3">
              {weatherData.map((item) => (
                <li
                  key={item.date}
                  className="text-green-300 pb-2 border-b border-green-900/60 text-sm sm:text-base"
                >
                  <span className="font-medium">{item.date}</span>:{' '}
                  {item.temperatureC}°C / {item.temperatureF}°F - {item.summary}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center mt-8 sm:mt-12 mb-4 text-center">
        <p className="text-gray-500 text-xs sm:text-sm">
          Powered by <span className="text-white font-semibold">Next.js</span>{' '}
          and{' '}
          <span className="text-white font-semibold">Microsoft Entra ID</span>
        </p>
      </div>
    </main>
  );
}
