const express = require('express')
const { fetchOrderByUser, createOrder, deleteOrder, updateOrder, fetchAllOrders } = require('../controller/order')
const validate = require('../middleware/validate')
const { isAuth, isAdmin, isOwnerOrAdmin } = require('../middleware/auth')
const { createOrderBody, updateOrderBody, orderListQuery } = require('../validators')

const router = express.Router()

// /orders is added in app.js. Authorization split:
//  - a user reads only their OWN order history (owner-scoped by :userId);
//  - any logged-in user may place an order (createOrder forces user + totals server-side);
//  - listing ALL orders and mutating/deleting any order are admin-only management ops.
router
    .get('/user/:userId', isAuth, isOwnerOrAdmin((req) => req.params.userId), fetchOrderByUser)
    .post('/', isAuth, validate(createOrderBody), createOrder)
    .delete('/:id', isAuth, isAdmin, deleteOrder)
    .patch('/:id', isAuth, isAdmin, validate(updateOrderBody), updateOrder)
    .get('/', isAuth, isAdmin, validate(orderListQuery, 'query'), fetchAllOrders)

exports.router = router
