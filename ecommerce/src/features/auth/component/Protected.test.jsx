import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../authSlice'
import Protected from './Protected'

// Render <Protected> at /secret with a preloaded auth state, plus a /login route
// to land on after a redirect. Protected reads state.auth.loggedInUser.
function renderProtected(loggedInUser) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { loggedInUser, status: 'idle', error: null } },
  })
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route path="/secret" element={<Protected><div>secret content</div></Protected>} />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('Protected', () => {
  it('redirects to /login when logged out', () => {
    renderProtected(null)
    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('renders children when logged in', () => {
    renderProtected({ id: '1', role: 'user', name: 'S' })
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })
})
