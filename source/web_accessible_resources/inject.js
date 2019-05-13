// This code is executed in the context of the window

var injectionSuccessful = true

console.log("Injection completed, try logging the variable injectionSuccessful")

const sendMessage = (message) => {
  const event = new CustomEvent("cookie_message", {detail: message})
  document.dispatchEvent(event)
}

/*
 * Function processing cookie during retreival
 */
const processGetCookieString = (cookieString) => {
  console.log("Cookie read: ", cookieString)
//  sendMessage({"event": "read"})
  return cookieString
}

/*
 * Function processing cookie during assignment
 */
const processSetCookieStr = (cookieString) => {
  console.log("Cookie set: ", cookieString)
//  sendMessage({"event": "write", "cookie": cookieString})
  return cookieString
}

/*
 * Wedge custom cookie handlers in regular setters and getters
 */
const cookieGetter = document.__lookupGetter__("cookie").bind(document)
const cookieSetter = document.__lookupSetter__("cookie").bind(document)

Object.defineProperty (document, "cookie", {
  get: () => {
    return processGetCookieString (cookieGetter())
  },

  set: (cookieString) => {
    return cookieSetter (processSetCookieStr(cookieString))
  }
})
