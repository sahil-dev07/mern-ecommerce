const pino = require('pino')

// Single shared application logger.
// - In production: structured JSON (ideal for log aggregators like Render/Datadog).
// - In development: pretty-printed + colorized for human readability.
// pino never serializes request bodies here, so passwords are never logged.
const isProd = process.env.NODE_ENV === 'production'
// Under test we skip the pino-pretty transport: it spawns a worker thread per
// process, which slows the suite down and floods output with expected-error logs.
// (The test setup also sets LOG_LEVEL=silent.)
const isTest = process.env.NODE_ENV === 'test'

const logger = pino(
    isProd || isTest
        ? { level: process.env.LOG_LEVEL || 'info' }
        : {
            level: process.env.LOG_LEVEL || 'debug',
            transport: { target: 'pino-pretty', options: { colorize: true } },
        }
)

module.exports = logger
