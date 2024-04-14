import { END_POINT } from "../../app/constants";


// A mock function to mimic making an async request for data
export function createUser(userdata) {
  return new Promise(async (resolve) => {
    // console.log(userdata)
    const res = await fetch(END_POINT + '/auth/signup', {
      method: "POST",
      body: JSON.stringify(userdata),
      headers: { 'content-type': 'application/json' }
    })
    //TODO: on server it will only return relevent information
    const data = await res.json()
    resolve({ data })
  }
  );
}


export function signOut(userId) {
  return new Promise(async (resolve) => {

    //TODO: on server we will remove the session
    resolve({ data: "success" })
  }
  );
}

// A mock function to mimic making an async request for data
export function checkuser(loginInfo) {
  return new Promise(async (resolve, reject) => {

    try {

      const res = await fetch(END_POINT + '/auth/login', {
        method: "POST",
        body: JSON.stringify(loginInfo),
        headers: { 'content-type': 'application/json' }
      })

      if (res.ok) {
        const data = await res.json()
        // console.log({ data })
        resolve({ data })
      } else {
        const err = await res.json()
        reject(err)
      }

    } catch (error) {
      reject({ error })
    }

  }
  );
}
