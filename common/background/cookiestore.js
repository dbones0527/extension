"use strict";

// Initialize the cookie database upon extension installation

var cookiedata = [];

/*
 * Prepare datastructures of the newly installed extension
 */
chrome.runtime.onInstalled.addListener (function() {
	// Setup default extension settings 
/*
	localStorage.setItem("DevTools", "true");
	localStorage.setItem("WebRequest", "false");
*/
	chrome.storage.local.set({DevTools: true, WebRequest: false});
});

chrome.cookies.onChanged.addListener(recordCookieChange);

function recordCookieChange(/*object*/ changeInfo){
	chrome.storage.local.set({last: changeInfo.cookie, lastReason: changeInfo.cause});
}



// storeId, origin
/*    chrome.contextMenus.create({
      "id": "sampleContextMenu",
      "title": "Sample Context Menu",
      "contexts": ["selection"]
    });
	*/
//	chrome.cookies.onChanged.addListener(function (/*object*/ changeInfo) {
/*		switch (changeInfo.OnChangedCause){
			case "evicted":
			case "expired":
			case "explicit":
			case "expired_overwrite":
			case "overwrite":
				// Cookie was updated, another "explicit" event will be generated
		}
		if (changeInfo.removed){}
		
	});
});*/