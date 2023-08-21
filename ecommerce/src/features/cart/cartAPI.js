import { END_POINT } from "../../app/constants";

export function addToCart(item) {
  return new Promise(async (resolve) => {
    // console.log(item)
    const res = await fetch(END_POINT + '/cart', {
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
    const response = await fetch(`${END_POINT}/cart?user=` + UserId)
    const data = await response.json()
    // console.log(data)
    resolve({ data })
  }
  );
}

// Update cart
export function updateCart(update) {
  return new Promise(async (resolve) => {
    // console.log(update)
    const res = await fetch(END_POINT + '/cart/', {
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
    await fetch(END_POINT + '/cart?product=' + productId + "&user=" + userId, {
      method: "DELETE",
      headers: { 'content-type': 'application/json' }
    })

    // console.log("in delete cart api  ", { productId, userId })
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
    console.log("reset cart cartapi")

    console.log("in cart reset before fetchitem call")
    const response = await fetchItemsByUserId(userId)
    const items = response.data
    console.log("In cart reset")

    for (let item of items) {
      await deleteItemFromCart({ productId: item.product.id, userId: userId })
      // console.log(item)
    }
    resolve({ status: 'success' })
  })

}

