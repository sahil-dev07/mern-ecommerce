const { z } = require('zod')

// A Mongo ObjectId as a 24-char hex string. Typing id/ref fields as strings
// (never objects) is what blocks NoSQL operator injection like {"$gt": ""} —
// such a payload arrives as an object and fails the string check.
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'must be a valid id')

// Bounded pagination integers. z.coerce turns "10" -> 10 and rejects
// non-numeric / array values; the limit cap prevents large-limit DoS.
const page = z.coerce.number().int().min(1)
const limit = z.coerce.number().int().min(1).max(50)

// ---------------- auth ----------------
const signupBody = z.object({
    name: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6).max(128),
})
const loginBody = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
})

// ---------------- product ----------------
const productFields = {
    title: z.string().min(1),
    description: z.string().min(1),
    price: z.number().min(0).max(10000),
    discountPercentage: z.number().min(0).max(99).optional(),
    rating: z.number().min(0).max(5).optional(),
    stock: z.number().int().min(0).optional(),
    brand: z.string().min(1),
    category: z.string().min(1),
    thumbnail: z.string().url(),
    images: z.array(z.string().url()).optional(),
    deleted: z.boolean().optional(),
}
const createProductBody = z.object(productFields)
const updateProductBody = z.object(productFields).partial()
const productListQuery = z.object({
    category: z.string().optional(),
    brand: z.string().optional(),
    _sort: z.string().optional(),
    _order: z.string().optional(),
    _page: page.optional(),
    _limit: limit.optional(),
    admin: z.string().optional(),
})

// ---------------- cart ----------------
const addToCartBody = z.object({
    user: objectId,
    product: objectId,
    quantity: z.coerce.number().int().positive().default(1),
})
const updateCartBody = z.object({
    userId: objectId,
    productId: objectId,
    quantity: z.coerce.number().int().positive(),
})
const cartUserQuery = z.object({ user: objectId })
const cartDeleteQuery = z.object({ product: objectId, user: objectId })

// ---------------- order ----------------
// items/selectedAddress are Mixed in the schema, so they stay loose here.
// user/totals are validated for shape now; Phase G forces user=req.user.id and
// recomputes totals server-side to close price-tampering.
const createOrderBody = z.object({
    items: z.array(z.any()).min(1),
    totalAmount: z.number().nonnegative().optional(),
    totalItems: z.number().int().nonnegative().optional(),
    user: objectId,
    paymentMethod: z.enum(['card', 'cash']).optional(),
    status: z.enum(['pending', 'dispatched', 'delivered', 'cancelled']).optional(),
    selectedAddress: z.any(),
})
const updateOrderBody = z
    .object({
        status: z.enum(['pending', 'dispatched', 'delivered', 'cancelled']),
    })
    .partial()
const orderListQuery = z.object({
    _sort: z.string().optional(),
    _order: z.string().optional(),
    _page: page.optional(),
    _limit: limit.optional(),
})

// ---------------- user ----------------
// Only name/addresses are updatable; email/role/password are stripped, which
// closes mass-assignment and avoids unique-email churn.
const updateUserBody = z.object({
    name: z.string().min(1).optional(),
    addresses: z.array(z.any()).optional(),
})

// ---------------- brand / category ----------------
const brandBody = z.object({
    label: z.string().min(1),
    value: z.string().min(1),
})
const categoryBody = brandBody

module.exports = {
    signupBody,
    loginBody,
    createProductBody,
    updateProductBody,
    productListQuery,
    addToCartBody,
    updateCartBody,
    cartUserQuery,
    cartDeleteQuery,
    createOrderBody,
    updateOrderBody,
    orderListQuery,
    updateUserBody,
    brandBody,
    categoryBody,
}
