// This code is executed in the context of the window

var injectionSuccessful = true

console.log("Injection completed, try logging the variable injectionSuccessful")

function sendMessage(message){
	var event = new CustomEvent("cookie_message", {detail: message})
	document.dispatchEvent(event)
}

/*
 * Function processing cookie during retreival
 */
function processCookieString(cookieString){
	console.log("Cookie read: ", cookieString)
	sendMessage({"event": "read"})
	return cookieString
}

/*
 * Function processing cookie during assignment
 */
function processSetCookieStr(cookieString){
	console.log("Cookie set: ", cookieString)
	sendMessage({"event": "write", "cookie": cookieString})
	return cookieString
}

/*
 * Wedge custom cookie handlers in regular setters and getters
 */
var cookieGetter = document.__lookupGetter__("cookie").bind(document)
var cookieSetter = document.__lookupSetter__("cookie").bind(document)

Object.defineProperty (document, "cookie", {
	get: function() {
		return processCookieString (cookieGetter())
	},

	set: function(cookieString) {
		return cookieSetter (processSetCookieStr(cookieString))
	}
})
