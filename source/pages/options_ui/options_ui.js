"use strict"

/*
 * For debug purposes only. This displays the "message" within the UI.
 */
function debugMessage(message){
  //console.log(message)
  const div = document.createElement("DIV")
  div.innerText = message
  document.body.appendChild(div)
}

/*
 * Initialize the Options UI page.
 * Attach all the click handlers, as soon as the page (Options UI) is loaded.
 * Display the current settings.
 */
document.addEventListener("DOMContentLoaded", () => {
  const devTools   = document.getElementById("devTools")
  const webRequest = document.getElementById("webRequest")
  const darkStyle  = document.getElementById("darkStyle")

  // Attach all the click handlers
  devTools.addEventListener  ("click", choiceHandlerDevTools)
  webRequest.addEventListener("click", choiceHandlerWebRequest)
  darkStyle.addEventListener ("click", choiceHandlerDarkStyle)

  // Display current settings
  platform.storage.local.get(["devTools", "webRequest", "darkStyle"], (result) => {
    devTools.checked   = result.devTools
    webRequest.checked = result.webRequest
    darkStyle.checked  = result.darkStyle
    if (result.darkStyle)
      document.body.classList.add("dark")
  })

  /*
  platform.permissions.contains({permissions:["webRequest"]}, (yes) => {
    webRequest.checked = yes
  })
  */
  platform.permissions.getAll((/* Permissions */ permissions) => {
    debugMessage("Obtained permissions: "+ permissions.permissions + permissions.origins)
    const permissionsLength = permissions.permissions.length
    for (let i = 0; i < permissionsLength; i++) {
      switch (permissions.permissions[i]){
        case "webRequestBlocking":
          webRequest.checked = true
          break
        /* TODO: add every optional permission here */
      }
    }
    debugMessage("Obtained origins: " + permissions.origins)
  })

})

/* TODO: create a function that would validate proposed origin format and/or rewrite it 
*/

/*
 * Process user's reques to enable/disable WebRequest integration.
 * If user disables integration, revoke the WebRequest permission.
 * If user enables integration, ask for the permission (handle rejections accordngly).
 * Chrome Docs say that "After a permission has been removed, calling permissions.request() usually adds the permission back without prompting the user." Source: https://developer.chrome.com/apps/permissions
 */
function choiceHandlerWebRequest(evt){
  const checked = evt.target.checked
  platform.storage.local.set({webRequest: checked})
  if (checked){
    // WebRequest integration requested
    platform.permissions.request({
      permissions: ["webRequestBlocking"]
      }, (granted) => {
        // The callback argument will be true if the user granted the permissions.
        if (granted) {
          // Permission is granted
          debugMessage("WebRequest permission granted")
        } else {
          // Permission is declined
          debugMessage("ERROR: WebRequest permission refused")
        }
    })
  } else {
    // WebRequest integration disabled
    // Remove permission
    platform.permissions.remove ({
      permissions: ["webRequestBlocking"]
      }, (removed) => {
        if (removed) {
          // The permissions have been removed.
          debugMessage("WebRequest permission removed")
        } else {
          // The permissions have not been removed (e.g., you tried to remove
          // required permissions).
          debugMessage("ERROR: WebRequest permission not removed")
        }
    })
  }
}

/* 
 * Record the user's preference on whether or not to display Developer Tools pane
 * Developer Tools permission can not be declared optional.
 */
function choiceHandlerDevTools(evt){
  const checked = evt.target.checked
  platform.storage.local.set({devTools: checked})
  debugMessage("devTools clicked, set to " + checked)
}

/* 
 * Record the user's preference on whether or not to display Developer Tools pane
 * Developer Tools permission can not be declared optional.
 */
function choiceHandlerDarkStyle(evt){
  const checked = evt.target.checked
  platform.storage.local.set({darkStyle: checked})
  debugMessage("darkStyle clicked, set to " + checked)
  if (checked)
    document.body.classList.add("dark")
  else
    document.body.classList.remove("dark")
}