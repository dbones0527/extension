// This code is executed in a separate context with "clean DOM"

const scriptPath = "web_accessible_resources/inject.js"

// Execute the actal payload in the context of the window
const scriptNode = document.createElement("SCRIPT");
scriptNode.src = chrome.runtime.getURL(scriptPath);
(document.head || document.documentElement).appendChild(scriptNode);
scriptNode.onload = () => {
//  this.remove()
}

console.info("content script executed")

document.addEventListener("cookie_message", function(event) {
  // We only accept messages from ourselves
  // if (event.source != window)
  // return
  chrome.runtime.sendMessage(event.detail)
})
