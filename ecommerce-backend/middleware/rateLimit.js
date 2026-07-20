const rateLimit = require('express-rate-limit')

// Throttle auth endpoints to blunt credential brute-forcing / signup abuse.
// 20 requests per IP per 15 minutes is generous for real users but stops
// automated guessing. Returns 429 once exceeded.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again later.' },
})

module.exports = { authLimiter }
