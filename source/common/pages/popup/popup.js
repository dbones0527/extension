"use strict";

const mainMenu = document.getElementById("main-menu")

const detailsMonitoring = document.getElementById ("details-monitoring")
const detailsSharing = document.getElementById ("details-sharing")
const detailsProtection = document.getElementById ("details-protection")


/*
 * For debug purposes only. This displays the "message" within the UI.
 */
function debugMessage(message){
	var div = document.createElement("DIV");
	div.innerText = message;
	document.body.appendChild(div);
}

debugMessage("hi");


document.addEventListener("DOMContentLoaded", function() {
	debugMessage("hi");

	mainMenu.addEventListener("click", function(evt) {
		var elem = evt.target
		while (elem !== undefined && elem !== null){
			if (elem.classList !== undefined && elem.classList.contains("main-menu-item")){
				// Found the main-menu-item
				detailsMonitoring.style.display = "none"
				detailsSharing.style.display = "none"
				detailsProtection.style.display = "none"
				const id = elem.id
				switch (id){
					case "main-menu-monitoring":
						detailsMonitoring.style.display = "block"
						break
					case "main-menu-sharing":
						detailsSharing.style.display = "block"
						break
					case "main-menu-protection":
						detailsProtection.style.display = "block"
						break
				}
				debugMessage("found" + id)
			}
			elem = elem.parentNode
		}
	})
})