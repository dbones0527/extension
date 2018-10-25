"use strict";

const mainMenu = document.getElementById("main-menu")

const mainMenuMonitoring = document.getElementById ("main-menu-monitoring")
const mainMenuSharing = document.getElementById ("main-menu-sharing")
const mainMenuProtection = document.getElementById ("main-menu-protection")

const detailsDefault = document.getElementById ("details-default")

const detailsMonitoring = document.getElementById ("details-monitoring")
const detailsSharing = document.getElementById ("details-sharing")
const detailsProtection = document.getElementById ("details-protection")

/*
 * For debug purposes only. This displays the "message" within the UI.
 */
function debugMessage(message){
	var div = document.createElement("DIV")
	div.innerText = message
	document.body.appendChild(div)
}

document.addEventListener("DOMContentLoaded", function() {

	mainMenu.addEventListener("click", function(evt) {
		var elem = evt.target
		while (elem !== undefined && elem !== null){
			if (elem.classList !== undefined && elem.classList.contains("main-menu-item")){
				// Found the main-menu-item
				mainMenuMonitoring.classList.remove("main-menu-item--active")
				mainMenuSharing.classList.remove("main-menu-item--active")
				mainMenuProtection.classList.remove("main-menu-item--active")
				elem.classList.add("main-menu-item--active")

				detailsDefault.classList.remove("details-item--active")
				detailsMonitoring.classList.remove("details-item--active")
				detailsSharing.classList.remove("details-item--active")
				detailsProtection.classList.remove("details-item--active")

				const selection = elem.id.substring("main-menu-".length)
				document.getElementById ("details-" + selection).classList.add("details-item--active")
				break
			} else {
				elem = elem.parentNode
			}
		}
	})
})