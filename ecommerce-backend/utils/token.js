const jwt = require('jsonwebtoken')

// Sign a JWT for an authenticated user. The payload is intentionally minimal
// (id + role) — a JWT is only base64-encoded, not encrypted, so never put
// sensitive data in it. JWT_SECRET is guaranteed present by the boot-time guard.
const signToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

// Verify a JWT and return its decoded payload. Throws on invalid/expired tokens;
// the auth middleware catches that and responds 401.
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET)

module.exports = { signToken, verifyToken }
