const express = require('express')
const { fetchCartByUser, addToCart, deleteFromCart, updateCart } = require('../controller/cart')
const validate = require('../middleware/validate')
const { cartUserQuery, addToCartBody, cartDeleteQuery, updateCartBody } = require('../validators')

const router = express.Router()

// /cart is added in app.js.
router
    .get('/', validate(cartUserQuery, 'query'), fetchCartByUser)
    .post('/', validate(addToCartBody), addToCart)
    .delete('/', validate(cartDeleteQuery, 'query'), deleteFromCart)
    .patch('/', validate(updateCartBody), updateCart)

exports.router = router
