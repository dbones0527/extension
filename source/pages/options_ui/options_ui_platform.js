"use strict"

const platform = chrome

function originIsDisplayable(origin){
  return !origin.startsWith("moz-extension:\/\/")
}
