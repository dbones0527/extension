# Archetecture

## Extension structure

This extension follows the basic principles of WebExtensions. Spcifically, it
uses the background scripts, content scripts

                                                           ╔══════════════╗
                                                           ║   Popup UI   ║
                                                           ╠══════════════╣
                                                           ║              ║
                                                           ║              ║
                                                           ║              ║
                                                           ╚══════════════╝
                                                                  |
╔══════════════╗         ╔═════════════════╗             ╔═════════════════╗
║   Web page   ║         ║ content_scripts ║             ║  Background     ║
╠══════════════╣         ╠═════════════════╣             ╠═════════════════╣
║              ║         ║    inject.js    ║             ║  cookiestore.js ║
║  inject.js   ║<------->║                 ║<----------->║  (no real page) ║
║              ║         ║                 ║             ╚═════════════════╝
║              ║         ║ (no real page)  ║                       |
╚══════════════╝         ╚═════════════════╝                       |
                                                       ╔═════════════════════╗
                                                       ║   Developer tools   ║
                                                       ╠═════════════════════╣
                                                       ║                     ║
                                                       ║                     ║
                                                       ║                     ║
                                                       ╚═════════════════════╝

### Content scripts and Injected code

`content_scripts` are executed in their own context with "clean dom", which means 
to get into the web-page context, we have to add `<script>` to the web-page DOM pointing 
to a file in `web_accessible_resources`. The file is loaded as any other resource on the 
page and can perform some fun manipulation with the regular browser APIs.

Once within the web-page context, we can insert shims into the `document.cookie` API 
like described [here](https://blob.tomerweller.com/cookie-interception-chrome-extension).