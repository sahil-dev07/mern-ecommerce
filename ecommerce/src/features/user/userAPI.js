import { apiClient } from '../../app/apiClient'

// GET /users/:id — profile of the logged-in user
export async function fetchLoggedInUser(userId) {
  const { data } = await apiClient.get(`/users/${userId}`)
  return { data }
}

// GET /orders/user/:id — the user's own order history
export async function fetchLoggedInUserOrders(userId) {
  const { data } = await apiClient.get(`/orders/user/${userId}`)
  return { data }
}

// PATCH /users/:id — update profile (addresses)
export async function updateUser(update) {
  const { data } = await apiClient.patch(`/users/${update.id}`, update)
  return { data }
}
