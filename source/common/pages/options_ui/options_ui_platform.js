"use strict";

function originIsDisplayable(origin){
	return !origin.startsWith("moz-extension:\/\/");
}