const express = require('express')
const { fetchCategories, createCategory } = require('../controller/category')
const validate = require('../middleware/validate')
const { categoryBody } = require('../validators')

const router = express.Router()

// /categories is added in app.js.
router.get('/', fetchCategories).post('/', validate(categoryBody), createCategory)

exports.router = router
