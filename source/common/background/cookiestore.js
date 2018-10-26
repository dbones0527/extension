"use strict";

// Initialize the cookie database upon extension installation

const platform = chrome;

// TODO: make an actual datasructure.
var cookieDatabase = {}

var cookieObservations = {}

/*
 * Prepare datastructures of the newly installed extension
 */
platform.runtime.onInstalled.addListener (function() {
	// Setup default extension settings 
	platform.storage.local.set({DevTools: true})

	// Setup Cookies change listener
	// TODO: what if user gives permission later?
	platform.permissions.contains({permissions:["cookies"]}, function(result){
		if (result)
			platform.cookies.onChanged.addListener(recordCookieChange)
	})

	// Setup webRequest listener
	platform.permissions.contains({permissions:["webRequestBlocking"]}, function(result){
		if (result)
			onPermissionWebRequestGranted()
	})
})


/*
 * Observe the network activity around coookies
 */
function onPermissionWebRequestGranted(){
	const urls = ["http://*/*", "https://*/*"]

	/*
	 * Observe the Cookie header containing cookies being sent to the server
	 */
	function watchCookiesSent(details){
		const protocol = details.url.substring(0, details.url.indexOf("://"))
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name === "Cookie") {
				const cookies = details.requestHeaders[i].value.split("; ")
				for (var cookie of cookies){
					// Split the cookie in name and value
					const index = cookie.indexOf("=")
					const name = cookie.substr(0, index)
					const value = cookie.substr(index + 1)

					if (protocol === "http" && (cookieDatabase[name] === undefined || cookieDatabase[name].secureOrigin === true)){
						console.log("LEAK", name)
					}
//					console.log("Cookie sent: ", cookie, name, value)
//					if (details.initiator.startsWith
				}
//				details.requestHeaders.splice(i, 1);
				break
			}
		}
		return {requestHeaders: details.requestHeaders}
	}

	/*
	 * Observe the Set-Cookie header in response from the server
	 */
	// TODO: Difference between "set-cookie" and "Set-Cookie"
	// TODO: support protocols other than HTTP(S)
	function watchCookiesSet(details){
//		console.log(details)

		// Get additional parameters
		const protocol = details.url.substring(0, details.url.indexOf("://"))
		for (var i = 0; i < details.responseHeaders.length; ++i) {
			if (details.responseHeaders[i].name === "set-cookie"){//"Set-Cookie") {
				const value = details.responseHeaders[i].value
				const name = value.substring(0, value.indexOf("="))
					
				console.log("Cookie set: ", name)
				cookieDatabase[name] = {secureOrigin: protocol === "https", httpOrigin: true}
			}
		} /*else {
				console.log(details.responseHeaders[i].name)
			}*/
		return {responseHeaders: details.responseHeaders}
	}

	platform.webRequest.onBeforeSendHeaders.addListener (watchCookiesSent,
		{urls: urls}, ["blocking", "requestHeaders"])

	platform.webRequest.onHeadersReceived.addListener (watchCookiesSet,
		{urls: urls}, ["blocking", "responseHeaders"])
}

function recordCookieChange(/*object*/ changeInfo){
	chrome.storage.local.set({last: changeInfo.cookie, lastReason: changeInfo.cause})
}
