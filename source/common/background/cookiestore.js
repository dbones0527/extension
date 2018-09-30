"use strict";

// Initialize the cookie database upon extension installation

/*
 * Prepare datastructures of the newly installed extension
 */
chrome.runtime.onInstalled.addListener (function() {
	// Setup default extension settings 
	chrome.storage.local.set({DevTools: true});
//	if (browser.permissions.contains({permissions:["cookies"]})
//		chrome.cookies.onChanged.addListener(recordCookieChange));
//	if (browser.permissions.contains({permissions:["webRequest"]})
//		chrome.cookies.onChanged.addListener(recordCookieChange))
});

function recordCookieChange(/*object*/ changeInfo){
	chrome.storage.local.set({last: changeInfo.cookie, lastReason: changeInfo.cause});
}
