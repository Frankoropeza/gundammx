/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta propia. NO es el esquema RX-78-2: ver vault 03 - SISTEMA DE DISENO.
        base: {
          bg: '#0B0E11',
          surface: '#141920',
          alt: '#1C232C',
          line: '#2A323D',
        },
        ink: {
          DEFAULT: '#E6EBF0',
          muted: '#93A1B0',
          faint: '#5E6C7A',
        },
        accent: {
          DEFAULT: '#35D6A4',
          dark: '#17A67C',
        },
        signal: '#F0A93B',
        alert: '#E2564D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Chakra Petch"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { content: '72rem' },
    },
  },
  plugins: [],
};
