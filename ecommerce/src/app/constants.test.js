// Characterization tests for the pricing helpers.
//
// These exist because the storefront and the server BOTH compute the unit price,
// and the server's value is the one actually charged (controller/order.js
// recomputes and discards whatever the client sends). If the two ever drift, the
// price on the card stops matching the price on the invoice — a bug that is
// invisible in every existing test.
import { ITEMS_PER_PAGE, discountedPrice } from './constants'

describe('ITEMS_PER_PAGE', () => {
    it('is 9 — Pagination and every _limit query derive from it', () => {
        // Pagination.jsx computes totalPages from this, and ProductList sends it as
        // _limit. Changing it silently changes both the grid size and the page count.
        expect(ITEMS_PER_PAGE).toBe(9)
    })
})

describe('discountedPrice', () => {
    it('applies the discount and rounds to a whole number', () => {
        expect(discountedPrice({ price: 100, discountPercentage: 10 })).toBe(90)
    })

    // CROSS-REPO PARITY LOCK.
    // Byte-identical to ecommerce-backend/test/orderTotals.test.js:35
    // ("rounds to a whole number like the storefront does"). Both sides must use
    // Math.round on the same expression; if this expectation and that one ever
    // disagree, the displayed price and the charged price have desynced.
    it('rounds 9.99 at 10.48% off to 9, exactly like the server', () => {
        expect(discountedPrice({ price: 9.99, discountPercentage: 10.48 })).toBe(9)
    })

    it('returns the price unchanged at a 0% discount', () => {
        expect(discountedPrice({ price: 49, discountPercentage: 0 })).toBe(49)
    })

    // CHARACTERIZATION OF A KNOWN BUG — not an endorsement.
    // discountPercentage is optional on the Product schema, so an admin-created
    // product without one renders "$NaN" in the storefront. The server's twin
    // (orderTotals.js:15) already guards with `|| 0` and returns 49, so the two
    // sides disagree TODAY for this input.
    // Phase 6 adds the same `|| 0` guard here; when it lands, flip this to
    // expect(49) and the divergence is closed.
    it('currently yields NaN when discountPercentage is absent (Phase 6 fixes this)', () => {
        expect(discountedPrice({ price: 49 })).toBeNaN()
    })
})
