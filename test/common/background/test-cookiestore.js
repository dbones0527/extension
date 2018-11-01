//
// HSTS tests adapted from RFC 6797 https://tools.ietf.org/html/rfc6797
// 

var cookiestore = require("../../../source/common/background/cookiestore.js")

const testParseResponseHeaderStrictTransportSecurity = [
	{
		"input": "max-age=31536000",
		"answer": {"max-age": 31536000, "includeSubDomains": false, "preload": false} 
	},
	{
		"input": "max-age=15768000 ; includeSubDomains",
		"answer": {"max-age": 15768000, "includeSubDomains": true, "preload": false}
	},
	{
		"input" : "max-age=\"31536000\"",
		"answer": {"max-age": 31536000, "includeSubDomains": false, "preload": false}
	},
	{
		"input": "max-age=0",
		"answer": {"max-age": 0, "includeSubDomains": false, "preload": false}
	},
	{
		"input": "max-age=0; includeSubDomains",
		"answer": {"max-age": 0, "includeSubDomains": false, "preload": false}
	}
]
