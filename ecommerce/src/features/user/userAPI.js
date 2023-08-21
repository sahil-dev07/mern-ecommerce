// A mock function to mimic making an async request for data
export function fetchLoggedInUser(userId) {
  return new Promise(async (resolve) => {
    const res = await fetch('http://localhost:8080/users/' + userId)
    const data = await res.json()
    resolve({ data })
  }
  );
}

// A mock function to mimic making an async request for data
export function fetchLoggedInUserOrders(userId) {
  return new Promise(async (resolve) => {
    // console.log('http://localhost:8080/orders/user/' + userId)
    const res = await fetch('http://localhost:8080/orders/user/' + userId)
    const data = await res.json()
    resolve({ data })
  }
  );
}

// update user (address)
export function updateUser(update) {
  return new Promise(async (resolve) => {
    console.log(update)
    const res = await fetch('http://localhost:8080/users/' + update.id, {
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
