const express = require('express')
const { fetchOrderByUser, createOrder, deleteOrder, updateOrder, fetchAllOrders } = require('../controller/order')



const router = express.Router()

// /brands is already added in the base path
router.get('/user/:userId', fetchOrderByUser)
    .post('/', createOrder)
    .delete('/:id', deleteOrder)
    .patch('/:id', updateOrder)
    .get('/', fetchAllOrders)

exports.router = router
