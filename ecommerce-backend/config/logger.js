const pino = require('pino')

// Single shared application logger.
// - In production: structured JSON (ideal for log aggregators like Render/Datadog).
// - In development: pretty-printed + colorized for human readability.
// pino never serializes request bodies here, so passwords are never logged.
const isProd = process.env.NODE_ENV === 'production'

const logger = pino(
    isProd
        ? { level: process.env.LOG_LEVEL || 'info' }
        : {
            level: process.env.LOG_LEVEL || 'debug',
            transport: { target: 'pino-pretty', options: { colorize: true } },
        }
)

module.exports = logger
