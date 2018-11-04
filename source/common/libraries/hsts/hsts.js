/*
 * Parse HTTP Strict Transport Security response header
 * @param   value - string from the header
 * @returns object {"max-age": non-negative int, "includeSubDomains": boolean, "preload": boolean}
 */

module.exports = {parseResponseHeaderStrictTransportSecurity: parseResponseHeaderStrictTransportSecurity}

function parseResponseHeaderStrictTransportSecurity (headerValue){
	var parsedAttributes = {"maxAge": 0, "includeSubDomains": false, "preload": false}
	const attributes = headerValue.split(";")
	for (var attribute of attributes){
		attribute = attribute.trim().toLowerCase()
		if (attribute === "")
			continue
		if (attribute === "includesubdomains"){
			parsedAttributes.includeSubDomains = true
		} else
		if (attribute === "preload"){
			parsedAttributes.preload = true
		} else
		if (attribute.startsWith("max-age")){
			var value = attribute.substr(attribute.indexOf('=')+1)
			if (value[0] === '"' && value.slice(-1) === '"')
				value = value.slice(1, -1)
			// TODO: handle errors and negative ints
			parsedAttributes.maxAge = Number(value)
		} else {
			// ignore everything else, as per RFC 6797
			console.log("ATENTION: Parsing HSTS header, unexpected attribute '" + attribute + "' in header '" + headerValue + "'")
		}
	}
	return parsedAttributes
}
