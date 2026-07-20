import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for the ecommerce SPA.
// - base '/' so asset URLs are root-relative (matches Netlify + Render static serving)
// - outDir 'build' keeps CRA's output dir (already gitignored; Netlify publish dir set in Phase F)
// - sourcemap for prod debugging; server.open auto-launches the browser on `npm run dev`
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  base: '/',
})
