"use strict";

/*
 * For debug purposes only. This displays the "message" within the UI.
 */
function debugMessage(message){
	var div = document.createElement('DIV');
	div.innerText = message;
	document.body.appendChild(div);
}

/* Firefox and Chromium provide that same WebExtensions API,
 * but Chromium calls it 'chrome.cookies' (because they invented it),
 * while Firefx and Edge call it 'browser.cookies'.
 */
/* TODO: Figure out the difference between 
 * chrome.cookies vs browser.cookies vs document.cookie vs window.cookies
 */
//var platform = typeof(chrome)==='object' ? chrome : browser;
//var platform =  browser;
var platform = chrome;

document.addEventListener('DOMContentLoaded', function() {
	platform.cookies.getAll({
  domain: ".com"
}, function (cookies) {
  document.body.appendChild(createCookieTable (cookies));
});
	
});