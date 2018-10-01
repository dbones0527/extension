"use strict";

/*
 * For debug purposes only. This displays the "message" within the UI.
 */
function debugMessage(message){
	console.log(message);
	var div = document.createElement("DIV");
	div.innerText = message;
	document.body.appendChild(div);
}

/* TODO: add option to remove origins */

function newOrigin(origin){
	var ul = document.getElementById("origins");
	var li = document.createElement("LI");
	li.innerText = origin;
	ul.appendChild(li);
}

/*
 * Initialize the Options UI page.
 * Attach all the click handlers, as soon as the page (Options UI) is loaded.
 * Display the current settings.
 */
document.addEventListener("DOMContentLoaded", function () {
	const DevTools      = document.getElementById("DevTools");
	const WebRequest    = document.getElementById("WebRequest");
	const newOriginForm = document.getElementById("newOriginForm");
	const originsList    = document.getElementById("origins");
	// Attach all the click handlers
	DevTools.addEventListener  ("click", choiceHandlerDevTools);
	WebRequest.addEventListener("click", choiceHandlerWebRequest);
	newOriginForm.onsubmit = function(evt) {addOrigin(evt.target.elements['newOrigin'].value);return false;};
	originsList.addEventListener("click",originsListDeleteHandler);

	// Display current settings
	chrome.storage.local.get(["DevTools"], function(result) {
		DevTools.checked   = result.DevTools;
	});

	/*
	platform.permissions.contains({permissions:["webRequest"]}, function(yes){
		WebRequest.checked = yes;
	});
	*/
	platform.permissions.getAll(function (/* Permissions */ permissions){
		debugMessage("Obtained permissions: "+ permissions.permissions + permissions.origins);
		var permissionsLength = permissions.permissions.length;
		for (var i = 0; i < permissionsLength; i++) {
			switch (permissions.permissions[i]){
				case "webRequest":
					WebRequest.checked = true;
					break;
				/* TODO: add every optional permission here */
			}
		}
		var originsLength = permissions.origins.length;
		for (var i = 0; i < originsLength; i++) {
			newOrigin(permissions.origins[i]);
		}
		debugMessage("Obtained permissions: "+permissions.origins);
	});
	
	

});

function originsListDeleteHandler(evt){
	if(evt.target && evt.target.nodeName == "LI") {
		const origin = evt.target.innerHTML
		debugMessage(origin + " was clicked");
		chrome.permissions.remove ({
			origins: [origin]
			}, function(removed) {
				if (removed) {
					// The permissions have been removed.
					debugMessage(origin + " permission removed");
					evt.target.parentNode.removeChild(evt.target);
				} else {
					// The permissions have not been removed (e.g., you tried to remove
					// required permissions).
					debugMessage("ERROR: " + origin + " permission not removed");
				}
		});
	}
}

/* TODO: create a function that would validate proposed origin format and/or rewrite it */
/* TODO: append origin to the list only if it is new. Use platform.permissions.onAdded.addListener, may be? */
function addOrigin(origin){
	debugMessage("form submitted, "+origin);
	// Origin permission request
	chrome.permissions.request({
			origins: [origin]
			}, function(granted) {
				// The callback argument will be true if the user granted the permissions.
				if (granted) {
					// Permission is granted
					debugMessage("Origin is granted, " + origin);
					newOrigin(origin);
				} else {
					// Permission is declined
					debugMessage("ERROR: Origin is refused, " + origin);
				}
		});
}

/*
 * Process user's reques to enable/disable WebRequest integration.
 * If user disables integration, revoke the WebRequest permission.
 * If user enables integration, ask for the permission (handle rejections accordngly).
 * Docs say that "After a permission has been removed, calling permissions.request() usually adds the permission back without prompting the user." 
 */
function choiceHandlerWebRequest(evt){
	const checked = evt.target.checked;
	chrome.storage.local.set({WebRequest: checked});
	if (checked){
		// WebRequest integration requested
		chrome.permissions.request({
			permissions: ["webRequest"]
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
			permissions: ["webRequest"]
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
	const checked = evt.target.checked;
//	localStorage.setItem("DevTools", checked);
	chrome.storage.local.set({DevTools: checked});
	debugMessage("DevTools clicked, set to " + checked);
}