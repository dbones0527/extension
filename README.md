# Cookie Policy

This extension eforces more strict cookie security by adding flags, including `Secure;`, `SameSite=[Lax|Strict];`, and `HttpOnly;`.

## Dependencies

Please refer to "Folder structure" `/common/includes/*`

## Folder structure

 - `/common/*` contains code shared among all WebExtension extensions
   - `/common/background/*` contains all background scripts
     - `/common/background/cookiestore.js` maintains the cookie database
   - `/common/includes/*` contains all the ouside dependencies
     - table-resize, `/includes/table-resize.js`, https://github.com/irhc/table-resize; Licensed under MIT (c) irhc and others.
     - JavaScript Cookie, `/includes/js.cookie-*.min.js`, helps with Chromium `chrome.cookies` Cookie API
   - `/common/pages/*` contains all the interfaces
 - `/chromium/*` contains Chromium-specific code
 - `/firefox/*` contains Firefox-specific code

## Minimum browser requirements

### Chromium

This extension require Chromium 26 and up because it relies on `chrome.cookies` API, 
however `SameSiteStatus` is accessible only in Chromium 51 and up. [source](https://developer.chrome.com/extensions/cookies)

### Firefox

Doesn't work with Firefox yet, but will work with [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions).

### Safari

Does not support Safari yet.

### Microsoft Edge

Does not support Microsoft Edge yet.

# Background information
 https://www.wfanet.org/news-centre/wfa-manifesto-for-online-data-transparency/
 https://pagefair.com/blog/2018/facebook-brussels-case/
