// Navbar characterization.
//
// Two later phases hinge on this file:
//   Phase 3 hoists Navbar into a route-level <Layout>. That is only safe once the
//     component stops dereferencing a null user (see the first test below).
//   Phase 10 makes the nav role-aware so an admin can get back to the storefront.
// Both are pinned here.
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../auth/authSlice'
import cartReducer from '../cart/cartSlice'
import Navbar from './Navbar'

// Navbar reads state.auth.loggedInUser and state.cart.items, and renders <Link>s.
function renderNavbar(loggedInUser, items = []) {
    const store = configureStore({
        reducer: { auth: authReducer, cart: cartReducer },
        preloadedState: {
            auth: { loggedInUser, status: 'idle', error: null },
            cart: { items, status: 'idle', error: null },
        },
    })
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <Navbar><div>page content</div></Navbar>
            </MemoryRouter>
        </Provider>
    )
}

describe('Navbar', () => {
    // CURRENT BUG — the Phase 3 prerequisite.
    // Navbar.jsx:69 and :168 do `item[user.role]`, and :195-196 read user.name /
    // user.email, all unguarded. It survives today only because Navbar is always
    // rendered *inside* an already-redirected <Protected>. The moment Phase 3 moves
    // it into a parent Layout it would mount on logged-out routes and hard-crash.
    //
    // Phase 3a adds `user?.role` / `user?.name` / `user?.email`. When it lands this
    // test MUST be flipped to `expect(() => renderNavbar(null)).not.toThrow()`.
    it('CURRENT BUG: crashes when rendered with no logged-in user', () => {
        // This render is SUPPOSED to blow up, and an uncaught React render error is
        // reported twice: once by React through console.error (the component stack) and
        // once by jsdom, which re-dispatches it as a window 'error' event. Both are
        // muted for this one case so the suite's output stays clean — an error that
        // shows up during any other test is then genuinely unexpected.
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })
        const swallow = (event) => event.preventDefault()
        window.addEventListener('error', swallow)
        try {
            expect(() => renderNavbar(null)).toThrow(/Cannot read properties of null/)
        } finally {
            window.removeEventListener('error', swallow)
            consoleError.mockRestore()
        }
    })

    it('shows the storefront link to a shopper', () => {
        renderNavbar({ id: '1', role: 'user', name: 'Shopper', email: 's@example.com' })
        expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/')
        expect(screen.queryByRole('link', { name: 'Products Admin' })).not.toBeInTheDocument()
    })

    it('shows the admin links to an admin', () => {
        renderNavbar({ id: '2', role: 'admin', name: 'Admin', email: 'a@example.com' })
        expect(screen.getByRole('link', { name: 'Products Admin' })).toHaveAttribute('href', '/admin')
        expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '/admin/orders')
    })

    // CURRENT BUG — the Phase 10 (G1) target.
    // `navigation` tags each entry with either `user: true` or `admin: true` and the
    // render gate is `item[user.role]`, which makes the two sets mutually exclusive.
    // An admin therefore has no link back to the shop and must log out to demo it.
    it('CURRENT BUG: an admin gets no link back to the storefront', () => {
        renderNavbar({ id: '2', role: 'admin', name: 'Admin', email: 'a@example.com' })
        expect(screen.queryByRole('link', { name: 'Products' })).not.toBeInTheDocument()
    })

    it('wraps its children as page content', () => {
        renderNavbar({ id: '1', role: 'user', name: 'Shopper', email: 's@example.com' })
        expect(screen.getByText('page content')).toBeInTheDocument()
    })

    it('links Sign out to /logout, and shows the account identity, in the mobile menu', () => {
        renderNavbar({ id: '1', role: 'user', name: 'Shopper', email: 's@example.com' })

        // The account links are asserted through the MOBILE <Disclosure.Panel>, not the
        // desktop dropdown, on purpose: the desktop <Menu.Items> is wrapped in
        // `<Transition as={Fragment}>`, and that Transition never mounts its child under
        // jsdom even after the menu button reports aria-expanded="true" and the frame is
        // flushed. Both render the same `userNavigation` array, so the mobile panel is a
        // faithful and deterministic stand-in. (Don't spend time re-attempting the
        // desktop path in a later phase — it is a Headless-UI/jsdom limitation, not an
        // app bug; it works in a real browser.)
        fireEvent.click(screen.getByRole('button', { name: 'Open main menu' }))

        // Regression lock: Sign out must point at /logout, not /login. Linking to
        // /login never logs the user out — Login bounces the still-authed user home,
        // which is exactly the bug the 08abdbf logout commit fixed.
        expect(screen.getByRole('link', { name: 'Sign out' })).toHaveAttribute('href', '/logout')
        expect(screen.getByRole('link', { name: 'Your Profile' })).toHaveAttribute('href', '/profile')
        expect(screen.getByRole('link', { name: 'Your Orders' })).toHaveAttribute('href', '/orders')

        // Navbar.jsx:195-196 read user.name / user.email unguarded — the other half of
        // the null-user crash above. This panel is the only place they render.
        expect(screen.getByText('Shopper')).toBeInTheDocument()
        expect(screen.getByText('s@example.com')).toBeInTheDocument()
    })

    it('renders the cart item-count badge only when the cart has lines', () => {
        const line = { id: 'ci1', quantity: 1, product: { id: 'p1', title: 'T', price: 10 } }
        const { unmount } = renderNavbar({ id: '1', role: 'user', name: 'S', email: 's@e.com' }, [line])
        expect(screen.getByText('1')).toBeInTheDocument()
        unmount()

        renderNavbar({ id: '1', role: 'user', name: 'S', email: 's@e.com' }, [])
        expect(screen.queryByText('1')).not.toBeInTheDocument()
    })
})
