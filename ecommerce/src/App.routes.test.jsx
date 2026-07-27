// Smoke test over the REAL route table.
//
// Phase 3 restructures App.jsx's 17 flat routes into nested guard -> <Layout> ->
// page trees. Nothing today proves any route renders at all: there are no route
// tests, no CI, and Netlify's `vite build` runs neither lint nor tests, so a
// broken route would first be noticed by a person clicking it. This file mounts
// every path through the exported `routes` array and asserts it produces DOM
// without throwing, as a shopper and as an admin.
//
// It is intentionally shallow — one assertion per path — because its job is to
// catch "this route now throws", not to re-test page internals.
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import productReducer from './features/product/productSlice'
import authReducer from './features/auth/authSlice'
import cartReducer from './features/cart/cartSlice'
import orderReducer from './features/order/orderSlice'
import userReducer from './features/user/userSlice'
import { END_POINT } from './app/constants'
import { routes } from './App'

// Every page in this app kicks off a thunk from a mount effect, and apiClient's
// END_POINT falls back to the LIVE Render URL when VITE_API_URL is unset
// (constants.js:6) — which is exactly the case under Vitest. So fetch is replaced
// with a promise that never settles: no request leaves the machine, no thunk
// resolves, and therefore no post-assertion state update fires an act() warning.
// Every slice keeps the preloaded state below for the whole test.
beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })))
})

afterEach(() => {
    vi.unstubAllGlobals()
})

const PRODUCT = {
    id: 'p1',
    title: 'Test Product',
    description: 'A product',
    thumbnail: 'https://example.com/t.jpg',
    // Four entries because ProductDetail and ProductForm index images[0..3]
    // unconditionally (the gallery bug A15 documents).
    images: ['https://example.com/1.jpg', 'https://example.com/2.jpg',
        'https://example.com/3.jpg', 'https://example.com/4.jpg'],
    price: 100,
    discountPercentage: 10,
    rating: 4.5,
    stock: 25,
    brand: 'Acme',
    category: 'widgets',
}

const CART_LINE = { id: 'ci1', quantity: 1, product: PRODUCT }

// Mirrors the real rootReducer (store.js:16-22) minus redux-persist — the persist
// wrapper needs localStorage plumbing and pulls in the store<->authMiddleware
// circular import, neither of which this test is about.
function makeStore(role) {
    const account = { id: 'u1', role, name: 'QA', email: 'qa@example.com' }
    return configureStore({
        reducer: {
            product: productReducer,
            auth: authReducer,
            cart: cartReducer,
            order: orderReducer,
            user: userReducer,
        },
        preloadedState: {
            product: {
                products: [PRODUCT], brands: [], category: [], status: 'idle',
                totalItems: 1, selectedProduct: PRODUCT, error: null,
            },
            auth: { loggedInUser: account, status: 'idle', error: null },
            cart: { items: [CART_LINE], status: 'idle', error: null },
            order: { orders: [], status: 'idle', currentOrder: null, totalOrders: 0, error: null },
            // addresses: [] matters — Checkout and UserProfile spread it unguarded.
            user: { userInfo: { ...account, addresses: [] }, status: 'idle', error: null },
        },
    })
}

function renderRoute(path, role) {
    const router = createMemoryRouter(routes, {
        initialEntries: [path],
        // Same opt-ins as App.jsx:112-115, so the test exercises the real transition
        // and splat-resolution behaviour rather than the v6 defaults.
        future: { v7_startTransition: true, v7_relativeSplatPath: true },
    })
    return render(
        <Provider store={makeStore(role)}>
            <RouterProvider router={router} />
        </Provider>
    )
}

// Concrete URLs for the 17 entries in the route table. Params are filled with the
// ids preloaded above so the pages have data to render.
const PATHS = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/cart',
    '/checkout',
    '/product-detail/p1',
    '/order-success/o1',
    '/orders',
    '/profile',
    '/logout',
    '/admin',
    '/admin/product-detail/p1',
    '/admin/product-form',
    '/admin/product-form/edit/p1',
    '/admin/orders',
    '/definitely-not-a-real-route', // the "*" catch-all
]

describe.each(['user', 'admin'])('route table as a %s', (role) => {
    it.each(PATHS)('renders %s', (path) => {
        const { container } = renderRoute(path, role)
        // Guards redirect rather than render for the wrong role (a shopper hitting
        // /admin lands on the storefront), so the assertion is "something rendered",
        // not "this specific page rendered" — role-specific routing is covered by
        // Protected.test.jsx and ProtectedAdmin.test.jsx.
        expect(container).not.toBeEmptyDOMElement()
    })
})

describe('route table', () => {
    it('has an entry for every path this app links to', () => {
        // Guards against a route being dropped during the Phase 3 restructure: the
        // count is asserted so an accidental deletion is loud, not silent.
        expect(routes).toHaveLength(17)
    })

    it('keeps the "*" catch-all last so it cannot shadow a real route', () => {
        expect(routes[routes.length - 1].path).toBe('*')
    })

    it('renders the storefront, not a redirect, for a signed-in shopper at /', () => {
        renderRoute('/', 'user')
        expect(screen.getByRole('heading', { name: 'All Products' })).toBeInTheDocument()
    })

    it('routes every request through the stub instead of the real backend', () => {
        // Not decoration: END_POINT resolves to the production Render URL under
        // Vitest (no VITE_API_URL), and that backend shares ONE Atlas cluster with
        // local dev. Un-stubbed, this suite would read live customer data on every
        // run. Asserting the calls were made AND that they all target END_POINT is
        // what proves the interception is total.
        renderRoute('/', 'user')
        expect(fetch).toHaveBeenCalled()
        for (const [url] of fetch.mock.calls) {
            expect(String(url).startsWith(END_POINT)).toBe(true)
        }
    })
})
