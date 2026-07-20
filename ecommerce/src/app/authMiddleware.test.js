// Mock ./store so importing the middleware doesn't spin up the real store +
// redux-persist, and mock ./apiClient so no real localStorage token logic runs.
vi.mock('./store', () => ({ persistor: { purge: vi.fn() } }))
vi.mock('./apiClient', () => ({ clearToken: vi.fn() }))

import { authMiddleware } from './authMiddleware'
import { persistor } from './store'
import { clearToken } from './apiClient'

// Drive the middleware with a fake next() and a stubbed window.location.
function run(action, pathname = '/cart') {
  const assign = vi.fn()
  Object.defineProperty(window, 'location', {
    value: { pathname, assign },
    writable: true,
    configurable: true,
  })
  const next = vi.fn((a) => a)
  authMiddleware({})(next)(action)
  return { next, assign }
}

describe('authMiddleware (401 auto-logout)', () => {
  it('forces logout + redirect on a 401 from a non-auth action', () => {
    const action = { type: 'cart/fetchItemsByUserId/rejected', payload: { status: 401 } }
    const { next, assign } = run(action)

    expect(next).toHaveBeenCalledWith(action) // action still flows through
    expect(clearToken).toHaveBeenCalled()
    expect(persistor.purge).toHaveBeenCalled()
    expect(assign).toHaveBeenCalledWith('/login')
  })

  it('does NOT redirect on a 401 from the login action (bad credentials)', () => {
    const action = { type: 'user/checkUser/rejected', payload: { status: 401 } }
    const { assign } = run(action, '/login')
    expect(assign).not.toHaveBeenCalled()
  })

  it('ignores non-401 rejections', () => {
    const action = { type: 'cart/fetchItemsByUserId/rejected', payload: { status: 500 } }
    const { assign } = run(action)
    expect(assign).not.toHaveBeenCalled()
  })
})
