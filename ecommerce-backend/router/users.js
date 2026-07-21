const express = require('express')
const { updateUser, fetchUserById } = require('../controller/user')
const validate = require('../middleware/validate')
const { isAuth, isOwnerOrAdmin } = require('../middleware/auth')
const { updateUserBody } = require('../validators')

const router = express.Router()

// /users is added in app.js. A user may only read/update their OWN profile
// (admins may access any); the owner id is the :id path param.
router
    .get('/:id', isAuth, isOwnerOrAdmin((req) => req.params.id), fetchUserById)
    .patch('/:id', isAuth, isOwnerOrAdmin((req) => req.params.id), validate(updateUserBody), updateUser)

exports.router = router
