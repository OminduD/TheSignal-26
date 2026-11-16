/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        archivo: ['"Archivo Black"', 'sans-serif'],
        arimo: ['Arimo', 'sans-serif'],
        quantico: ['Quantico', 'sans-serif'],
        iceberg: ['Iceberg', 'cursive', 'sans-serif'],
        geo: ['Geo', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        abyss: {
          950: '#010204',
          900: '#020612',
          800: '#062347',
          700: '#0A89AD',
        },
        cyan: {
          accent: '#06B6D4',
          bright: '#22D3EE',
          glow: '#67E8F9',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
};
