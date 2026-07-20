// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, etc.)
// and clears localStorage between tests so token/persist state never leaks.
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})
