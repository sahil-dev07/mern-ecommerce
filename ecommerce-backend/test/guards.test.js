// Phase G authorization matrix — locks in which guard sits on which route.
//
// These run with NO DATABASE. That is not a shortcut, it is the design: isAuth /
// isAdmin / isOwnerOrAdmin reject at 401/403 before any controller touches Mongo,
// so every rejection case is fully deterministic and instant.
//
// For the cases where the guard is SUPPOSED to let the request through, we assert
// "not 401 and not 403". That is the precise property under test — this suite is
// about authorization, not about what the controller then does. Where a validate()
// runs after the guard, we can assert an exact 400 instead, which is a stronger,
// still DB-free proof that the guard passed.
const request = require('supertest')
const app = require('../app')
const { OWNER_ID, OTHER_ID, ADMIN_ID, userToken, adminToken } = require('./helpers/auth')

const ID = OWNER_ID // stand-in resource id for :id routes

// Assert the guard chain rejected the request outright.
const expectRejected = (res, status) => expect(res.status).toBe(status)

// Assert the guard chain let the request through to validate()/controller.
const expectPassedGuards = (res) => {
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
}

describe('unauthenticated requests are rejected (401)', () => {
    const protectedRoutes = [
        ['post', '/products'],
        ['patch', `/products/${ID}`],
        ['post', '/brands'],
        ['post', '/categories'],
        ['get', '/orders'],
        ['post', '/orders'],
        ['delete', `/orders/${ID}`],
        ['patch', `/orders/${ID}`],
        ['get', `/orders/user/${OWNER_ID}`],
        ['get', `/cart?user=${OWNER_ID}`],
        ['post', '/cart'],
        ['patch', '/cart'],
        ['delete', `/cart?product=${ID}&user=${OWNER_ID}`],
        ['get', `/users/${OWNER_ID}`],
        ['patch', `/users/${OWNER_ID}`],
    ]

    it.each(protectedRoutes)('%s %s -> 401 without a token', async (method, path) => {
        const res = await request(app)[method](path)
        expectRejected(res, 401)
    })

    it('rejects a malformed Authorization header', async () => {
        const res = await request(app).get('/orders').set('Authorization', 'NotBearer abc')
        expectRejected(res, 401)
    })

    it('rejects a token signed with the wrong secret', async () => {
        // Hand-rolled garbage token — verifyToken throws, isAuth maps that to 401.
        const res = await request(app).get('/orders').set('Authorization', 'Bearer not.a.jwt')
        expectRejected(res, 401)
    })
})

describe('admin-only routes reject non-admins (403)', () => {
    const adminRoutes = [
        ['post', '/products'],
        ['patch', `/products/${ID}`],
        ['post', '/brands'],
        ['post', '/categories'],
        ['get', '/orders'], // list ALL orders is a management view
        ['delete', `/orders/${ID}`],
        ['patch', `/orders/${ID}`],
    ]

    it.each(adminRoutes)('%s %s -> 403 for a normal user', async (method, path) => {
        const res = await request(app)[method](path).set('Authorization', userToken())
        expectRejected(res, 403)
    })

    it('lets an admin through to validation (400 on an empty body proves it passed)', async () => {
        const res = await request(app)
            .post('/products')
            .set('Authorization', adminToken())
            .send({})
        expect(res.status).toBe(400)
    })
})

describe('owner-scoped routes reject other users (403)', () => {
    // The owning user id lives in a different place per route — query for cart
    // get/delete, body for cart post/patch (note: `userId`, not `user`), and the
    // path param for order history / profile. A mismatch here is exactly the bug
    // this block exists to catch.
    it('GET /cart of another user -> 403', async () => {
        const res = await request(app)
            .get(`/cart?user=${OTHER_ID}`)
            .set('Authorization', userToken(OWNER_ID))
        expectRejected(res, 403)
    })

    it('DELETE /cart of another user -> 403', async () => {
        const res = await request(app)
            .delete(`/cart?product=${ID}&user=${OTHER_ID}`)
            .set('Authorization', userToken(OWNER_ID))
        expectRejected(res, 403)
    })

    it('POST /cart with another user in the body -> 403', async () => {
        const res = await request(app)
            .post('/cart')
            .set('Authorization', userToken(OWNER_ID))
            .send({ user: OTHER_ID, product: ID, quantity: 1 })
        expectRejected(res, 403)
    })

    it('PATCH /cart with another user in the body -> 403 (owner key is userId)', async () => {
        const res = await request(app)
            .patch('/cart')
            .set('Authorization', userToken(OWNER_ID))
            .send({ userId: OTHER_ID, productId: ID, quantity: 1 })
        expectRejected(res, 403)
    })

    it("GET another user's order history -> 403", async () => {
        const res = await request(app)
            .get(`/orders/user/${OTHER_ID}`)
            .set('Authorization', userToken(OWNER_ID))
        expectRejected(res, 403)
    })

    it("GET another user's profile -> 403", async () => {
        const res = await request(app)
            .get(`/users/${OTHER_ID}`)
            .set('Authorization', userToken(OWNER_ID))
        expectRejected(res, 403)
    })

    it("PATCH another user's profile -> 403", async () => {
        const res = await request(app)
            .patch(`/users/${OTHER_ID}`)
            .set('Authorization', userToken(OWNER_ID))
            .send({ name: 'Mallory' })
        expectRejected(res, 403)
    })

    it('a NoSQL operator object as the owner id does not bypass the check', async () => {
        // String({$gt:''}) is "[object Object]", which can never equal a real id.
        const res = await request(app)
            .post('/cart')
            .set('Authorization', userToken(OWNER_ID))
            .send({ user: { $gt: '' }, product: ID, quantity: 1 })
        expectRejected(res, 403)
    })
})

describe('owners and admins are allowed through', () => {
    it('owner reads their own cart', async () => {
        const res = await request(app)
            .get(`/cart?user=${OWNER_ID}`)
            .set('Authorization', userToken(OWNER_ID))
        expectPassedGuards(res)
    })

    it('owner reads their own order history', async () => {
        const res = await request(app)
            .get(`/orders/user/${OWNER_ID}`)
            .set('Authorization', userToken(OWNER_ID))
        expectPassedGuards(res)
    })

    it('owner reads their own profile', async () => {
        const res = await request(app)
            .get(`/users/${OWNER_ID}`)
            .set('Authorization', userToken(OWNER_ID))
        expectPassedGuards(res)
    })

    it("an admin may read another user's cart", async () => {
        const res = await request(app)
            .get(`/cart?user=${OWNER_ID}`)
            .set('Authorization', adminToken(ADMIN_ID))
        expectPassedGuards(res)
    })

    it('any logged-in user may place an order (400 on empty body proves it passed)', async () => {
        const res = await request(app).post('/orders').set('Authorization', userToken()).send({})
        expect(res.status).toBe(400)
    })
})

describe('public routes stay open', () => {
    const publicRoutes = [
        ['get', '/products'],
        ['get', `/products/${ID}`],
        ['get', '/brands'],
        ['get', '/categories'],
    ]

    it.each(publicRoutes)('%s %s needs no token', async (method, path) => {
        const res = await request(app)[method](path)
        expect(res.status).not.toBe(401)
        expect(res.status).not.toBe(403)
    })

    it('GET /health returns ok', async () => {
        const res = await request(app).get('/health')
        expect(res.status).toBe(200)
        expect(res.body).toEqual({ status: 'ok' })
    })
})
