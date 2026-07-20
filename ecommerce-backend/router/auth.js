const express = require('express')
const { createUser, loginUser } = require('../controller/auth')

const router = express.Router()

// Base path /auth is added in app.js.
router.post('/signup', createUser)
    .post('/login', loginUser)

exports.router = router
