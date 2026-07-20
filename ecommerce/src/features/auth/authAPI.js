import { END_POINT } from "../../app/constants";



export function createUser(userdata) {
  return new Promise(async (resolve, reject) => {
    // console.log(userdata)
    const res = await fetch(END_POINT + '/auth/signup', {
      method: "POST",
      body: JSON.stringify(userdata),
      headers: { 'content-type': 'application/json' }
    })

    const data = await res.json()

    if (res.ok) {
      // console.log("resolved", data);
      resolve({ data })
    }
    else {
      // console.log("rejected ", data);
      reject({ data })
    }
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


export function checkuser(loginInfo) {
  return new Promise(async (resolve, reject) => {

    try {

      const res = await fetch(END_POINT + '/auth/login', {
        method: "POST",
        body: JSON.stringify(loginInfo),
        headers: { 'content-type': 'application/json' }
      })
      const data = await res.json()

      if (res.ok) {
        // console.log("res.ok true ", data)
        resolve({ data })
      } else {
        // console.log("Error in login authAPI", data);
        reject({ data })
      }

    } catch (error) {
      reject({ error })
    }

  }
  );
}
