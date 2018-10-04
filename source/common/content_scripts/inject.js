// This code is executed in a separate context with "clean DOM"

(function() {
	// Execute the actal payload in the context of the window
	var s = document.createElement("script");
	s.src = chrome.extension.getURL("/web_accessible_resources/inject.js");
	(document.head || document.documentElement).appendChild(s);
	s.parentNode.removeChild(s);
})()