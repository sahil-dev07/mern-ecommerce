import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// PostCSS pipeline for Tailwind v3. REQUIRED — without this, Tailwind directives
// in index.css never compile and every utility class silently no-ops (unstyled page).
// tailwindcss reads tailwind.config.js; autoprefixer adds vendor prefixes per browserslist.
export default {
  plugins: [tailwindcss, autoprefixer],
}
