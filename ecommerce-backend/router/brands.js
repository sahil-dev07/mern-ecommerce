const express = require('express')
const { fetchBrands, createBrand } = require('../controller/brand')
const validate = require('../middleware/validate')
const { isAuth, isAdmin } = require('../middleware/auth')
const { brandBody } = require('../validators')

const router = express.Router()

// /brands is added in app.js. GET is public; creating a brand is admin-only.
router.get('/', fetchBrands).post('/', isAuth, isAdmin, validate(brandBody), createBrand)

exports.router = router
