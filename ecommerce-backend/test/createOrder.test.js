// End-to-end createOrder against a real (in-memory) MongoDB.
//
// The pure math is covered in orderTotals.test.js; this suite exists to prove the
// wiring a pure test cannot: that the controller actually loads the authoritative
// Products, forces the owner from the JWT, and PERSISTS the recomputed values.
// Assertions read the saved document back out of the database, not just the
// response body — a controller that returned the right JSON but stored the
// client's numbers would still fail here.
const request = require('supertest')
const app = require('../app')
const { Product } = require('../model/product')
const { Order } = require('../model/order')
const { startDb, stopDb, clearDb } = require('./helpers/db')
const { OWNER_ID, OTHER_ID, userToken } = require('./helpers/auth')

beforeAll(async () => {
    await startDb()
}, 120000) // first run may download the mongod binary

afterAll(stopDb)
beforeEach(clearDb)

// price 100 with 10% off -> authoritative unit price of 90
const seedProduct = () =>
    Product.create({
        title: 'Seeded Product',
        description: 'For tests',
        price: 100,
        discountPercentage: 10,
        brand: 'TestBrand',
        category: 'test-category',
        thumbnail: 'https://example.com/thumb.jpg',
    })

const orderBody = (productId, over = {}) => ({
    items: [{ quantity: 2, product: { id: String(productId), price: 99999 } }],
    totalAmount: 1, // tampered
    totalItems: 1, // tampered
    user: OTHER_ID, // tampered — trying to plant the order on someone else
    status: 'delivered', // tampered — trying to skip fulfilment
    paymentMethod: 'cash',
    selectedAddress: { name: 'Test', street: '1 Test St', city: 'Testville', pinCode: '000000' },
    ...over,
})

describe('POST /orders persists server-computed values', () => {
    it('recomputes totals and ignores every tampered field', async () => {
        const p = await seedProduct()

        const res = await request(app)
            .post('/orders')
            .set('Authorization', userToken(OWNER_ID))
            .send(orderBody(p.id))

        expect(res.status).toBe(201)

        // Read the stored document back — this is the assertion that matters.
        const saved = await Order.findById(res.body.id).lean()
        expect(saved.totalAmount).toBe(180) // 90 * 2, not the submitted 1
        expect(saved.totalItems).toBe(2) // not the submitted 1
        expect(String(saved.user)).toBe(OWNER_ID) // forced from the token, not OTHER_ID
        expect(saved.status).toBe('pending') // forced, not 'delivered'
        expect(saved.items[0].product.price).toBe(100) // authoritative, not 99999
    })

    it('rejects an order referencing a product that does not exist', async () => {
        await seedProduct()

        const res = await request(app)
            .post('/orders')
            .set('Authorization', userToken(OWNER_ID))
            .send(orderBody('507f1f77bcf86cd799439abc')) // valid ObjectId, no such product

        expect(res.status).toBe(400)
        expect(await Order.countDocuments()).toBe(0) // nothing partially written
    })

    it('sums multiple line items from the database', async () => {
        const a = await seedProduct() // unit 90
        const b = await Product.create({
            title: 'Second Product',
            description: 'For tests',
            price: 50,
            brand: 'TestBrand', // no discountPercentage -> unit 50
            category: 'test-category',
            thumbnail: 'https://example.com/thumb2.jpg',
        })

        const res = await request(app)
            .post('/orders')
            .set('Authorization', userToken(OWNER_ID))
            .send(
                orderBody(a.id, {
                    items: [
                        { quantity: 2, product: { id: String(a.id) } },
                        { quantity: 1, product: { id: String(b.id) } },
                    ],
                })
            )

        expect(res.status).toBe(201)
        const saved = await Order.findById(res.body.id).lean()
        expect(saved.totalAmount).toBe(90 * 2 + 50) // 230
        expect(saved.totalItems).toBe(3)
    })

    it('still requires authentication', async () => {
        const p = await seedProduct()
        const res = await request(app).post('/orders').send(orderBody(p.id))
        expect(res.status).toBe(401)
        expect(await Order.countDocuments()).toBe(0)
    })

    it('returns the created order with a pending status', async () => {
        const p = await seedProduct()
        const res = await request(app)
            .post('/orders')
            .set('Authorization', userToken(OWNER_ID))
            .send(orderBody(p.id))

        expect(res.status).toBe(201)
        expect(res.body.status).toBe('pending')
        expect(res.body.totalAmount).toBe(180)
    })
})
