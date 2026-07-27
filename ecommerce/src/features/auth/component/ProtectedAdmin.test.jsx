// ProtectedAdmin has ZERO coverage today, yet it is the only thing standing
// between a logged-in shopper and the admin product/order screens (which can
// soft-delete the catalog and rewrite order status against the shared
// production database). Phase 3 converts this guard to a dual-mode
// children/<Outlet> component and moves it up the route tree; these three cases
// are what must not change.
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../authSlice'
import ProtectedAdmin from './ProtectedAdmin'

// Mirrors Protected.test.jsx: render the guard at /admin with a preloaded auth
// state, plus the two redirect destinations so we can assert where it landed.
function renderProtectedAdmin(loggedInUser) {
    const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: { auth: { loggedInUser, status: 'idle', error: null } },
    })
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route
                        path="/admin"
                        element={<ProtectedAdmin><div>admin content</div></ProtectedAdmin>}
                    />
                    <Route path="/" element={<div>storefront</div>} />
                    <Route path="/login" element={<div>login page</div>} />
                </Routes>
            </MemoryRouter>
        </Provider>
    )
}

describe('ProtectedAdmin', () => {
    it('renders children for an admin', () => {
        renderProtectedAdmin({ id: '1', role: 'admin', name: 'A' })
        expect(screen.getByText('admin content')).toBeInTheDocument()
    })

    it('redirects a signed-in non-admin to the storefront', () => {
        renderProtectedAdmin({ id: '2', role: 'user', name: 'S' })
        expect(screen.getByText('storefront')).toBeInTheDocument()
        expect(screen.queryByText('admin content')).not.toBeInTheDocument()
    })

    it('redirects a logged-out visitor to /login', () => {
        renderProtectedAdmin(null)
        expect(screen.getByText('login page')).toBeInTheDocument()
        expect(screen.queryByText('admin content')).not.toBeInTheDocument()
    })
})
