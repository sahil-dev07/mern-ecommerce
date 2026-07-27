// Mock ./store so importing the middleware doesn't spin up the real store +
// redux-persist, and mock ./apiClient so no real localStorage token logic runs.
vi.mock('./store', () => ({ persistor: { purge: vi.fn() } }))
// setToken/apiClient are here because authSlice (imported below for the thunk
// type-prefix lock) pulls them in transitively; a mock factory must expose every
// binding its importers destructure or the import itself throws.
vi.mock('./apiClient', () => ({
  clearToken: vi.fn(),
  setToken: vi.fn(),
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

import { authMiddleware, AUTH_ACTION_PREFIXES } from './authMiddleware'
import { checkUserAsync, createUserAsync, signOutAsync } from '../features/auth/authSlice'
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

// The single most invisible failure mode in the app.
//
// AUTH_ACTION_PREFIXES are plain strings that must match the thunk type prefixes
// generated from authSlice's `name`, which is 'user' — NOT 'auth', the key it is
// mounted under in the store. Renaming the slice to match its store key (an
// obvious-looking tidy-up during any refactor) breaks these string matches with no
// type error, no lint error, no runtime error and no failing test. The only symptom
// is that a bad login starts hard-redirecting to /login mid-typing in production.
describe('AUTH_ACTION_PREFIXES <-> authSlice thunk names', () => {
  const thunks = [
    ['user/checkUser', checkUserAsync],
    ['user/createUser', createUserAsync],
    ['user/signout', signOutAsync],
  ]

  it.each(thunks)('%s is still the live typePrefix', (prefix, thunk) => {
    expect(thunk.typePrefix).toBe(prefix)
  })

  it('lists exactly the three auth thunks, no more, no fewer', () => {
    expect(AUTH_ACTION_PREFIXES).toEqual(thunks.map(([prefix]) => prefix))
  })

  it('matches every prefix against a real thunk', () => {
    // Catches a prefix that was kept while its thunk was renamed or deleted.
    const liveTypePrefixes = thunks.map(([, thunk]) => thunk.typePrefix)
    for (const prefix of AUTH_ACTION_PREFIXES) {
      expect(liveTypePrefixes).toContain(prefix)
    }
  })
})
