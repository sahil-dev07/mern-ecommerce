import { END_POINT } from './constants'

// Single owner of the auth token key. One setter (login/signup), one clearer
// (logout / 401 middleware), one reader (request() below) — keeps every
// localStorage['token'] access in exactly one module per the transport convention.
const TOKEN_KEY = 'token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Thrown on any non-2xx response so callers (thunks) can branch on `.status`
// (e.g. the 401 middleware) instead of silently resolving a garbage body.
export class ApiError extends Error {
  constructor(status, message) {
    super(message || `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}

// Core fetch wrapper: attaches Bearer + JSON headers, checks res.ok, and returns
// a normalized { data, status, headers } envelope. Throws ApiError on failure so
// errors propagate to the thunk's catch — no more swallow-inside-new-Promise.
async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const res = await fetch(`${END_POINT}${path}`, {
    method,
    headers: {
      // Only send a body content-type when there's actually a body.
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      // Attach the JWT when present; guests send no Authorization header.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Some endpoints (e.g. DELETE) return an empty body — guard JSON.parse.
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    // Prefer the server's error message when present, else the status text.
    const message = (data && (data.message || data.error)) || res.statusText
    throw new ApiError(res.status, message)
  }

  return { data, status: res.status, headers: res.headers }
}

// Verb helpers — thin sugar over request(). `headers` is exposed on the envelope
// so callers that need response headers (X-Total-Count pagination) can read them.
export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
