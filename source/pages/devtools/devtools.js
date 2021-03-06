/* 
 * This script is run when user opens the "Developer tools".
 * Sets up the DevTools UI pane.
 */
"use strict"

const platform = chrome

// Setup the DevTools panel, but only if it's enabled
platform.storage.local.get(["DevTools"], function(result) {
  const draw = result.DevTools

  if (draw)
  platform.devtools.panels.create("Cookie Saver",
    "/images/img.png",
    "/pages/devtools/inspector.html",
    (panel) => {
      panel.onShown.addListener(function(win){ win.focus() })
    }
  )
})