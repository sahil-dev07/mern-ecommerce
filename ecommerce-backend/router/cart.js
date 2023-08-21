const express = require('express')
const { fetchCartByUser, addToCart, deleteFromCart, updateCart } = require('../controller/cart')


const router = express.Router()

// /brands is already added in the base path
router.get('/', fetchCartByUser)
    .post('/', addToCart)
    .delete('/', deleteFromCart)
    .patch('/', updateCart)

exports.router = router