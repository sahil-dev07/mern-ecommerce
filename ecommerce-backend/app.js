const path = require('path')
const express = require('express')
const cors = require('cors')
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

// --- Middleware ---
// Request logging. pino-http logs method/url/status/latency only — never bodies,
// so credentials are never written to logs.
app.use(pinoHttp({ logger }))

// Serve the committed compiled frontend (build/).
// NOTE (Phase H): this coupling is removed once the frontend is hosted on Netlify.
app.use(express.static(path.join(__dirname, 'build')))

// CORS — currently permissive (reflects any origin). Locked to an allowlist in
// Phase C/G. exposedHeaders keeps X-Total-Count readable for pagination.
app.use(cors({ exposedHeaders: ['X-Total-Count'] }))

// Parse JSON request bodies.
app.use(express.json())

// --- Routes ---
// Health check for uptime probes / boot-checks. Defined before the SPA-serving
// static middleware would otherwise shadow "/", so it always returns JSON.
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
