"use strict";

const labels = ["Name", "Value", "Domain", "Path", "Expires / Max-Age",
		"HTTP", "Secure", "SameSite"];
const keys = ["name", "value", "domain", "path", "expirationDate",
		"httpOnly", "secure", "SameSiteStatus"];

	// Copied from https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/api/cookies.json
	const cookieObjectProperties = {
		"name": {"type": "string", "description": "The name of the cookie."},
		"value": {"type": "string", "description": "The value of the cookie."},
		"domain": {"type": "string", "description": "The domain of the cookie (e.g. \"www.google.com\", \"example.com\")."},
		"hostOnly": {"type": "boolean", "description": "True if the cookie is a host-only cookie (i.e. a request's host must exactly match the domain of the cookie)."},
		"path": {"type": "string", "description": "The path of the cookie."},
		"secure": {"type": "boolean", "description": "True if the cookie is marked as Secure (i.e. its scope is limited to secure channels, typically HTTPS)."},
		"httpOnly": {"type": "boolean", "description": "True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to client-side scripts)."},
		"sameSite": {"$ref": "SameSiteStatus", "description": "The cookie's same-site status (i.e. whether the cookie is sent with cross-site requests)."},
		"session": {"type": "boolean", "description": "True if the cookie is a session cookie, as opposed to a persistent cookie with an expiration date."},
		"expirationDate": {"type": "number", "optional": true, "description": "The expiration date of the cookie as the number of seconds since the UNIX epoch. Not provided for session cookies."},
		"storeId": {"type": "string", "description": "The ID of the cookie store containing this cookie, as provided in getAllCookieStores()."}
	}
		
		/* Used to print a property in the table conveniently. */
	function cookiePropertyPrint (property){
		switch (typeof property){
			case "number":
				// TODO: this is date
			case "string":
				return property;
				break;
			case "boolean":
				return property ? "✓" : "";
				break;
			case "SameSiteStatus":
				return "weird";
				break;				
			default:
				return typeof property;
				return "";
		}
	}
		
function createCookieTable (cookies){
/* TODO: caption */
	
	function createCookieTableHeader(){
		var row = tableBody.insertRow(0);

		for (var i = 0; i < labels.length; i++){
			var th = document.createElement("TH");
			th.innerHTML = labels[i];
			row.appendChild(th);
		}
	}
	function createCookieTableRow(cookie){
		var row = tableBody.insertRow(1);
		for (var i = 0; i < keys.length; i++){
			var cell = row.insertCell(i);
			cell.innerHTML = cookiePropertyPrint(cookie[keys[i]]);
		}
	}
	var table = document.createElement("TABLE");
	var tableBody = table.createTBody();
	createCookieTableHeader();
	for (var i = 0; i < cookies.length; i++)
		createCookieTableRow(cookies[i]);
	
	
	
	
tableInteractvity(document.getElementById("example"));
tableInteractvity(table);

	return table;
}



function tableInteractvity(table){
//	new TableResize(table);
	
	new TableResize(table, {distance: 0, minWidth: 30, restoreState: false, fixed: false});
	
    table.onclick = function(e) {
       e = e || event;
	   var eventEl = e.srcElement || e.target;
	   
	    // individual cell in table
	   if (eventEl.tagName === "TD" && eventEl.parentNode.tagName === "TR"){
		   var row = eventEl.parentNode;
		   eventEl.innerHTML = eventEl.cellIndex;//row.cells.indexOf(eventEl);
	   }
	   // individual column label TODO
	   if (eventEl.tagName === "DIV" && eventEl.parentNode.className === "resize-text"){
		   var row = eventEl.parentNode;
		   eventEl.innerHTML = row.cells[1].innerHTML;
	   }
	   //eventEl.innerHTML = eventEl.tagName;
//	   tablename.rows[0].cells.length;   arr.indexOf(obj)
/*       var eventEl = e.srcElement || e.target, 
           parent = eventEl.parentNode,
           isRow = function(el) {
                     return el.tagName.match(/tr/i));
                   };

       //move up the DOM until tr is reached
       while (parent = parent.parentNode) {
           if (isRow(parent)) {
             //row found, do something with it and return, e.g.
              alert(parent.rowIndex + 1); 
              return true;
           }
       }
       return false;
	   */
   };


}



//chrome.cookies.onChanged.addListener(function callback)