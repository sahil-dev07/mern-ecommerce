const express = require('express')
const { fetchCartByUser, addToCart, deleteFromCart, updateCart } = require('../controller/cart')
const validate = require('../middleware/validate')
const { isAuth, isOwnerOrAdmin } = require('../middleware/auth')
const { cartUserQuery, addToCartBody, cartDeleteQuery, updateCartBody } = require('../validators')

const router = express.Router()

// /cart is added in app.js. Every cart op is owner-scoped: you may only touch your
// own cart (admins may touch any). The owning user id lives in the query for
// get/delete and in the body for post/patch — note patch uses `userId`, not `user`.
// isOwnerOrAdmin reads the RAW request (it runs before validate), and compares the
// extracted id against req.user.id, so a spoofed id simply fails the ownership check.
router
    .get('/', isAuth, isOwnerOrAdmin((req) => req.query.user), validate(cartUserQuery, 'query'), fetchCartByUser)
    .post('/', isAuth, isOwnerOrAdmin((req) => req.body.user), validate(addToCartBody), addToCart)
    .delete('/', isAuth, isOwnerOrAdmin((req) => req.query.user), validate(cartDeleteQuery, 'query'), deleteFromCart)
    .patch('/', isAuth, isOwnerOrAdmin((req) => req.body.userId), validate(updateCartBody), updateCart)

exports.router = router
