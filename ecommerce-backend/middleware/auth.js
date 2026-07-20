const { verifyToken } = require('../utils/token')

// Authentication + authorization middleware.
// IMPORTANT: these are DEFINED here but NOT mounted on any route yet. Phase B is
// additive (issue tokens only); enforcement is turned on in Phase G, once the
// frontend attaches `Authorization: Bearer <token>` to every request. Mounting
// them earlier would 401 the live frontend, which sends no token today.

// Verify the Bearer token and attach the decoded payload to req.user.
const isAuth = (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ')
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Authentication required' })
    }
    try {
        req.user = verifyToken(token) // { id, role, iat, exp }
        next()
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}

// Require an admin role. Assumes isAuth has already populated req.user.
const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' })
    }
    next()
}

// Allow the resource owner or an admin through. `getOwnerId(req)` extracts the
// owning user id from the request (params/query/body) for that route, so we
// never trust a client-supplied id to match itself.
const isOwnerOrAdmin = (getOwnerId) => (req, res, next) => {
    const ownerId = getOwnerId(req)
    if (req.user?.role === 'admin' || String(ownerId) === String(req.user?.id)) {
        return next()
    }
    return res.status(403).json({ message: 'Forbidden' })
}

module.exports = { isAuth, isAdmin, isOwnerOrAdmin }
