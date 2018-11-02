"use strict"

/*
 * "Libraries" used by the background
 * Ideally, these would be generic external libraries, but I didn't find them
 * TODO: Separate this into a module
 * TODO: Webpack https://www.reddit.com/r/webdev/comments/3rdwll/npm_makes_no_sense_to_me/
 */

/*
 * Parse HTTP Strict Transport Security response header
 * @param   value - string from the header
 * @returns object {"max-age": non-negative int, "includeSubDomains": boolean, "preload": boolean}
 */
function parseResponseHeaderStrictTransportSecurity (headerValue){
	var parsedAttributes = {"maxAge": 0, "includeSubDomains": false, "preload": false}
	const attributes = headerValue.split(";")
	for (var attribute of attributes){
		attribute = attribute.trim().toLowerCase()
		if (attribute === "")
			continue
		if (attribute === "includesubdomains"){
			parsedAttributes.includeSubDomains = true
		} else
		if (attribute === "preload"){
			parsedAttributes.preload = true
		} else
		if (attribute.startsWith("max-age")){
			var value = attribute.substr(attribute.indexOf('=')+1)
			if (value[0] === '"' && value.slice(-1) === '"')
				value = value.slice(1, -1)
			// TODO: handle errors and negative ints
			parsedAttributes.maxAge = Number(value)
		} else {
			// ignore everything else, as per RFC 6797
			console.log("ATENTION: Parsing HSTS header, unexpected attribute '" + attribute + "' in header '" + headerValue + "'")
		}
	}
	return parsedAttributes
}

/*
 * End of "Libraries"
 */

// Initialize the cookie database upon extension installation

const platform = chrome

const urlPopup = window.location.origin + "/pages/popup/popup.html"

// TODO: make an actual datasructure.
var cookieDatabase = {"example":"example"}

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

	// Listen for incomming messages form other pages (popup)
	platform.runtime.onMessage.addListener(function(message, sender, sendResponse){
/*	sender.envType takes on useful values "content_child" and "addon_child" */
		switch (sender.url){
			case urlPopup:
				if(message.popupOpen === true) {
					console.log(message)
					switch(message.popupTab){
						case "general":
							console.log("Popup open: General")
							break
						case "security":
							console.log("Popup open: Security")
							sendResponse(cookieDatabase)
							break
						default:
							console.log("Error")
					}
				}
				if(message.popupOpen === false) {
					console.log("Popup closed", sender, message)
				}
				break
			default:
				console.log("Unknown message", message, sender)
		}
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
//		console.log("Request", details)

		const protocol = new URL(details.url).protocol
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name === "Cookie") {
				const cookies = details.requestHeaders[i].value.split("; ")
				for (var cookie of cookies){
					// Split the cookie in name and value
					const index = cookie.indexOf("=")
					const name = cookie.substr(0, index)
					const value = cookie.substr(index + 1)

					if (protocol === "http:" && (cookieDatabase[name] === undefined || cookieDatabase[name].secureOrigin === true)){
						console.log("LEAK", name, value, cookie)
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
	function watchResponse(details){

//		console.log("Response", details)

		// Get additional parameters
		const protocol = new URL(details.url).protocol
		for (var i = 0; i < details.responseHeaders.length; ++i) {
			const headerName = details.responseHeaders[i].name.toLowerCase()
			const headerValue = details.responseHeaders[i].value
			switch (headerName){
				case "set-cookie":
					const name = headerValue.substring(0, headerValue.indexOf("="))
// Options:
// Better: https://www.npmjs.com/package/cookie
// Alternative: https://www.npmjs.com/package/set-cookie-parser
					console.log("Cookie set: ", name)
					cookieDatabase[name] = {secureOrigin: protocol === "https:", httpOnly: true}
					break

				case "strict-transport-security":
					var hstsAttributes = parseResponseHeaderStrictTransportSecurity(headerValue)
					console.log("HSTS", headerValue, hstsAttributes)
					break
// Options: did not find any, had to write my own
				case "content-security-policy":
// Options:
// https://www.npmjs.com/package/content-security-policy-parser
//   This one has issues with "block-all-mixed-content", which is important for us https://github.com/helmetjs/content-security-policy-parser/issues/1
//
// https://www.npmjs.com/package/csp-serdes
// Looks abandoned, but might be useful
//
// https://www.npmjs.com/package/csp-parse
// Parses just CSP keys, but not values/directives
//
// https://www.npmjs.com/package/makestatic-parse-csp
// Don't know how it works
					//upgrade-insecure-requests
					console.log("CSP", headerValue)
					break
				case "x-content-security-policy":
				case "x-webkit-csp":
					console.log("CSP Information: " + details.responseHeaders[i].name + " is deprecated and is known to cause problems. https://content-security-policy.com/111")
					break
				default:
					// Header not interesting
			}
		}

		return {responseHeaders: details.responseHeaders}
	}

	function logError(details){
		console.log("Network error, e.g. other extension blocked")
	}

	platform.webRequest.onBeforeSendHeaders.addListener (watchCookiesSent,
		{urls: urls}, ["blocking", "requestHeaders"])

	platform.webRequest.onHeadersReceived.addListener (watchResponse,
		{urls: urls}, ["blocking", "responseHeaders"])

	platform.webRequest.onErrorOccurred.addListener(logError, {urls: urls})
}

function recordCookieChange(/*object*/ changeInfo){
	platform.storage.local.set({last: changeInfo.cookie, lastReason: changeInfo.cause})
}





console.log(parseResponseHeaderStrictTransportSecurity("max-age=31536000"))


console.log(parseResponseHeaderStrictTransportSecurity("max-age=15768000 ; includeSubDomains"))

console.log(parseResponseHeaderStrictTransportSecurity("max-age=\"31536000\""))
console.log(parseResponseHeaderStrictTransportSecurity("max-age=0"))
console.log(parseResponseHeaderStrictTransportSecurity("max-age=0; includeSubDomains"))
