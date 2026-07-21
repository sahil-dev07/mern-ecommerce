const { Order } = require("../model/order")
const { Product } = require("../model/product")
const catchAsync = require("../utils/catchAsync")

// Server-side unit price for a product, matching the frontend's discountedPrice()
// helper EXACTLY (Math.round(price * (1 - discountPercentage/100))) so the stored
// total equals the total the shopper saw. discountPercentage is optional on the
// Product schema, so an absent value means no discount (treat as 0).
const unitPriceOf = (product) =>
    Math.round(product.price * (1 - (product.discountPercentage || 0) / 100))

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

    // Re-fetch all referenced products in a single query. The product id is sent
    // as items[i].product.id (the wire shape strips _id via toJSON); fall back
    // defensively in case a bare id or _id is sent instead.
    const idOf = (it) => String(it?.product?.id ?? it?.product?._id ?? it?.product)
    const products = await Product.find({ _id: { $in: items.map(idOf) } })
    const productById = new Map(products.map((p) => [String(p.id), p]))

    // Recompute totals from server-side data and snapshot the authoritative
    // product into each line (so admin views render the true price, not client input).
    let totalAmount = 0
    let totalItems = 0
    const verifiedItems = items.map((it) => {
        const product = productById.get(idOf(it))
        if (!product) {
            const err = new Error(`Product not found in order: ${idOf(it)}`)
            err.statusCode = 400
            throw err
        }
        // Clamp quantity to a positive integer; the client <select> caps at 5 but
        // the server must not trust that.
        const quantity = Math.max(1, Math.floor(Number(it.quantity) || 1))
        totalAmount += unitPriceOf(product) * quantity
        totalItems += quantity
        return { ...it, product: product.toJSON(), quantity }
    })

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
