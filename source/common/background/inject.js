// This code is executed in the background context
// source: https://stackoverflow.com/questions/9862182/on-page-load-event-in-chrome-extensions
//         https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/executeScript

// Listen for the navigation event
chrome.webNavigation.onCompleted.addListener (function(details) {
	// Execute the context script in its own context with "clean DOM"
	chrome.tabs.executeScript(details.tabId, {
		file: "/content_scripts/inject.js"
	});
});