"use strict";

const platform = chrome

// Notify other pages (background) that popup is open
platform.runtime.sendMessage({popupOpen: true, popupTab: "general"})

/*
TODO: uncomment and figure out source of warnings
window.addEventListener("unload", function(evt){
	platform.runtime.sendMessage({popupOpen: false})
	return true
})*/

const mainMenu = document.getElementById("main-menu")

const mainMenuBroken = document.getElementById ("main-menu-broken")
const mainMenuMonitoring = document.getElementById ("main-menu-monitoring")
const mainMenuSharing = document.getElementById ("main-menu-sharing")
const mainMenuSecurity = document.getElementById ("main-menu-security")

const detailsDefault = document.getElementById ("details-default")

const detailsMonitoring = document.getElementById ("details-monitoring")
const detailsSharing = document.getElementById ("details-sharing")
const detailsSecurity = document.getElementById ("details-security")
const detailsBroken = document.getElementById ("main-menu-broken")

/*
 * For debug purposes only. This displays the "message" within the UI.
 */
function debugMessage(message){
	var div = document.createElement("DIV")
	div.innerText = message
	document.body.appendChild(div)
}

/* Create nested list */
function nestedList(information){
	function listEdit(evt) {
		var elem = evt.target
		if (elem.nodeName === "BUTTON"){
			var editable = elem.parentNode.getElementsByTagName("A")[0]
			editable.contentEditable="true"
			editable.focus()
		}
		console.log("jhhvhvhjvvh")
	}

	// make sure object is well-formed
	if (information === null || information === undefined) {
		return false
	}

	if (typeof information === "string" || typeof information === "number"){
		var elem = document.createElement("LI")
		return elem
	}

	if (typeof information !== "object")
		return

	var list = document.createElement("UL")
	list.addEventListener("click", listEdit)

	function createElement(label_text, editable){
		var elem = document.createElement("LI")
		var label = document.createElement("A")
		label.innerText = label_text
		elem.appendChild(label)
		if (editable !== false){
			var btn = document.createElement("BUTTON")
			btn.innerText = "edit"
			elem.appendChild(btn)
		}
		return elem
	}
	console.log("List: " + information)
	// typeof [][Symbol.iterator] === "function"
	if (typeof information[Symbol.iterator] === "function"){
		console.log("List:  === ")
		for (const info of information){
			console.log("List:  === for ")
			var elem = createElement(info)
			list.appendChild(elem)
		}
	} else {
		// object is not iterable, e.g. it is a dictionary
			console.log("List:  !==")
		for (const info in information){
			console.log("List:  !== for ")
			var elem = createElement(info)
			elem.appendChild(nestedList(information[info]))
			list.appendChild(elem)
		}
	}
	return list
}

document.addEventListener("DOMContentLoaded", function() {

	// When main menu item is clicked, open the corresponding page
	mainMenu.addEventListener("click", function(evt) {
		var elem = evt.target
		while (elem !== undefined && elem !== null){
			if (elem.classList !== undefined && elem.classList.contains("main-menu-item")){
				// Found the main-menu-item
				mainMenuBroken.classList.remove("main-menu-item--active")
				mainMenuMonitoring.classList.remove("main-menu-item--active")
				mainMenuSharing.classList.remove("main-menu-item--active")
				mainMenuSecurity.classList.remove("main-menu-item--active")
				elem.classList.add("main-menu-item--active")

				detailsDefault.classList.remove("details-item--active")
				detailsBroken.classList.remove("details-item--active")
				detailsMonitoring.classList.remove("details-item--active")
				detailsSharing.classList.remove("details-item--active")
				detailsSecurity.classList.remove("details-item--active")

				// Extract "[selection]" from "main-menu-[selection]"
				const selection = elem.id.substring("main-menu-".length)
				// Make the details of seleced section visible
				document.getElementById ("details-" + selection).classList.add("details-item--active")
				break
			} else {
				elem = elem.parentNode
			}
		}
	})

	/* Construct the "Security" details pane */
	mainMenuSecurity.addEventListener("click", function(evt){
		// TODO: live update of all information
		chrome.tabs.query({active: true, currentWindow: true }, function(activeTabs){
			const tabId = activeTabs[0].id
			console.log(activeTabs)
			const message = {popupOpen: true, popupTab: "security", tab: tabId}

			function displayCookies(information) {
				console.log("Inforinformation", information)
				const list = document.getElementById("details-security-list")

				// TODO: avoid complete list re-creation,
				// since it looses information about open and closed sublists
				const listNew = nestedList(information.observations)
				list.replaceWith(listNew)
				console.log("background script sent a response:", information)
			}

			function handleError(error) {
				console.log("Error:", error)
			}

			// Firefox:
			//		platform.runtime.sendMessage(message).then(displayCookies, handleError)

			// Chrome:
			platform.runtime.sendMessage(message,displayCookies)

		})


	})
})