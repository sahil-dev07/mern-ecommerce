import { apiClient } from '../../app/apiClient'

// POST /orders — place an order
export async function createOrder(order) {
  const { data } = await apiClient.post('/orders', order)
  return { data }
}

// PATCH /orders/:id — admin updates order status
export async function updateOrder(order) {
  const { data } = await apiClient.patch(`/orders/${order.id}`, order)
  return { data }
}

// GET /orders?<sort><pagination> — admin order list; total count comes from the
// X-Total-Count response header (server-side pagination).
export async function fetchAllOrders(sort, pagination) {
  let queryString = ''
  for (let key in sort) {
    queryString += `${key}=${sort[key]}&`
  }
  for (let key in pagination) {
    queryString += `${key}=${pagination[key]}&`
  }
  const { data, headers } = await apiClient.get(`/orders?${queryString}`)
  const totalOrders = headers.get('X-Total-Count')
  return { data: { orders: data, totalOrders: +totalOrders } }
}
