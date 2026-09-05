/** @type {import('tailwindcss').Config} */
// Tokens como variables CSS (src/styles/global.css) para soportar tema claro/oscuro
// sin duplicar clases. Paleta propia de GUNDAMMX, sin colores de marca de
// terceros: brand grafito #1C1D1F · accent señal #B24212 · signal ámbar
// #926810 · verify verde #22543D · ink #1C1D1F. Ver "05 - RIESGO DE MARCA".
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    container: false,
    extend: {
      colors: {
        paper: v('paper'),
        surface: v('surface'),
        line: v('line'),
        ink: v('ink'),
        'ink-2': v('ink-2'),
        'ink-3': v('ink-3'),
        brand: v('brand'),
        accent: v('accent'),
        signal: v('signal'),
        'signal-ink': v('signal-ink'),
        verify: v('verify'),
        alert: v('alert'),
        white: '#FFFFFF',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Escala editorial: pasos claros, sin tamaños intermedios
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.55' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.55' }],
        xl: ['1.375rem', { lineHeight: '1.3' }],
        '2xl': ['1.75rem', { lineHeight: '1.2' }],
        '3xl': ['2.25rem', { lineHeight: '1.1' }],
        '4xl': ['3rem', { lineHeight: '1.05' }],
        '5xl': ['4rem', { lineHeight: '1' }],
        '6xl': ['5.25rem', { lineHeight: '0.98' }],
      },
      maxWidth: { grid: '80rem', prose: '42rem' },
      spacing: { 18: '4.5rem', 22: '5.5rem', 30: '7.5rem' },
      transitionDuration: { DEFAULT: '160ms' },
    },
  },
  plugins: [],
};
