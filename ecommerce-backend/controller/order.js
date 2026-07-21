const { Order } = require("../model/order")
const { Product } = require("../model/product")
const catchAsync = require("../utils/catchAsync")
const { idOf, buildVerifiedOrder } = require("../utils/orderTotals")

exports.fetchOrderByUser = catchAsync(async (req, res) => {
    const { userId } = req.params
    const orders = await Order.find({ user: userId })
    res.status(200).json(orders)
})

exports.createOrder = catchAsync(async (req, res) => {
    // Phase G: never trust client-sent user / status / prices / totals. The order
    // owner is taken from the verified JWT, status is forced, and every line's
    // price is recomputed from the authoritative Product doc — this closes
    // price-tampering (a client editing product.price in the POST body is ignored).
    const { items, paymentMethod, selectedAddress } = req.body

    // Re-fetch all referenced products in a single query, then let the pure helper
    // recompute totals and snapshot the authoritative product onto each line.
    // (See utils/orderTotals.js — kept pure so it is unit-testable without a DB.)
    const products = await Product.find({ _id: { $in: items.map(idOf) } })
    const productById = new Map(products.map((p) => [String(p.id), p]))
    const { verifiedItems, totalAmount, totalItems } = buildVerifiedOrder(items, productById)

    const order = new Order({
        items: verifiedItems,
        totalAmount,
        totalItems,
        user: req.user.id, // forced from the verified token, not the body
        status: "pending", // forced — clients cannot open an order in any other state
        paymentMethod,
        selectedAddress,
    })
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
