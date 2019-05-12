"use strict";

function originIsDisplayable(origin){
	debugMessage(origin + "stuff" );
	return !origin.startsWith("moz-extension:\/\/");
}