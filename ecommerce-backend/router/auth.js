const express = require('express')
const { createUser, loginUser } = require('../controller/auth')
const validate = require('../middleware/validate')
const { authLimiter } = require('../middleware/rateLimit')
const { signupBody, loginBody } = require('../validators')

const router = express.Router()

// Base path /auth is added in app.js. Rate-limited + validated.
router
    .post('/signup', authLimiter, validate(signupBody), createUser)
    .post('/login', authLimiter, validate(loginBody), loginUser)

exports.router = router
