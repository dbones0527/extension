"use strict"

const platform = chrome

function originIsDisplayable(origin){
  debugMessage(origin + "stuff" )
  return !origin.startsWith("moz-extension:\/\/")
}