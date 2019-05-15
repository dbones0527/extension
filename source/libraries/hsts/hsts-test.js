const hsts = require("./hsts")

// TODO: Actual test infrastructure

//
// HSTS tests adapted from RFC 6797 examples https://tools.ietf.org/html/rfc6797
//

const testParseResponseHeaderStrictTransportSecurity = [
  {
    "input": "max-age=31536000",
    "answer": {"maxAge": 31536000, "includeSubDomains": false, "preload": false} 
  },
  {
    "input": "max-age=15768000 ; includeSubDomains",
    "answer": {"maxAge": 15768000, "includeSubDomains": true, "preload": false}
  },
  {
    "input" : "max-age=\"31536000\"",
    "answer": {"maxAge": 31536000, "includeSubDomains": false, "preload": false}
  },
  {
    "input": "max-age=0",
    "answer": {"maxAge": 0, "includeSubDomains": false, "preload": false}
  },
  {
    "input": "max-age=0; includeSubDomains",
    "answer": {"maxAge": 0, "includeSubDomains": true, "preload": false}
  }
]

for (const testcase of testParseResponseHeaderStrictTransportSecurity){
  console.log (hsts.parseHSTSHeader(testcase.input))
  console.log (testcase.answer)
}