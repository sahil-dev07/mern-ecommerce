import { configureStore } from '@reduxjs/toolkit'
import authReducer, { checkUserAsync, signOutAsync } from './authSlice'
import * as authAPI from './authAPI'
import { getToken, setToken } from '../../app/apiClient'

// Mock the API module so no real fetch happens; we drive the thunk with fixtures.
vi.mock('./authAPI')

const makeStore = () => configureStore({ reducer: { auth: authReducer } })

describe('authSlice', () => {
  it('login splits the { id, role, name, token } response: loggedInUser + persisted token', async () => {
    authAPI.checkuser.mockResolvedValue({
      data: { id: '1', role: 'user', name: 'Sahil', token: 'jwt-123' },
    })
    const store = makeStore()

    await store.dispatch(checkUserAsync({ email: 'a@b.com', password: 'pw' }))

    // token stripped out of the user object, persisted to localStorage
    expect(store.getState().auth.loggedInUser).toEqual({ id: '1', role: 'user', name: 'Sahil' })
    expect(store.getState().auth.status).toBe('idle')
    expect(getToken()).toBe('jwt-123')
  })

  it('failed login sets status=failed + error and stores no token', async () => {
    authAPI.checkuser.mockRejectedValue(Object.assign(new Error('Invalid credentials'), { status: 401 }))
    const store = makeStore()

    await store.dispatch(checkUserAsync({ email: 'a@b.com', password: 'bad' }))

    expect(store.getState().auth.loggedInUser).toBeNull()
    expect(store.getState().auth.status).toBe('failed')
    expect(store.getState().auth.error).toEqual({ status: 401, message: 'Invalid credentials' })
    expect(getToken()).toBeNull()
  })

  it('signOut clears the token and loggedInUser', async () => {
    authAPI.checkuser.mockResolvedValue({
      data: { id: '1', role: 'user', name: 'Sahil', token: 'jwt-123' },
    })
    authAPI.signOut.mockResolvedValue({ data: 'success' })
    const store = makeStore()

    await store.dispatch(checkUserAsync({ email: 'a@b.com', password: 'pw' }))
    expect(getToken()).toBe('jwt-123')

    await store.dispatch(signOutAsync())

    expect(store.getState().auth.loggedInUser).toBeNull()
    expect(getToken()).toBeNull()
  })
})
