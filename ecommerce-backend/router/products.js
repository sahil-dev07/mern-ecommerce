const express = require('express')
const { createProduct, fetchAllProducts, fetchProductById, updateProduct } = require('../controller/product')
const validate = require('../middleware/validate')
const { isAuth, isAdmin } = require('../middleware/auth')
const { createProductBody, updateProductBody, productListQuery } = require('../validators')

const router = express.Router()

// /products is added in app.js.
// Reads are public (storefront browsing). Writes are admin-only — guards run
// before validate() so an unauthenticated request is rejected before any body work.
router
    .post('/', isAuth, isAdmin, validate(createProductBody), createProduct)
    .get('/', validate(productListQuery, 'query'), fetchAllProducts)
    .get('/:id', fetchProductById)
    .patch('/:id', isAuth, isAdmin, validate(updateProductBody), updateProduct)

exports.router = router
