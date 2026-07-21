// Pure order-total math, extracted from controller/order.js so it can be unit
// tested without a database. The controller keeps the I/O (fetching Products,
// saving the Order); everything here is deterministic given its arguments.
//
// WHY this matters: these functions are what close price-tampering. A client can
// POST any product.price / totalAmount it likes; the server ignores all of it and
// recomputes from the authoritative Product docs. Keeping that logic pure means a
// regression is caught by a fast unit test instead of only in production.

// Server-side unit price for a product, matching the frontend's discountedPrice()
// helper EXACTLY (Math.round(price * (1 - discountPercentage/100))) so the stored
// total equals the total the shopper saw. discountPercentage is optional on the
// Product schema, so an absent value means no discount (treat as 0).
const unitPriceOf = (product) =>
    Math.round(product.price * (1 - (product.discountPercentage || 0) / 100))

// Extract a line item's product id. The wire shape sends the full product object
// and strips _id via toJSON, so `product.id` is the normal case; the fallbacks
// cover a bare id string or a raw _id being sent instead.
const idOf = (item) => String(item?.product?.id ?? item?.product?._id ?? item?.product)

// Recompute an order's totals from authoritative product data.
//
// `items` is the client-sent line array; `productById` maps product id -> the
// Product doc loaded from the database. Returns the verified lines plus the
// server-computed totals. Throws a 400-tagged error if a line references a
// product that does not exist (the error handler maps statusCode to the response).
function buildVerifiedOrder(items, productById) {
    let totalAmount = 0
    let totalItems = 0

    const verifiedItems = items.map((item) => {
        const product = productById.get(idOf(item))
        if (!product) {
            const err = new Error(`Product not found in order: ${idOf(item)}`)
            err.statusCode = 400
            throw err
        }

        // Clamp quantity to a positive integer; the client <select> caps at 5 but
        // the server must not trust that. Non-numeric / zero / negative -> 1.
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))

        totalAmount += unitPriceOf(product) * quantity
        totalItems += quantity

        // Snapshot the authoritative product onto the line, replacing whatever the
        // client sent, so admin views render the true price. Mongoose docs go
        // through toJSON (adds `id`, strips `_id`); plain objects (unit tests) are
        // copied as-is.
        const snapshot = typeof product.toJSON === 'function' ? product.toJSON() : { ...product }
        return { ...item, product: snapshot, quantity }
    })

    return { verifiedItems, totalAmount, totalItems }
}

module.exports = { unitPriceOf, idOf, buildVerifiedOrder }
