/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Base path for app source
    // Add shared package paths here ONLY if they don't have their own build
  ],
  theme: {
    extend: {
      colors: {
        background: '#000',
        foreground: '#fff',
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b',
        'gray-dark': '#1f2937',
        'gray-light': '#d1d5db',
      },
    },
  },
  plugins: [], // No plugins initially
};
