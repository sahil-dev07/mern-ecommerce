const express = require('express')
const { fetchCategories, createCategory } = require('../controller/category')
const validate = require('../middleware/validate')
const { isAuth, isAdmin } = require('../middleware/auth')
const { categoryBody } = require('../validators')

const router = express.Router()

// /categories is added in app.js. GET is public; creating a category is admin-only.
router.get('/', fetchCategories).post('/', isAuth, isAdmin, validate(categoryBody), createCategory)

exports.router = router
