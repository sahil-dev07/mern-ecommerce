const express = require('express')
const { createProduct, fetchAllProducts, fetchProductById, updateProduct } = require('../controller/product')
const validate = require('../middleware/validate')
const { createProductBody, updateProductBody, productListQuery } = require('../validators')

const router = express.Router()

// /products is added in app.js.
router
    .post('/', validate(createProductBody), createProduct)
    .get('/', validate(productListQuery, 'query'), fetchAllProducts)
    .get('/:id', fetchProductById)
    .patch('/:id', validate(updateProductBody), updateProduct)

exports.router = router
