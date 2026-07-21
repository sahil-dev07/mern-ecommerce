const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const pinoHttp = require('pino-http')

const logger = require('./config/logger')
const { notFound, errorHandler } = require('./middleware/errorHandler')

// Routers
const productsRouters = require('./router/products')
const brandsRouters = require('./router/brands')
const categoriesRouters = require('./router/categories')
const userRouters = require('./router/users')
const authRouters = require('./router/auth')
const cartRouters = require('./router/cart')
const orderRouters = require('./router/order')

// Build the Express app WITHOUT connecting to the DB or listening. Keeping this
// side-effect-free lets tests (supertest) and boot-checks import `app` directly.
const app = express()

// Render terminates TLS at a proxy and forwards the client IP in X-Forwarded-For.
// Trust one proxy hop so req.ip resolves to the real client — otherwise
// express-rate-limit keys every request on the shared proxy IP (and logs
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR), lumping all users into one rate-limit bucket.
app.set('trust proxy', 1)

// CORS allowlist — a SUPERSET of every origin used during the migration: the
// Phase G tighten: the allowlist is now the frontend origin(s) from FRONTEND_ORIGIN
// (the live Netlify site, comma-separated) plus local dev ports only. The Render
// origin that used to serve build/ was DROPPED — real users are on Netlify now, and
// Phase H removes build/ from Render entirely. Requests with no Origin header
// (same-origin / non-browser) are still allowed by the callback below.
const allowlist = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .concat([
        'http://localhost:5173',
        'http://localhost:3000',
    ])

// --- Middleware ---
// Security headers. CSP stays off: this is now an API-only server (Phase H removed
// the served SPA), so responses are JSON and a default CSP would restrict nothing
// meaningful. Enabling a default CSP here is a safe follow-up, kept out of this flip.
app.use(helmet({ contentSecurityPolicy: false }))

// Request logging. pino-http logs method/url/status/latency only — never bodies,
// so credentials are never written to logs.
app.use(pinoHttp({ logger }))

app.use(
    cors({
        origin(origin, cb) {
            // Allow same-origin / non-browser requests (no Origin header) and
            // any allowlisted origin; reject everything else with a 403.
            if (!origin || allowlist.includes(origin)) return cb(null, true)
            const err = new Error('Not allowed by CORS')
            err.statusCode = 403
            cb(err)
        },
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-Total-Count'],
    })
)

// Parse JSON bodies with a size cap to blunt oversized-payload abuse.
app.use(express.json({ limit: '100kb' }))

// --- Routes ---
// Phase H: the frontend now lives on Netlify, so this server no longer serves the
// compiled SPA (express.static('build') removed, build/ untracked). Render runs the
// API only. Health check for uptime probes / boot-checks.
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.use('/products', productsRouters.router)
app.use('/brands', brandsRouters.router)
app.use('/categories', categoriesRouters.router)
app.use('/users', userRouters.router)
app.use('/auth', authRouters.router)
app.use('/cart', cartRouters.router)
app.use('/orders', orderRouters.router)

// --- Error handling (must be registered last) ---
app.use(notFound)
app.use(errorHandler)

module.exports = app
