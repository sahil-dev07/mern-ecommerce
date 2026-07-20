import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Separate from vite.config.js so the production build never depends on the test
// toolchain. Vitest auto-prefers this file over vite.config.js.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',   // DOM for React Testing Library
    globals: true,          // describe/test/expect/vi without imports
    setupFiles: './src/setupTests.js',
    css: false,             // don't process Tailwind/PostCSS during tests
  },
})
