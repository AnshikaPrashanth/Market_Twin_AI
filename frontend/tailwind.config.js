/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#e1eeff',
          200: '#bcdbff',
          300: '#82baff',
          400: '#4094ff',
          500: '#006fff',
          600: '#0058e6',
          700: '#0042b3',
          800: '#002f80',
          900: '#001b4d',
        },
        dark: {
          50: '#eaebf0',
          100: '#c2c5d6',
          200: '#9ba0bc',
          300: '#737aa2',
          400: '#4c5589',
          500: '#1b2349',
          600: '#171e3f',
          700: '#121935',
          800: '#0e132b',
          900: '#0a0d20',
          950: '#050711',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
