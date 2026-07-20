const logger = require('../config/logger')

// 404 handler — reached only when no route matched. Creates an error and hands
// it to the central error handler so every error response shares one JSON shape.
const notFound = (req, res, next) => {
    const err = new Error(`Not found - ${req.method} ${req.originalUrl}`)
    err.statusCode = 404
    next(err)
}

// Central error handler (must be the LAST middleware registered).
// Maps common Mongoose/DB errors to sensible HTTP status codes and returns a
// sanitized JSON body — it never leaks raw error objects (stacks, internal DB
// details) to clients in production. The unused `next` arg is required so
// Express recognizes this as a 4-argument error handler.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || err.status || 500
    let message = err.message || 'Internal server error'
    const extra = {}

    if (err.name === 'CastError') {
        // e.g. GET /products/not-a-valid-objectid
        statusCode = 400
        message = `Invalid ${err.path}: ${err.value}`
    } else if (err.name === 'ValidationError') {
        // Mongoose schema validation failure — surface which fields failed.
        statusCode = 400
        message = 'Validation failed'
        extra.details = Object.values(err.errors).map((e) => e.message)
    } else if (err.code === 11000) {
        // Duplicate unique key (e.g. email already registered).
        statusCode = 409
        message = `Duplicate value for: ${Object.keys(err.keyValue || {}).join(', ')}`
    }

    // Log server-side with full context: 5xx as error, client 4xx as warn.
    if (statusCode >= 500) logger.error({ err }, message)
    else logger.warn({ statusCode, path: req.originalUrl }, message)

    // Only expose the stack outside production; never send the raw error object.
    const body = { message, ...extra }
    if (process.env.NODE_ENV !== 'production') body.stack = err.stack

    res.status(statusCode).json(body)
}

module.exports = { notFound, errorHandler }
