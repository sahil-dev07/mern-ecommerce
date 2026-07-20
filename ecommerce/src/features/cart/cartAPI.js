import { apiClient } from '../../app/apiClient'

// POST /cart — add an item to the cart
export async function addToCart(item) {
  const { data } = await apiClient.post('/cart', item)
  return { data }
}

// GET /cart?user=:id — all cart items for a user
export async function fetchItemsByUserId(userId) {
  const { data } = await apiClient.get(`/cart?user=${userId}`)
  return { data }
}

// PATCH /cart/ — update a cart item (quantity)
export async function updateCart(update) {
  const { data } = await apiClient.patch('/cart/', update)
  return { data }
}

// DELETE /cart?product=&user= — remove one item. Server body is ignored; the
// slice only needs the removed product id to splice it out of state.
export async function deleteItemFromCart({ productId, userId }) {
  await apiClient.delete(`/cart?product=${productId}&user=${userId}`)
  return { data: { id: productId } }
}

// Empty the cart: fetch the user's items, then delete each. Client-side loop —
// there's no bulk-delete endpoint.
export async function resetCart(userId) {
  const response = await fetchItemsByUserId(userId)
  const items = response.data
  for (let item of items) {
    await deleteItemFromCart({ productId: item.product.id, userId })
  }
  return { status: 'success' }
}
