// Token helpers for tests. These sign REAL tokens with the app's own signToken, so
// the tests exercise the genuine sign -> Authorization header -> verifyToken path
// rather than stubbing the auth middleware. Signing directly (instead of calling
// POST /auth/login) also means the guard suites need no database and never touch
// the rate-limited /auth routes.
const { signToken } = require('../../utils/token')

// Fixed, valid 24-hex ObjectIds. OWNER is "me", OTHER is a different user (used to
// prove ownership checks reject cross-user access), ADMIN is a privileged account.
const OWNER_ID = '507f1f77bcf86cd799439011'
const OTHER_ID = '507f1f77bcf86cd799439099'
const ADMIN_ID = '507f1f77bcf86cd799439012'

// `Bearer <jwt>` header values, ready to pass to supertest's .set('Authorization', …)
const bearer = (id, role) => `Bearer ${signToken({ id, role })}`

const userToken = (id = OWNER_ID) => bearer(id, 'user')
const adminToken = (id = ADMIN_ID) => bearer(id, 'admin')

module.exports = { OWNER_ID, OTHER_ID, ADMIN_ID, userToken, adminToken }
