const js = require('@eslint/js')
const globals = require('globals')

// Flat ESLint config for the Express backend (CommonJS, Node 18+).
// Mirrors the structure of the frontend's ecommerce/eslint.config.js, minus the
// React plugins and with Node globals + `sourceType: 'commonjs'` instead.
//
// No Prettier here (unlike the frontend): the backend is hand-formatted and not
// internally consistent, so adopting Prettier would mean a repo-wide reformat for
// no functional gain. ESLint 9's core rules carry no stylistic checks, so nothing
// fights the existing formatting.
module.exports = [
    // Never lint deps, the (no longer served) build output, or coverage.
    { ignores: ['node_modules/**', 'build/**', 'coverage/**'] },

    // Application source — runs in Node, uses require/module.exports.
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: { ...globals.node },
        },
        rules: {
            ...js.configs.recommended.rules,
            // The backend logs exclusively through pino (config/logger.js) so that
            // production output stays structured and request bodies are never
            // logged. There are currently zero console.* calls — keep it that way.
            'no-console': 'error',
            // Unused vars are warnings (legacy tech debt); allow _-prefixed args
            // and PascalCase/CONST-style names, matching the frontend config.
            'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
        },
    },

    // Vitest test files + setup — globals:true in vitest.config.js means these are
    // injected rather than imported.
    {
        files: ['test/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
    },
]
