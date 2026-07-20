const express = require('express')
const { fetchOrderByUser, createOrder, deleteOrder, updateOrder, fetchAllOrders } = require('../controller/order')
const validate = require('../middleware/validate')
const { createOrderBody, updateOrderBody, orderListQuery } = require('../validators')

const router = express.Router()

// /orders is added in app.js.
router
    .get('/user/:userId', fetchOrderByUser)
    .post('/', validate(createOrderBody), createOrder)
    .delete('/:id', deleteOrder)
    .patch('/:id', validate(updateOrderBody), updateOrder)
    .get('/', validate(orderListQuery, 'query'), fetchAllOrders)

exports.router = router
