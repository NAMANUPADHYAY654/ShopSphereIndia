/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          900: '#0f172a',
        },
        accent: {
          500: '#0f766e',
          600: '#115e59',
        },
        dark: {
          bg: '#09090b',
          card: '#18181b',
          text: '#f8fafc',
          border: '#27272a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  darkMode: 'class', // Enable dark mode via class
  plugins: [],
}
