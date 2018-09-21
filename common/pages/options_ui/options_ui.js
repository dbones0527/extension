"use strict";

/*
 * For debug purposes only. This displays the "message" within the UI.
 */
function debugMessage(message){
	var div = document.createElement("DIV");
	div.innerText = message;
	document.body.appendChild(div);
}

/*
 * Initialize the Options UI page.
 * Attach all the click handlers, as soon as the page (Options UI) is loaded.
 * Display the current settings.
 */
document.addEventListener("DOMContentLoaded", function () {
	const DevTools   = document.getElementById("DevTools");
	const WebRequest = document.getElementById("WebRequest");
	// Attach all the click handlers
	DevTools.addEventListener  ("click", choiceHandlerDevTools);
	WebRequest.addEventListener("click", choiceHandlerWebRequest);

	// Display current settings
/*
	DevTools.checked   = localStorage.getItem("DevTools")   === "true";
	WebRequest.checked = localStorage.getItem("WebRequest") === "true";
*/
	chrome.storage.local.get(["DevTools", "WebRequest"], function(result) {
//		debugMessage(JSON.stringify(result));
		DevTools.checked   = result.DevTools;
		WebRequest.checked = result.WebRequest;
	});
});

/*
 * Process user's reques to enable/disable WebRequest integration.
 * If user disables integration, revoke the WebRequest permission.
 * If user enables integration, ask for the permission (handle rejections accordngly).
 * Docs say that "After a permission has been removed, calling permissions.request() usually adds the permission back without prompting the user." 
 */
function choiceHandlerWebRequest(evt){
	const checked = event.target.checked;
	chrome.storage.local.set({WebRequest: checked});
	if (checked){
		// WebRequest integration requested
		chrome.permissions.request({
			permissions: ["webRequest"],
			origins: [/*"http://*", "https://*"*/]
			}, function(granted) {
				// The callback argument will be true if the user granted the permissions.
				if (granted) {
					// Permission is granted
					debugMessage("WebRequest permission granted");
				} else {
					// Permission is declined
					debugMessage("ERROR: WebRequest permission refused");
				}
		});
	} else {
		// WebRequest integration disabled
		// Remove permission
		chrome.permissions.remove ({
			permissions: ["webRequest"],
			origins: []
			}, function(removed) {
				if (removed) {
					// The permissions have been removed.
					debugMessage("WebRequest permission removed");
				} else {
					// The permissions have not been removed (e.g., you tried to remove
					// required permissions).
					debugMessage("ERROR: WebRequest permission not removed");
				}
		});
	}
}

/* 
 * Record the user's preference on whether or not to display DevTools pane
 * DevTools permission can not be declared optional.
 */
function choiceHandlerDevTools(evt){
	const checked = event.target.checked;
//	localStorage.setItem("DevTools", checked);
	chrome.storage.local.set({DevTools: checked});
	debugMessage("DevTools clicked, set to " + checked);
}