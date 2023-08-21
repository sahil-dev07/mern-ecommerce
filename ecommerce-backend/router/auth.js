const express = require('express')
const { createUser } = require('../controller/auth')
const { loginUser } = require('../controller/auth')
const passport = require('passport');
const router = express.Router()

// /products is already added in the base path
router.post('/signup', createUser)
    .post('/login', loginUser)
// router.post('/login', passport.authenticate('local'), loginUser)


exports.router = router

