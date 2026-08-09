import { clearToken } from './apiClient'
import { persistor } from './store'

// Auth thunks whose rejection is NOT a session-expiry: a 401 on login/signup
// means bad credentials (shown inline by the auth slice), and signout is a
// logout already — none should trigger the force-redirect below.
// Exported so a test can assert each prefix still matches a live thunk's
// typePrefix. These strings depend on authSlice's `name: 'user'`, which does NOT
// match the store key ('auth') — renaming the slice silently breaks the 401
// auto-logout with no runtime error anywhere.
export const AUTH_ACTION_PREFIXES = ['user/checkUser', 'user/createUser', 'user/signout']

// Global 401 handler. When any authenticated thunk rejects with status 401
// (expired/invalid/absent token), force a clean logout: clear the token, purge
// the persisted auth slice, and hard-redirect to /login. A hard redirect is used
// because middleware has no router access; purging first means the reload starts
// logged-out instead of rehydrating the stale user.
//
// NOTE: `persistor` is imported from ./store (circular), but it's only read
// inside this handler — by the time a 401 fires, store.js has fully evaluated,
// so the live binding is defined.
export const authMiddleware = () => (next) => (action) => {
  const result = next(action)

  const isRejection = action.type?.endsWith('/rejected')
  const isUnauthorized = action.payload?.status === 401
  const isAuthAction = AUTH_ACTION_PREFIXES.some((p) => action.type?.startsWith(p))

  if (isRejection && isUnauthorized && !isAuthAction) {
    clearToken()
    persistor.purge() // drop persisted auth so the reload starts fresh
    // Avoid a redirect loop if we're already on the login page.
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
  }

  return result
}
