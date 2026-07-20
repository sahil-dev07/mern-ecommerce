import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

// Flat ESLint config for the Vite + React 18 frontend (JS/JSX, no TypeScript).
// Replaces CRA's bundled `react-app` preset, which was dropped with react-scripts.
export default [
  // Never lint build output, deps, or coverage.
  { ignores: ['build/**', 'node_modules/**', 'coverage/**'] },

  // Application source — runs in the browser.
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      // Vite uses the automatic JSX runtime, so React need not be in scope.
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // This codebase doesn't use prop-types — silence the noise.
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Enforce the console.log cleanup going forward; allow deliberate warn/error.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Unused vars are warnings (legacy tech debt); allow _-prefixed args + PascalCase/CONSTs.
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },

  // Node-land ESM config files (Vite/PostCSS/Tailwind/ESLint configs run under Node).
  {
    files: ['*.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: { ...js.configs.recommended.rules },
  },

  // Must be last: turns off stylistic rules that would fight Prettier.
  prettier,
]
