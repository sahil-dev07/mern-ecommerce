// The price-tampering defense, tested as pure functions — no database, no HTTP.
//
// This is the core of Phase G: a client may POST any product.price / totalAmount
// it wants, and the server must ignore all of it and recompute from the Product
// docs it loaded itself. Every case below is a tampering scenario or an edge in
// that recompute.
const { unitPriceOf, idOf, buildVerifiedOrder } = require('../utils/orderTotals')

// Stand-in for a Product doc loaded from Mongo (plain object — buildVerifiedOrder
// falls back to a shallow copy when there is no toJSON).
const product = (over = {}) => ({
    id: '507f1f77bcf86cd799439011',
    title: 'Test Product',
    price: 100,
    discountPercentage: 10,
    ...over,
})

const mapOf = (...products) => new Map(products.map((p) => [String(p.id), p]))

describe('unitPriceOf', () => {
    it('applies the discount and rounds, matching the frontend helper', () => {
        // Frontend: Math.round(price * (1 - discountPercentage/100))
        expect(unitPriceOf({ price: 100, discountPercentage: 10 })).toBe(90)
    })

    it('treats an absent discountPercentage as no discount', () => {
        // discountPercentage is optional on the Product schema — undefined must not
        // produce NaN (1 - undefined/100 would).
        expect(unitPriceOf({ price: 49 })).toBe(49)
    })

    it('rounds to a whole number like the storefront does', () => {
        // 9.99 with 10.48% off = 8.943... -> 9
        expect(unitPriceOf({ price: 9.99, discountPercentage: 10.48 })).toBe(9)
    })
})

describe('idOf', () => {
    it('reads the normal wire shape (product.id)', () => {
        expect(idOf({ product: { id: 'abc' } })).toBe('abc')
    })

    it('falls back to _id, then to a bare id', () => {
        expect(idOf({ product: { _id: 'xyz' } })).toBe('xyz')
        expect(idOf({ product: 'bare-id' })).toBe('bare-id')
    })
})

describe('buildVerifiedOrder', () => {
    it('IGNORES a client-supplied price and uses the authoritative product', () => {
        const real = product({ price: 100, discountPercentage: 10 }) // true unit = 90
        const items = [
            {
                quantity: 2,
                // the attack: a doctored product payload
                product: { id: real.id, price: 1, discountPercentage: 99 },
            },
        ]

        const { verifiedItems, totalAmount, totalItems } = buildVerifiedOrder(items, mapOf(real))

        expect(totalAmount).toBe(180) // 90 * 2, not 1 * 2
        expect(totalItems).toBe(2)
        expect(verifiedItems[0].product.price).toBe(100) // snapshot is authoritative
    })

    it('sums multiple line items', () => {
        const a = product({ id: 'a', price: 100, discountPercentage: 10 }) // 90
        const b = product({ id: 'b', price: 50, discountPercentage: 0 }) // 50
        const items = [
            { quantity: 2, product: { id: 'a' } },
            { quantity: 3, product: { id: 'b' } },
        ]

        const { totalAmount, totalItems } = buildVerifiedOrder(items, mapOf(a, b))

        expect(totalAmount).toBe(90 * 2 + 50 * 3)
        expect(totalItems).toBe(5)
    })

    it('handles the same product appearing on two lines', () => {
        const p = product({ price: 100, discountPercentage: 0 })
        const items = [
            { quantity: 1, product: { id: p.id } },
            { quantity: 2, product: { id: p.id } },
        ]

        const { totalAmount, totalItems } = buildVerifiedOrder(items, mapOf(p))

        expect(totalAmount).toBe(300)
        expect(totalItems).toBe(3)
    })

    it.each([
        [0, 1],
        [-5, 1],
        ['not a number', 1],
        [undefined, 1],
        [2.7, 2],
        ['3', 3],
    ])('clamps quantity %p to %p', (given, expected) => {
        const p = product({ price: 10, discountPercentage: 0 })
        const { totalItems, verifiedItems } = buildVerifiedOrder(
            [{ quantity: given, product: { id: p.id } }],
            mapOf(p)
        )
        expect(totalItems).toBe(expected)
        expect(verifiedItems[0].quantity).toBe(expected)
    })

    it('throws a 400 when a line references an unknown product', () => {
        const items = [{ quantity: 1, product: { id: 'does-not-exist' } }]
        try {
            buildVerifiedOrder(items, mapOf(product()))
            throw new Error('should have thrown')
        } catch (err) {
            expect(err.statusCode).toBe(400)
            expect(err.message).toContain('does-not-exist')
        }
    })

    it('preserves other line fields while overwriting product and quantity', () => {
        const p = product({ price: 10, discountPercentage: 0 })
        const { verifiedItems } = buildVerifiedOrder(
            [{ id: 'cart-item-1', quantity: 1, product: { id: p.id, price: 999 } }],
            mapOf(p)
        )
        expect(verifiedItems[0].id).toBe('cart-item-1')
        expect(verifiedItems[0].product.price).toBe(10)
    })

    it('uses toJSON when given a Mongoose-like document', () => {
        // Production passes real Mongoose docs; toJSON adds `id` and strips `_id`.
        const doc = { price: 100, discountPercentage: 0, id: 'm1', toJSON: () => ({ id: 'm1', price: 100 }) }
        const { verifiedItems } = buildVerifiedOrder(
            [{ quantity: 1, product: { id: 'm1' } }],
            new Map([['m1', doc]])
        )
        expect(verifiedItems[0].product).toEqual({ id: 'm1', price: 100 })
        expect(verifiedItems[0].product).not.toHaveProperty('toJSON')
    })
})
