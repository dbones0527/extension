"use strict"

// TODO: Move to platform
// List of pages on which extension is forbidden for security considerations.
// key is the URL prefix and value is the message to the user.
const restrictedPrefixes = {
	"about:": "Firefox internal page.",
	"https://addons.mozilla.org/": "Mozilla extension store (AMO) page.",
	"https://testpilot.firefox.com/": "Firefox Test Pilot page."
}

const platform = chrome

var tabId = null
var firstPartyDomain = null

platform.tabs.query({active: true, currentWindow: true }, function(activeTabs){
	tabId = activeTabs[0].id
	firstPartyDomain = (new URL(activeTabs[0].url)).hostname
	console.log(activeTabs)

	pageNothingToDo(activeTabs[0].url)

	// Notify other pages (background) that popup is open
	platform.runtime.sendMessage({popupOpen: true, popupSection: "general", tabId: tabId})
})

/* Messaging
// Firefox:
//		platform.runtime.sendMessage(message).then(handleResponse, handleError)
// Chrome:
//		platform.runtime.sendMessage(message, handleResponse)

// Handle message error
function handleError(error) {
	console.log("Error:", error)
}
*/

function pageNothingToDo(url){

	// Check the current page against all restricted pages
	for (const prefix in restrictedPrefixes)
		// this is equivalent to startsWith()
		if (url.substring(0,prefix.length) === prefix){
			// Match found, so we remove all regular content and display explanation
			const text = "This is a safe " + restrictedPrefixes[prefix] + "\nThe page is: " + url
			// Remove all content
			document.body.removeChild(document.getElementById("content"))
			// Show explanation and message
			var message = document.createElement("P")
			message.innerText = text
			document.body.appendChild(message)
			return true
		}

	// If page does not match any of the restricted page prefixes, remove message
	document.body.removeChild(document.getElementById("message"))
	return false
}

/*
TODO: uncomment and figure out source of warnings
window.addEventListener("unload", function(evt){
	platform.runtime.sendMessage({popupOpen: false})
	return true
})*/

// pointer to the button of the currwntly selected section
var activeSection = null

/*
 * For debug purposes only. This displays the "message" within the UI.
 */
function debugMessage(message){
	var div = document.createElement("DIV")
	div.innerText = message
	document.body.appendChild(div)
}

/*
 * Edit label of list entry
 */
function editLabel(evt) {
	var elem = evt.target
	// Ignore clicks outside of button
	if (elem.nodeName === "BUTTON"){
		var editable = elem.parentNode.getElementsByTagName("A")[0]
		editable.contentEditable="true"
		editable.focus()
	}
}

/*
 * Handle click on collapsable list label:
 * show/hide details and change list label decoration
 * Collapsible lists can be done with <details> and <summary>,
 * but: 1. browser support is limited
 *      2. still need JS toggle expanded/collapsed list decodation
 *         to the left of the label, aka arrow icons > or V
 */
function collapsibleList(evt){
	var target = evt.target
	// if clicked on the label A, go level up to the LI
	if (target.nodeName === "A")
		target = target.parentNode
	console.log(target)
	if (target.nodeName === "LI"){
		console.log("Stuff")
		target.classList.toggle("list-collapsible--active")
	}
}

/*
 *
 */
function securityList(information, editable){
	function createElement(label_text, editable){
		var elem = document.createElement("LI")
		var label = document.createElement("A")
		label.innerText = label_text
		elem.appendChild(label)

		// If element label is editable, create button for editing it
		if (editable !== false){
			var btn = document.createElement("BUTTON")
			btn.innerText = "edit"
			elem.appendChild(btn)
		}
		return elem
	}
	// Create list
	var list = document.createElement("UL")
	for (const domain in information){
		// Create the list element with its details
		var elem = createElement(domain, editable)
		// Assign the right CSS class to display security status icon
		const cssSecurityClass = "list-domain--" + information[domain].status
		elem.classList.add(cssSecurityClass)
		elem.classList.add("list-domain")
		list.appendChild(elem)

		// Create sublist of cookies
		var cookie_list = document.createElement("UL")
		elem.appendChild(cookie_list)

		// Display sublist of cookies
		// TODO: IMPLEMENT
		// TODO: Display cookies for higher domains?
		var entry = createElement("TODO: display cookies", editable)
		cookie_list.appendChild(entry)
	}
	return list
}

/*
 * Create nested list with editable labels (optional)
 */
/*
function nestedList(information, editable){


	// make sure object is well-formed
	if (information === null || information === undefined)
		return false

	if (typeof information === "string" || typeof information === "number"){
		var elem = document.createElement("LI")
		return elem
	}

	if (typeof information !== "object")
		return

	// Create list
	var list = document.createElement("UL")

	// Create LI element with specified label and, optionally, edit button
	function createElement(label_text, editable){
		var elem = document.createElement("LI")
		var label = document.createElement("A")
		label.innerText = JSON.stringify(label_text)
		elem.appendChild(label)
		// If element label is editable, create button for editing it
		if (editable !== false){
			var btn = document.createElement("BUTTON")
			btn.innerText = "edit"
			elem.appendChild(btn)
			elem.classList.add("list-secure")
		}
		return elem
	}
	console.log("List: " + information)
	// typeof [][Symbol.iterator] === "function"
	if (typeof information[Symbol.iterator] === "function"){
		console.log("List:  === ")
		for (const info of information){
			console.log("List:  === for ")
			var elem = createElement(info, editable)
			list.appendChild(elem)
		}
	} else {
		// object is not iterable, e.g. it is a dictionary
			console.log("List:  !==")
		for (const info in information){
			console.log("List:  !== for ")
			var elem = createElement(info, editable)
			elem.appendChild(nestedList(information[info]))
			list.appendChild(elem)
		}
	}
	return list
}
*/

document.addEventListener("DOMContentLoaded", function() {
	function displaySectionPrimary(information) {}
	function displaySectionThirdparty(information) {}
	// TODO: Do not re-create the list from scratch every time
	function displaySectionSecurity(information) {
		console.log("Inforinformation", information)
		const list = document.getElementById("details-" + "security" + "-list")

		// TODO: avoid complete list re-creation,
		// since it looses information about open and closed sublists
		const listNew = securityList(information.domains)
		listNew.classList.add("list-collapsible")
		listNew.addEventListener("click", editLabel)
		listNew.addEventListener("click", collapsibleList)

		list.replaceWith(listNew)
		listNew.id = "details-" + "security" + "-list"
	}
	function displaySectionDebugging(information) {}

	// When main menu item is clicked, open the corresponding page
	document.getElementById("main-menu").addEventListener("click", function(evt) {
		var elem = evt.target
		// Find the main-menu-item, if click occured on its child
		while (elem !== undefined && elem !== null){
			if (elem.classList !== undefined && elem.classList.contains("main-menu-item")){
				// Extract "[selection]" from "main-menu-[selection]"
				const selectionNew = elem.id.substring("main-menu-".length)

				// PREPARE THE NEWLY SELECTED SECTION TAB
				// TODO: live update of all information
				// TODO: take care of data race with tabId
				const message = {popupOpen: true, popupSection: selectionNew, tabId: tabId}

				switch(selectionNew){
					case "security":
						platform.runtime.sendMessage(message, displaySectionSecurity)
						break
					default:
						console.log("Error: section handler missing")
				}



				// SWITCH TO THE NEWLY SELECTED SECTION TAB
				// If some section was previously selected, unselect its button and hide details
				if (activeSection !== null){
					// From previously selected item remove acive label
					activeSection.classList.remove("main-menu-item--active")
					// Extract "[selection]" from "main-menu-[selection]"
					const selectionLast = activeSection.id.substring("main-menu-".length)
					document.getElementById ("details-" + selectionLast).classList.remove("details-item--active")
				}
				// Mark newly selected item active
				elem.classList.add("main-menu-item--active")
				// Make the details of seleced section visible
				document.getElementById ("details-" + selectionNew).classList.add("details-item--active")
				// Remember current selection
				activeSection = elem
				break
			} else {
				elem = elem.parentNode
			}
		}
	})
})