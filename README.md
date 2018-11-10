# Cookie Policy

*NOTE*: It's early on in the development process, so a lot can and will change.

An extension that helps user dynamically analyze a site and recommends 
appropriate more strict cookie security flags, including `Secure;`, 
`SameSite=[Lax|Strict];`, and `HttpOnly;` and cookie prefixes __Secure-*
 and __Host-*.

## Overview

The modern web heavily relies on HTTP Cookies, some of which are
used to track users, invading their privacy. Since cookies have "dual use" 
(for privacy-invading trackers as well as useful features), the user can 
not disable cookies without breaking the majority of the sites online.
This extension aims to inform the user of the potential privacy risk 
associated with specific cookies. It aims to perform only a small set of 
functions and do them well. In general, *the user should also use other 
software* to protect own privacy, because cookies are not the only 
technology used for tracking. Please refer to "This extension is 
*not*" for a summary of what *other* software you might want to use 
*together* with this extension.

### This extension is:

 - A method to visualize HTTP cookies and their contents and behavior
TODO: write details

### Limitations of this extension, or what this extension is *not*:

 - Network filter, sometimes referred to as ad blocker.
   The best way to ensure a connection does not disclose any information
   is to block the connection entirely. (E.g., even a mere act of 
   establishing a connection already leaks user IP address.) Request 
   blocking is implemented by many other software solutions:
    - uBlock Origin (not to be confused with uBlock) is a browser extension
      widely praised for versatility, efficiency, absence of monetary 
	  conflicts of interest, and a good [privacy policy](https://github.com/gorhill/uBlock/wiki/Privacy-policy).
    - uMatrix is sometimes referred to as uBlock Origin for advanced users
    - Privacy Badger 
	- AdGuard has browser extensions and stand-alone network filters
    - Adblock - a commercial product, with "Acceptable Ads" controversy 
	- Adblock Plus - another commercial product, also tainted by "Acceptable Ads" controversy
    - Firefox has "Tracking Protection" (limited to Disconnect filters)
    - Brave browser has a built-in filter engine
    - Opera browser has a built-in filter engine
    - Yandex.Browser has a built-in filter engine (and whitelist for 
      tracking services provided by Yandex itself)
 - HTTPS enforcer (mixed content resolver)
   HTTP is a plaintext protocol, which means someone can temper with it 
   in transit. Specifically, "man in the middle" can observe all transmited
   information and modify it. User should always be cautious when visiting 
   HTTP pages, and prbably use extension that forces HTTPS for content available
   over HTTPS. "HTTPS Everywhere" is a a great tool for that.

### 

## Privacy and Security

### Privacy Policy

This extension exists to fulfill only one goal -- to protect user's 
privacy -- therefore:
 - All user information is stored locally in the user's browser and 
   is never shared with anyone.
 - All information is discarded as soon as it is no longer needed.
 - The user can delete all collected information at all times.
 - This extension runs with the least API permissions possible. 
   See API Permissions Policy for details.

### API Permissions Policy

This extension runs with the least API permissions possible.
 - Each permission is declared "optional" if it is practical.
 - On the first install, the user should go into the extension options
   and enable all the desired features (and give the permissions).
 - Permissions are removed if they are no longer required (and 
   requested again if the user activates feature requiring the permission).
   The browser might not prompt the user every time if the user granted the
   permission already.

The actual permissions include:
TODO: write stuff

### Security

Nothing can be private unless it is secure, therefore this extension 
takes the following precautions:
 - Uses the least API permissions possible
 - Reasonable CSP

## Building

The extension relies on `npm` modules and `webpack` for building.

To get started, follow these steps:
1. Download official [Node.js](https://nodejs.org/) installer and install it
2. Clone this repo somewhere and `cd` into that folder
3. Install all dependencies with `npm i`
4. Build the extension with `npm run build`
5. Make changes to files in `source/` and repeat step 4 to rebuild the extension

## Dependencies

This extesion uses the following `npm` modules: *TODO: WRITE WHICH ONES*

## Folder structure

 - `source/*` WebExtension source code
   - `source/common/*` contains code shared among all WebExtension extensions
     - `source/common/background/*` contains all background scripts
       - `source/common/background/cookiestore.js` maintains the cookie database
     - `source/common/pages/*` contains all the interfaces
     - `source/common/content_scripts/*` contains all the code 
	 interacting with the page from its own context
     - `source/common/web_accessible_resources/*` contains all the 
	 code injected into the page context
   - `source/chromium/*` contains Chromium-specific code
   - `source/firefox/*` contains Firefox-specific code
 - `build/*` contains all the builds generated from the source code
 - `node_modules/*` is the land of `npm`, don't go there

## Minimum browser requirements

The extension is built for [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions),
which is supported by modern Chromium, Firefox, and Microsoft Edge browsers. Specifically, it requires following APIs: `cookies`,
`storage`, and optionally (recommended) `webRequest`.

### Chromium

Chromium is the primary target for this extension development, because of 
This extension requires Chromium 26 and up because it relies on `chrome.cookies` API, 
however `SameSiteStatus` is accessible only in Chromium 51 and up. [source](https://developer.chrome.com/extensions/cookies)

### Firefox

Doesn't work with Firefox yet, but will eventually.

### Microsoft Edge

Does not support Microsoft Edge, but might eventually.

### Apple Safari

Probably will never support Apple Safari natively, because Safari does not support WebExtensions API. Even then, Safari support is not a priority currently. Might support Safari in a distant future via a polyfill library.


https://www.sjoerdlangkemper.nl/2017/02/09/cookie-prefixes/