// Runs before every test file (wired via setupFiles in vitest.config.js).
const mongoose = require('mongoose')

// The app signs/verifies JWTs with process.env.JWT_SECRET. utils/token.js reads it
// at CALL time (not module load), so setting it here is enough — no import-order
// juggling needed. Only set when absent so a real .env can't be clobbered.
process.env.NODE_ENV = process.env.NODE_ENV || 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-not-used-in-production'
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Many tests deliberately provoke 4xx/5xx responses; pino would log each one as an
// error and bury the actual test output. Silence the app logger for the run.
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent'

// Most suites deliberately run with NO database: the auth guards reject at 401/403
// before any controller touches Mongo. For the few requests that do reach a
// controller, Mongoose would otherwise buffer the query for its default 10s before
// erroring, making those tests crawl. A short buffer timeout turns that wait into
// an immediate failure (surfaced as a 500), which is all those assertions need.
// The DB-backed suite connects first, so buffering never kicks in there.
mongoose.set('bufferTimeoutMS', 200)
