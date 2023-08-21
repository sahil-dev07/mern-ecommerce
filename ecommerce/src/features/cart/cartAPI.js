export function addToCart(item) {
  return new Promise(async (resolve) => {
    // console.log(item)
    const res = await fetch('http://localhost:8080/cart', {
      method: "POST",
      body: JSON.stringify(item),
      headers: { 'content-type': 'application/json' }
    })
    //TODO: on server it will only return relevent information
    const data = await res.json()
    resolve({ data })
  }
  );
}


// fetch items by id for cart
export function fetchItemsByUserId(UserId) {
  return new Promise(async (resolve) => {
    const response = await fetch(`http://localhost:8080/cart?user=` + UserId)
    const data = await response.json()
    // console.log(data)
    resolve({ data })
  }
  );
}

// Update cart
export function updateCart(update) {
  return new Promise(async (resolve) => {
    console.log(update)
    const res = await fetch('http://localhost:8080/cart/', {
      method: "PATCH",
      body: JSON.stringify(update),
      headers: { 'content-type': 'application/json' }
    })
    //TODO: on server it will only return relevent information
    const data = await res.json()
    resolve({ data })
  }
  );
}

// delete Item from cart
export function deleteItemFromCart({ productId, userId }) {
  return new Promise(async (resolve) => {
    // console.log(item)
    await fetch('http://localhost:8080/cart?product=' + productId + "&user=" + userId, {
      method: "DELETE",
      headers: { 'content-type': 'application/json' }
    })

    console.log("in cart api id: " + productId)
    //TODO: on server it will only return relevent information
    // const data = await res.json()
    resolve({ data: { id: productId } })
  }
  );
}

// delete Cart 
export async function resetCart(userId) {

  // get All items of user's cart and then delete each
  return new Promise(async (resolve) => {
    const response = await fetchItemsByUserId(userId)
    const items = response.data
    for (let item of items) {
      await deleteItemFromCart(item.id)
    }
    resolve({ status: 'success' })
  })

}

