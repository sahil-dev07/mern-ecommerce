const express = require('express')
const { updateUser, fetchUserById } = require('../controller/user')
const validate = require('../middleware/validate')
const { updateUserBody } = require('../validators')

const router = express.Router()

// /users is added in app.js.
router
    .get('/:id', fetchUserById)
    .patch('/:id', validate(updateUserBody), updateUser)

exports.router = router
