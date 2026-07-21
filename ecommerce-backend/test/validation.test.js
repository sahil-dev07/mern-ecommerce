// Phase C input-validation defenses: NoSQL operator injection, pagination caps,
// and mass-assignment stripping.
//
// Also runs with NO DATABASE — validate() rejects a bad request before the
// controller runs. The stripping behaviour, however, is invisible over HTTP
// without a DB (a valid body passes validation and then needs Mongo), so those
// cases assert against the zod schemas directly. That is the right level anyway:
// stripping is a property of the schema, not of the route.
const request = require('supertest')
const app = require('../app')
const { userToken, OWNER_ID } = require('./helpers/auth')
const { signupBody, updateUserBody, createOrderBody } = require('../validators')

describe('NoSQL operator injection is rejected', () => {
    it('rejects a $-operator object as a login email', async () => {
        // Typing the field as a string is what kills this: an object fails the
        // string check instead of reaching Mongo as a query operator.
        const res = await request(app)
            .post('/auth/login')
            .send({ email: { $gt: '' }, password: 'whatever' })
        expect(res.status).toBe(400)
    })

    it('rejects a $-operator object in a query parameter', async () => {
        const res = await request(app)
            .get('/cart')
            .query({ 'user[$gt]': '' })
            .set('Authorization', userToken())
        // Either the ownership check or the schema stops it — never a 2xx.
        expect([400, 403]).toContain(res.status)
    })

    it('rejects a non-ObjectId string where an id is required', async () => {
        const res = await request(app)
            .post('/cart')
            .set('Authorization', userToken())
            .send({ user: OWNER_ID, product: 'not-an-object-id', quantity: 1 })
        expect(res.status).toBe(400)
    })
})

describe('pagination is capped', () => {
    it('rejects an oversized _limit', async () => {
        const res = await request(app).get('/products?_limit=9999')
        expect(res.status).toBe(400)
    })

    it('rejects _limit just past the cap (51)', async () => {
        const res = await request(app).get('/products?_limit=51')
        expect(res.status).toBe(400)
    })

    it('rejects _page below 1', async () => {
        const res = await request(app).get('/products?_page=0')
        expect(res.status).toBe(400)
    })

    it('accepts _limit at the cap (50)', async () => {
        const res = await request(app).get('/products?_limit=50')
        expect(res.status).not.toBe(400)
    })
})

describe('schemas strip unknown keys (mass-assignment defense)', () => {
    it('signup drops a client-supplied role', async () => {
        const parsed = signupBody.parse({
            name: 'Mallory',
            email: 'Mallory@Example.com',
            password: 'password123',
            role: 'admin', // the attack
        })
        expect(parsed).not.toHaveProperty('role')
        expect(parsed.email).toBe('mallory@example.com') // normalized for lookup parity
    })

    it('profile update drops email, role and password', async () => {
        const parsed = updateUserBody.parse({
            name: 'New Name',
            email: 'attacker@example.com',
            role: 'admin',
            password: 'hunter2',
        })
        expect(parsed).toEqual({ name: 'New Name' })
    })

    it('order creation rejects a $-operator as the user id', () => {
        expect(() =>
            createOrderBody.parse({
                items: [{ product: { id: OWNER_ID }, quantity: 1 }],
                user: { $gt: '' },
                selectedAddress: {},
            })
        ).toThrow()
    })
})
