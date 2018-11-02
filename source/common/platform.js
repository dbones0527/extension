/* TODO: move this to chromium platform folder after figuring out build process */

"use strict";

module.exports = {platform: chrome}

//const platform = chrome;

/* Firefox and Chromium provide that same WebExtensions API,
 * but Chromium calls it 'chrome.cookies' (because they invented it),
 * while Firefx and Edge call it 'browser.cookies'.
 */
/* TODO: Figure out the difference between 
 * chrome.cookies vs browser.cookies vs document.cookie vs window.cookies
 */
//var platform = typeof(chrome)==='object' ? chrome : browser;
//var platform =  browser;