// Cart characterization — the primary guard for the Phase 6 currency rollout.
//
// Phase 6 routes 17 render sites across 8 files through formatCurrency. The math
// must NOT change: the server recomputes every total from its own Product docs
// (controller/order.js:26-34) and charges that, so if the client's arithmetic
// drifts the shopper is quoted one number and billed another. This file pins the
// arithmetic by asserting the rendered subtotal for a known basket.
//
// It deliberately does NOT assert the <Navigate to="/"> on an empty cart —
// Cart.jsx:48 bounces a deep link home before the fetch resolves, and Phase 4
// replaces it with a real empty state on purpose.
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../auth/authSlice'
import cartReducer from './cartSlice'
import { getByExactText } from '../../test/textMatchers'
import Cart from './Cart'

// Three lines chosen so the total exercises every rounding path:
//   90 * 2 = 180   (a normal percentage discount)
//   50 * 1 =  50   (no discount)
//    9 * 3 =  27   (9.99 at 10.48% off -> 8.943... -> 9, the cross-repo parity case)
//                    = 257 over 6 units
const line = (id, quantity, price, discountPercentage) => ({
    id: `ci-${id}`,
    quantity,
    product: {
        id,
        title: `Product ${id}`,
        thumbnail: `https://example.com/${id}.jpg`,
        price,
        discountPercentage,
        stock: 50,
    },
})

const ITEMS = [line('a', 2, 100, 10), line('b', 1, 50, 0), line('c', 3, 9.99, 10.48)]
const EXPECTED_SUBTOTAL = 257
const EXPECTED_UNITS = 6

function renderCart(items = ITEMS, status = 'idle') {
    const store = configureStore({
        reducer: { auth: authReducer, cart: cartReducer },
        preloadedState: {
            auth: { loggedInUser: { id: 'u1', role: 'user', name: 'S' }, status: 'idle', error: null },
            cart: { items, status, error: null },
        },
    })
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <Cart />
            </MemoryRouter>
        </Provider>
    )
}

describe('Cart', () => {
    it('renders one row per cart line', () => {
        renderCart()
        expect(screen.getByText('Product a')).toBeInTheDocument()
        expect(screen.getByText('Product b')).toBeInTheDocument()
        expect(screen.getByText('Product c')).toBeInTheDocument()
    })

    it('sums the discounted line prices into the subtotal', () => {
        renderCart()
        // Phase 6 will render this as formatCurrency(257). The integer must not move.
        expect(getByExactText(`$${EXPECTED_SUBTOTAL}`)).toBeInTheDocument()
    })

    it('counts units, not lines', () => {
        renderCart()
        expect(getByExactText(`${EXPECTED_UNITS}Items`)).toBeInTheDocument()
    })

    it('prices each line at its discounted unit price', () => {
        renderCart()
        expect(getByExactText('$90')).toBeInTheDocument() // 100 less 10%
        expect(getByExactText('$50')).toBeInTheDocument() // no discount
        expect(getByExactText('$9')).toBeInTheDocument()  // 9.99 less 10.48%, rounded
    })

    it('offers a checkout link', () => {
        renderCart()
        expect(screen.getByRole('link', { name: /Checkout/ })).toHaveAttribute('href', '/checkout')
    })
})
