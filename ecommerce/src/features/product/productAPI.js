import { apiClient } from '../../app/apiClient'

// GET /products/:id — single product for the detail page
export async function fetchProductById(id) {
  const { data } = await apiClient.get(`/products/${id}`)
  return { data }
}

// POST /products/ — admin creates a product
export async function createProduct(product) {
  const { data } = await apiClient.post('/products/', product)
  return { data }
}

// PATCH /products/:id — admin updates a product.
// NOTE: function name keeps the original `upadteProduct` typo — callers/slice
// import it by that name; renaming is a separate rename pass, not Phase E.
export async function upadteProduct(update) {
  const { data } = await apiClient.patch(`/products/${update.id}`, update)
  return { data }
}

// GET /products?<filter><sort><pagination> — catalog list with multi-value
// category/brand filters; total count comes from the X-Total-Count header.
export async function fetchProductsByFilter(filter, sort, pagination, admin) {
  let queryString = ''
  // Category — supports multiple selected values (comma-joined).
  if (filter.category && filter.category.length > 0) {
    queryString += `category=`
    filter.category.forEach((categoryValue) => {
      queryString += `${categoryValue},`
    })
    queryString += `&`
  }
  // Brand — same multi-value handling.
  if (filter.brand && filter.brand.length > 0) {
    queryString += `brand=`
    filter.brand.forEach((brandValue) => {
      queryString += `${brandValue},`
    })
    queryString += `&`
  }
  for (let key in sort) {
    queryString += `${key}=${sort[key]}&`
  }
  for (let key in pagination) {
    queryString += `${key}=${pagination[key]}&`
  }
  if (admin) {
    queryString += `admin=true`
  }
  const { data, headers } = await apiClient.get(`/products?${queryString}`)
  const totalItems = headers.get('X-Total-Count')
  return { data: { products: data, totalItems: +totalItems } }
}

// GET /categories
export async function fetchCategory() {
  const { data } = await apiClient.get('/categories')
  return { data }
}

// GET /brands
export async function fetchBrands() {
  const { data } = await apiClient.get('/brands')
  return { data }
}
