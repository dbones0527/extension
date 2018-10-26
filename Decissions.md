# How this extension works

## Detecting cookie operations

This extension aims to detect improper use of cookies by observing 
the cookie modifications and use. So it relies on browser APIs 
`cookies` (to detect changes in cookie store and write cookies) and 
`webRequest` (to detect cookie writes via `Set-Cookie` response header 
and cookie disclosure via `Cookie` request header), as well as some 
injected code into the page (`content_scripts` and `web_accessible_resources`).

### `webRequst`

`webRequest` API has two modes of operation: asynchronous and 
synchronous (blocking). Currently, extension blocks on `webRequest` 
to maintain the smallest amount of internal datastructures. So far, 
I didn't see any slowdowns. However, this is a known *tradeoff*, 
which will be reversed if needed.