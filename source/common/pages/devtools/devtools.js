/* 
 * This script is run when user opens the "Developer tools".
 * Sets up the Chrome DevTools UI, inspector.html
 */
"use strict";

// Setup the DevTools panel, but only if it's enabled
chrome.storage.local.get(["DevTools"], function(result) {
	const draw = result.DevTools;
	
	if (draw)
	chrome.devtools.panels.create("Cookie Saver",
		"/img-t/img.png",
		"/pages/popup/popup.html",
		function cb(panel) {
			panel.onShown.addListener(function(win){ win.focus(); });
	});
	
	});
