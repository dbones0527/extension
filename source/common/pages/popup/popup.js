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

const mainMenuConsequences = document.getElementById ("main-menu-consequences")
const mainMenuMonitoring = document.getElementById ("main-menu-monitoring")
const mainMenuSharing = document.getElementById ("main-menu-sharing")
const mainMenuSecurity = document.getElementById ("main-menu-security")

const detailsDefault = document.getElementById ("details-default")

const detailsConsequences = document.getElementById ("details-consequences")
const detailsMonitoring = document.getElementById ("details-monitoring")
const detailsSharing = document.getElementById ("details-sharing")
const detailsSecurity = document.getElementById ("details-security")

/*
 * For debug purposes only. This displays the "message" within the UI.
 */
function debugMessage(message){
	var div = document.createElement("DIV")
	div.innerText = message
	document.body.appendChild(div)
}


document.addEventListener("DOMContentLoaded", function() {

	// When main menu item is clicked, open the corresponding page
	mainMenu.addEventListener("click", function(evt) {
		var elem = evt.target
		while (elem !== undefined && elem !== null){
			if (elem.classList !== undefined && elem.classList.contains("main-menu-item")){
				// Found the main-menu-item
				mainMenuConsequences.classList.remove("main-menu-item--active")
				mainMenuMonitoring.classList.remove("main-menu-item--active")
				mainMenuSharing.classList.remove("main-menu-item--active")
				mainMenuSecurity.classList.remove("main-menu-item--active")
				elem.classList.add("main-menu-item--active")

				detailsDefault.classList.remove("details-item--active")
				detailsConsequences.classList.remove("details-item--active")
				detailsMonitoring.classList.remove("details-item--active")
				detailsSharing.classList.remove("details-item--active")
				detailsSecurity.classList.remove("details-item--active")

				const selection = elem.id.substring("main-menu-".length)
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
				const list = document.getElementById("details-security-list")

				// TODO: avoid complete list re-creation,
				// since it looses information about open and closed sublists

				// create the new list
				var listNew = list.cloneNode(false)
				for (const host in information.observations){
					var elem = document.createElement("LI")
					elem.innerHTML = host
					listNew.appendChild(elem)
				}
				// show the new list
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