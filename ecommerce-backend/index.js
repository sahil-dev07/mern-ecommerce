require('dotenv').config()

const mongoose = require('mongoose')
const app = require('./app')
const logger = require('./config/logger')

// Fail fast if required secrets are missing, rather than connecting to
// `undefined` or booting an app that would 500 on the first auth call.
const REQUIRED_ENV = ['DATABASE_URI', 'JWT_SECRET']
const missing = REQUIRED_ENV.filter((key) => !process.env[key])
if (missing.length) {
    logger.error(`Missing required env vars: ${missing.join(', ')}`)
    process.exit(1)
}

const port = process.env.PORT || 8080

// Connect to MongoDB first, then start the HTTP server only after a successful
// connection — so the app never accepts requests against a dead database.
async function start() {
    try {
        await mongoose.connect(process.env.DATABASE_URI, { family: 4 })
        logger.info('Connected to ecommerce database')
        app.listen(port, () => logger.info(`Server listening on port ${port}`))
    } catch (err) {
        logger.error({ err }, 'Failed to connect to database')
        process.exit(1)
    }
}

start()
