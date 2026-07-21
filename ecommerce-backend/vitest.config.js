const { defineConfig } = require('vitest/config')

// Backend test config. Node environment (no jsdom — there is no DOM here) and
// globals:true so describe/it/expect need no imports, matching the frontend setup.
// setupFiles runs before every test file: it seeds the env vars the app reads and
// makes Mongoose fail fast, which is what lets most suites run with no database.
module.exports = defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: './test/setup.js',
    },
})
