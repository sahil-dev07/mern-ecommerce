import { apiClient } from '../../app/apiClient'

// POST /auth/signup -> { id, role, name, token }
export async function createUser(userdata) {
  const { data } = await apiClient.post('/auth/signup', userdata)
  return { data }
}

// Client-only sign-out: JWT is stateless, so there's no server session to end.
// Token clearing lives in the auth slice / 401 middleware. Kept as an async
// wrapper so callers await a consistent shape.
export async function signOut() {
  return { data: 'success' }
}

// POST /auth/login -> { id, role, name, token }
export async function checkuser(loginInfo) {
  const { data } = await apiClient.post('/auth/login', loginInfo)
  return { data }
}
