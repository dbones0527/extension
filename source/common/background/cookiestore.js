"use strict"

const platform = require("../libraries/platform").platform

const cookie = require("cookie")

const parseResponseHeaderStrictTransportSecurity = require("../libraries/hsts/hsts").parseResponseHeaderStrictTransportSecurity

// Initialize the cookie database upon extension installation

const urlPopup = window.location.origin + "/pages/popup/popup.html"

// TODO: make an actual datasructure.
var cookieDatabase = {"example":"example"}


/* Structure of tabObservations is as follows:
	tabObservations is a dictionaty with keys tabId and values
		objects:	originUrl (string)
					observations - array of arrays of observations
*/
var tabObservations = {}

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
							console.log("Popup open: Security", tabObservations)
							sendResponse(tabObservations[message.tab])
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
	 * Remembers observations about tabs (pages)
	 */
	function rememberTabObservation(request, observation){
		const tabId = request.tabId, originUrl = request.originUrl, resource = request.url, parentFrameId = request.parentFrameId
//		console.log("New observation", request)
		// if no record exists, create one; if record is tied to different origin, assume it is a different page
		// TODO: is the above assumption correct for, e.g., SPA?
		const newPage = false//typeof tabObservations[tabId] === "object" && parentFrameId !== -1 && tabObservations[tabId].originUrl !== originUrl
		if (tabObservations[tabId] === undefined || newPage)
			tabObservations[tabId] = {originUrl: originUrl, observations:{}}

		var resourceHost = new URL(resource).host
		if (tabObservations[tabId].observations[resourceHost] === undefined)
			tabObservations[tabId].observations[resourceHost] = []
		tabObservations[tabId].observations[resourceHost].push(observation)
//		console.log("New observation logged", tabObservations)
	}

	/*
	 * Observe the Cookie header containing cookies being sent to the server
	 */
	function watchCookiesSent(details){
//		console.log("Request")
		var observations = []

		const protocol = new URL(details.url).protocol
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name === "Cookie") {
				const parsed = cookie.parse(details.requestHeaders[i].value)

				observations.push({type: "Cookie", content: "Cookie sent: " + details.requestHeaders[i].value})

/*				if (protocol === "http:" && (cookieDatabase[name] === undefined || cookieDatabase[name].secureOrigin === true)){
					console.log("LEAK", name, value, parsed)
				}
*/
				break
			}
		}

		rememberTabObservation(details, observations)
//		console.log("Request processed")
		return {requestHeaders: details.requestHeaders}
	}

	/*
	 * Observe the Set-Cookie header in response from the server
	 */
	// TODO: Difference between "set-cookie" and "Set-Cookie"
	// TODO: support protocols other than HTTP(S)
	function watchResponse(details){

//		console.log("Response")
		var observations = []

		// Get additional parameters
		const protocol = new URL(details.url).protocol
		for (var i = 0; i < details.responseHeaders.length; ++i) {
			const headerName = details.responseHeaders[i].name.toLowerCase()
			const headerValue = details.responseHeaders[i].value
			switch (headerName){
				case "set-cookie":
					const name = headerValue.substring(0, headerValue.indexOf("="))
					observations.push({type: "Cookie", content: "Cookie set: "+name})
					cookieDatabase[name] = {secureOrigin: protocol === "https:", httpOnly: true}
					break

				case "strict-transport-security":
					var hstsAttributes = parseResponseHeaderStrictTransportSecurity(headerValue)
					observations.push({type: "HSTS", content: [headerValue, hstsAttributes]})
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
					observations.push({type: "CSP", content: headerValue})
					break
				case "x-content-security-policy":
					// fallthrough
				case "x-webkit-csp":
					const message = "CSP Information: " + details.responseHeaders[i].name + " is deprecated and is known to cause problems. https://content-security-policy.com/111"
					observations.push({type: "Warning", content: message})
					break
				default:
					// Header not interesting
			}
		}
		rememberTabObservation(details, observations)
//		console.log ("Observations", details, observations)
//		console.log("Response processed")
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
