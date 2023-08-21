// A mock function to mimic making an async request for data
// export function fetchAllProducts() {
//   return new Promise(async (resolve) => {
//     const response = await fetch('http://localhost:8080/products')
//     const data = await response.json()
//     // console.log(data)
//     resolve({ data })

import { END_POINT } from "../../app/constants";

//   }
//   );
// }

// fetch product by id for product details
export function fetchProductById(id) {
  return new Promise(async (resolve) => {
    // console.log("hello boy " + id)
    const response = await fetch(`http://localhost:8080/products/${id}`)
    const data = await response.json()
    // console.log(data)
    resolve({ data })

  }
  );
}

// add new product 
export function createProduct(product) {
  return new Promise(async (resolve) => {
    // console.log("hello boy " + product)
    const response = await fetch(`${END_POINT}/products/`, {
      method: 'POST',
      body: JSON.stringify(product),
      headers: { 'content-type': 'application/json' },
    })
    const data = await response.json()
    resolve({ data })

  }
  );
}

// update product 
export function upadteProduct(update) {
  return new Promise(async (resolve) => {
    const response = await fetch(`http://localhost:8080/products/${update.id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
      headers: { 'content-type': 'application/json' },
    })
    const data = await response.json()
    console.log("in API")
    resolve({ data })

  }
  );
}

export function fetchProductsByFilter(filter, sort, pagination, admin) {

  // filter: {"category":"smartphone"}
  // todo : multiple values
  let queryString = ""

  for (let key in filter) {
    const categoryValues = filter[key]
    if (categoryValues.length) {
      const lastCategoryValue = categoryValues[categoryValues.length - 1]
      queryString += `${key}=${lastCategoryValue}&`
    }
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


  return new Promise(async (resolve) => {
    const response = await fetch(`${END_POINT}/products?${queryString}`)
    const data = await response.json()
    const totalItems = await response.headers.get("X-Total-Count")
    // console.log('http://localhost:8080/products?' + queryString, 'product api')
    resolve({ data: { products: data, totalItems: +totalItems } })

  }
  );
}


// to fetch all catagories

export function fetchCategory() {
  return new Promise(async (resolve) => {
    const response = await fetch(END_POINT + '/categories')
    const data = await response.json()
    // console.log(data)
    resolve({ data })

  }
  );
}

// fetch all brands

export function fetchBrands() {
  return new Promise(async (resolve) => {
    const response = await fetch(END_POINT + '/brands')
    const data = await response.json()
    // console.log(data)
    resolve({ data })

  }
  );
}


