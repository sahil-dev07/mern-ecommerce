export function createOrder(order) {
  return new Promise(async (resolve) => {
    // console.log(order)
    const res = await fetch('http://localhost:8080/orders', {
      method: "POST",
      body: JSON.stringify(order),
      headers: { 'content-type': 'application/json' }
    })
    //TODO: on server it will only return relevent information
    const data = await res.json()
    resolve({ data })
  }
  );
}

export function updateOrder(order) {
  return new Promise(async (resolve) => {
    // console.log(order)
    const res = await fetch('http://localhost:8080/orders/' + order.id, {
      method: "PATCH",
      body: JSON.stringify(order),
      headers: { 'content-type': 'application/json' }
    })
    //TODO: on server it will only return relevent information
    const data = await res.json()
    resolve({ data })
  }
  );
}


// fetch all order
export function fetchAllOrders(sort, pagination) {
  let queryString = ''

  for (let key in sort) {
    queryString += `${key}=${sort[key]}&`
  }
  for (let key in pagination) {
    queryString += `${key}=${pagination[key]}&`
  }


  return new Promise(async (resolve) => {
    const response = await fetch('http://localhost:8080/orders?' + queryString)
    // console.log('http://localhost:8080/orders?' + queryString)
    const data = await response.json()
    const totalOrders = response.headers.get("X-Total-Count")
    resolve({ data: { orders: data, totalOrders: +totalOrders } })

  })
}