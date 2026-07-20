const { Order } = require("../model/order")
const catchAsync = require("../utils/catchAsync")

exports.fetchOrderByUser = catchAsync(async (req, res) => {
    const { userId } = req.params
    const orders = await Order.find({ user: userId })
    res.status(200).json(orders)
})

exports.createOrder = catchAsync(async (req, res) => {
    // NOTE (Phase G): user / status / totals are still taken from the client.
    // The server will force user=req.user.id, status='pending', and recompute
    // totals from authoritative Product docs to close price-tampering.
    const order = new Order(req.body)
    const doc = await order.save()
    res.status(201).json(doc)
})

exports.deleteOrder = catchAsync(async (req, res) => {
    const { id } = req.params
    const order = await Order.findByIdAndDelete(id)
    res.status(200).json(order)
})

exports.updateOrder = catchAsync(async (req, res) => {
    const { id } = req.params
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json(updatedOrder) // was 201 — an update returns 200
})

// Admin: list all orders.
exports.fetchAllOrders = catchAsync(async (req, res) => {
    const { _sort, _order, _page, _limit } = req.query

    // NOTE: the Order schema has no `deleted` field, so this filter is currently
    // a no-op (kept for parity with products). Revisit if order soft-delete is added.
    let query = Order.find({ deleted: { $ne: true } })
    const totalOrdersQuery = Order.find({ deleted: { $ne: true } })

    if (_sort && _order) {
        query = query.sort({ [_sort]: _order })
    }

    // countDocuments() — count() is removed in Mongoose 8.
    const totalDocs = await totalOrdersQuery.countDocuments().exec()

    if (_page && _limit) {
        const pageSize = _limit
        const page = _page
        query = query.skip(pageSize * (page - 1)).limit(pageSize)
    }

    res.set('X-Total-Count', totalDocs)
    const docs = await query.exec()
    res.status(200).json(docs)
})
