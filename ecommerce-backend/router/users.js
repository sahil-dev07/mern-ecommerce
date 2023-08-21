const express = require('express')
const { updateUser, fetchUserById } = require('../controller/user')

const router = express.Router()

// /products is already added in the base path
router.get('/:id', fetchUserById)
    .patch('/:id', updateUser)

exports.router = router