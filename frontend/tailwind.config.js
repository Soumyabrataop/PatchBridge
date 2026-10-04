/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        graphite: {
          50: '#f6f6f7',
          100: '#e1e1e4',
          200: '#c5c5cb',
          300: '#a3a3ac',
          400: '#7e8084', // Silver dust / graphite haze
          500: '#5c5e63',
          600: '#3f4146',
          700: '#2a2b2f',
          800: '#1a1a1e', // Surface cards
          850: '#141417',
          900: '#0d0d0e', // Slate abyss canvas
          950: '#070708', // Deep shadow
        },
        chalk: '#f5f5f7',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
