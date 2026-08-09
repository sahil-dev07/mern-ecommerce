import forms from '@tailwindcss/forms'
import aspectRatio from '@tailwindcss/aspect-ratio'

/** @type {import('tailwindcss').Config} */
// ESM form required: "type":"module" in package.json makes .js files ESM,
// so the old CJS module.exports/require() would crash the build.
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateRows: {
        '[auto,auto,1fr]': 'auto auto 1fr',
      },
      // --- Kartly design tokens ---------------------------------------------
      // Defining them changes nothing on its own: Tailwind only emits a class
      // when it appears in `content`, and no brand-* class is used yet. The
      // indigo -> brand swap is a separate commit so the two can be reverted
      // independently.
      colors: {
        // Emerald ramp. 600 is the primary action colour, 900 the darkest
        // surface (also the browser theme-color).
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        // Amber, for discount badges and highlights only — never for a primary
        // action, so the two never compete.
        accent: {
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      // Tailwind's preflight applies this to <html>, so it is the single source of
      // truth for the app's typeface — no font-family declaration in index.css.
      // "Variable" is part of the family name the @fontsource-variable package
      // registers; the non-variable package would be plain "Plus Jakarta Sans".
      // The fallbacks are the previous stack, so a failed font load degrades to
      // exactly what the app looked like before.
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans Variable"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      // Named rather than a raw rounded-xl so the card radius can move in one
      // place once the storefront card is redesigned (Phase 6).
      borderRadius: {
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [aspectRatio, forms],
}
