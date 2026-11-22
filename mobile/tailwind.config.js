/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF5722',
          light: '#FF8A5B',
          dark: '#E64A19',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#1E293B',
          light: '#334155',
          dark: '#0F172A',
          foreground: '#F8FAFC',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          elevated: '#FFFFFF',
        },
        diet: {
          veg: '#22C55E',
          nonveg: '#EF4444',
          vegan: '#3B82F6',
          gf: '#F59E0B',
        },
        status: {
          pending: '#F59E0B',
          confirmed: '#3B82F6',
          preparing: '#8B5CF6',
          ready: '#22C55E',
          completed: '#64748B',
          cancelled: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
}