/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Alexandria', 'system-ui', 'sans-serif'],
        alexandria: ['Alexandria', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#112239',
          sidebar: '#132540',
          sidebarHover: '#1c3459',
          accent: '#22c55e',
          accentHover: '#16a34a',
        }
      }
    },
  },
  plugins: [],
}
