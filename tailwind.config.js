/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vibeCyan: '#22d3ee', // Light Blue / Cyan-400 theme accent
        spotifyDark: '#121212',
        spotifyBlack: '#000000',
        spotifyGray: '#535353',
        spotifyLightGray: '#b3b3b3',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
