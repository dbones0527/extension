"use strict"

const platform = require("../libraries/platform").platform

const cookie = require("cookie")

const parseResponseHeaderStrictTransportSecurity = require("../libraries/hsts/hsts").parseResponseHeaderStrictTransportSecurity

const thirdparty = require("../libraries/thirdparty/thirdparty").thirdparty

// Initialize the cookie database upon extension installation

const urlPopup = window.location.origin + "/pages/popup/popup.html"

// TODO: make an actual datasructure.
var cookieDatabase = {"example":"example"}

/* Structure of tabObservations is as follows:
	tabObservations is a dictionaty with keys tabId and values objects
		originUrl (string) - sanity check that page is correct
		domains - a dictionary with keys domains and values objects
			thirdparty (boolean) - if this should be displayed on "Primary resources" or "Third-party resources"
				this is assigned when record is created
			status (string)
				this is assigned/updated when record is requested by UI
				status has one of the following values:
					"secure"   -- domain is already protected, e.g. by HSTS or CSP
					"enabled"  -- we protect vulnerable domain
					"disabled" -- we let vulnerable domain be vulnerable
					"insecure" -- domain does not support HTTPS (hopeless case)
				// reason - string explanation, to be put on tooltip CSP HSTS
			cookies - dictionary of cookies with key cookie name and value object
				(it is summary to be displayed in the popup)
			events - all things that ever happened
*/
var tabObservations = {}

// Disctionary with keys domains and values the current HSTS record
// TODO: remember time of record creation
var hstsObservations = {}

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
					switch(message.popupSection){
						case "general":
							console.log("Popup open: General")
							break
						// Prepare security report
						case "security":
							console.log("Popup open: Security, preparing report")
							let report = tabObservations[message.tabId]
							console.log("REPORT BEFORE", report)
							console.log(hstsObservations)
							for (const domain in report.domains){
								// Update domain status
								switch(report.domains[domain].status){
									case "secure":
									case "disabled":
									case "insecure":
									case null:
										// Need to update security assessment
										// TODO: which check CSP and differentiate between "disabled" and "insecure"
										// REFACTOR: Move to "library"?
										var status = null

										// Check HSTS
										const subDomains = domain.split(".")
										const numSubDomains = subDomains.length
										var currSubDomain = ""
										for (var i=1; i<=numSubDomains; i++){
											// Update subdomain
											currSubDomain = subDomains[numSubDomains-i] + currSubDomain
											// Check against the HSTS records
											if (hstsObservations[currSubDomain] !== undefined && hstsObservations[currSubDomain].content.maxAge > 0){
												// TODO: take into account time of record creation
												// TODO: take into account consistency
												// TODO: take into account includeSubdomains directve if currSubDomain !== domain
												// TODO: take into account preload list
												status = "secure"
											}
											console.log(domain, subDomains, currSubDomain, hstsObservations[currSubDomain])
											// Prepare for the next iteration
											currSubDomain = "." + currSubDomain
										}
										// Check CSP
										// TODO!
										report.domains[domain].status = status
										break


									case "enabled":
										// Nothing to do, security assessment does not affect anything
										break
									default:
										console.log ("ERROR: Unexpected status for " + domain +" while preparing report.", report[domain])
										break
								}
							}
							console.log("Popup open: Security, sending report", report)
							sendResponse(report)
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
	 * TODO: make this into a Promise
	 * TODO: avoid passing `request` (pick out only the necessary parts in caller)
	 */
	function rememberTabObservation(request, observations){
		const tabId = request.tabId, originUrl = request.originUrl, resource = request.url, parentFrameId = request.parentFrameId
		// if no record exists, create one; if record is tied to different origin, assume it is a different page
		// TODO: is the above assumption correct for, e.g., SPA?
		const newPage = false// parentFrameId !== -1 && tabObservations[tabId].originUrl !== originUrl
		if (tabObservations[tabId] === undefined || newPage)
			tabObservations[tabId] = {originUrl: originUrl, domains:{}}

		var resourceDomain = new URL(resource).hostname
		if (tabObservations[tabId].domains[resourceDomain] === undefined){
			// Determine whether domain is third-party
			// TODO: find library or improve own implementation
			const originDomain = new URL(originUrl).hostname
			const thirdparty_ = thirdparty(originDomain, resourceDomain)

			tabObservations[tabId].domains[resourceDomain] = {thirdparty: thirdparty_, status: null, events: []}
		}
		tabObservations[tabId].domains[resourceDomain].events.push(observations)
		for (var observation of observations){
			switch (observation.type){
				case "HSTS":
					// TODO: Is consistency critera good?
					if (hstsObservations[resourceDomain] === undefined){
						// this is first HSTS header encountered
						hstsObservations[resourceDomain] = {
							consistent: true,
							content: observation.content,
							createdTime: null // TODO: remember time
						}
					} else {
						// this domain already has HSTS policy
						if (hstsObservations[resourceDomain] && hstsObservations[resourceDomain].maxAge !== observation.content)
							hstsObservations[resourceDomain].consistent = false
						hstsObservations[resourceDomain].content = observation.content
						hstsObservations[resourceDomain].createdTime = null // TODO: remember time
					}
					break
				case "CSP":
					break
				default:
					console.log("ERROR: Unhandled observation", observation)
			}
		}
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

				for (const cookieName in parsed){
					if (protocol === "http:" && (cookieDatabase[cookieName] === undefined || cookieDatabase[cookieName].secureOrigin === true)){
						observations.push({type: "Cookie", content: "Cookie leak: " + cookieName + "=" + parsed[cookieName]})
					}
				}

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
		const url = new URL(details.url).protocol
		for (var i = 0; i < details.responseHeaders.length; ++i) {
			const headerName = details.responseHeaders[i].name.toLowerCase()
			const headerValue = details.responseHeaders[i].value
			switch (headerName){
				case "set-cookie":
					const name = headerValue.substring(0, headerValue.indexOf("="))
					observations.push({type: "Cookie", content: "Cookie set: "+name})
					cookieDatabase[name] = {secureOrigin: url.protocol === "https:", httpOnly: true}
					break

				case "strict-transport-security":
					// Remember HSTS header for later reference in the popup
					// Parsing library options: did not find any, had to write my own
					var hstsAttributes = parseResponseHeaderStrictTransportSecurity(headerValue)
					observations.push({type: "HSTS", content: hstsAttributes})
					break

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
					// These are predecessors to HSTS. Although they are still supported by modern browsers, some bugs are known.
					// We ignore them in desiding host security status, and instead display a warning.
					// In practice, I haven't seen these ever used, so we don't waste time on them.
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
