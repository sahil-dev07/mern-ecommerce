import { configureStore } from '@reduxjs/toolkit'
import cartReducer, { fetchItemsByUserIdAsync } from './cartSlice'
import * as cartAPI from './cartAPI'

vi.mock('./cartAPI')

describe('cartSlice rejected handling', () => {
  it('a failed fetch sets status=failed + records error (no stuck loading spinner)', async () => {
    cartAPI.fetchItemsByUserId.mockRejectedValue(Object.assign(new Error('nope'), { status: 500 }))
    const store = configureStore({ reducer: { cart: cartReducer } })

    await store.dispatch(fetchItemsByUserIdAsync('u1'))

    expect(store.getState().cart.status).toBe('failed')
    expect(store.getState().cart.error).toEqual({ status: 500, message: 'nope' })
  })
})
