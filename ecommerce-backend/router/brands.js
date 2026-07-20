const express = require('express')
const { fetchBrands, createBrand } = require('../controller/brand')
const validate = require('../middleware/validate')
const { brandBody } = require('../validators')

const router = express.Router()

// /brands is added in app.js.
router.get('/', fetchBrands).post('/', validate(brandBody), createBrand)

exports.router = router
