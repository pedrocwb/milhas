/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0d9488',
          light: '#14b8a6',
          dark: '#0f766e',
        },
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
        },
        surface: {
          DEFAULT: '#f8fafc',
          light: '#ffffff',
          lighter: '#f1f5f9',
        },
        azul: '#0066cc',
        latam: '#e31837',
        smiles: '#ff6600',
        livelo: '#6b21a8',
      },
    },
  },
  plugins: [],
}
