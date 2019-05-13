// This code is executed in a separate context with "clean DOM"

const prefix = "chrome-extension://ahebiabmadaookaondjagfaedejgedlc"

// Execute the actal payload in the context of the window
const script = document.createElement("SCRIPT")
script.src = () => {return prefix + "/web_accessible_resources/inject.js" }
(document.head || document.documentElement).appendChild(script)
script.parentNode.removeChild(script)

console.info("content script executed")

document.addEventListener("cookie_message", function(event) {
  // We only accept messages from ourselves
  // if (event.source != window)
  // return
  chrome.runtime.sendMessage(event.detail)
})
