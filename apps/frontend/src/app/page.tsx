'use client';

import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

// Define a type for the weather forecast data (adjust if needed)
type WeatherForecast = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [weatherData, setWeatherData] = useState<WeatherForecast[] | null>(
    null
  );
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setWeatherData(null); // Clear previous data
    setFetchError(null); // Clear previous error

    if (!session || !session.accessToken) {
      setFetchError('Not authenticated or access token missing.');
      console.error('Session or Access Token missing:', session);
      return;
    }

    console.log('Access Token:', session.accessToken);

    try {
      // Replace with your actual backend API URL (e.g., from env var)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5229';
      const response = await fetch(`${apiUrl}/weatherforecast`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        // Handle HTTP errors (e.g., 401 Unauthorized, 403 Forbidden)
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`
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
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="mb-4 flex flex-col items-center sm:items-start gap-2">
          {status === 'loading' && <p>Loading...</p>}
          {status === 'authenticated' && session?.user && (
            <>
              <p className="text-sm">
                Welcome, {session.user.name || session.user.email || 'User'}!
              </p>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 font-semibold text-sm bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600"
              >
                Sign Out
              </button>
              <button
                onClick={fetchWeather}
                className="mt-2 px-4 py-2 font-semibold text-sm bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600"
              >
                Fetch Weather (Protected)
              </button>
            </>
          )}
          {status === 'unauthenticated' && (
            <button
              onClick={() => signIn('azure-ad')}
              className="px-4 py-2 font-semibold text-sm bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600"
            >
              Sign In with Azure AD
            </button>
          )}
        </div>
        {fetchError && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>Error fetching weather: {fetchError}</p>
          </div>
        )}
        {weatherData && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h2 className="font-semibold mb-2">Weather Forecast:</h2>
            <ul>
              {weatherData.map((item) => (
                <li key={item.date}>
                  {item.date}: {item.temperatureC}°C / {item.temperatureF}°F -{' '}
                  {item.summary}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{' '}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
