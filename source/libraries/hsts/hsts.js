/**
 * Parse HTTP Strict Transport Security response header, remembers them and allows queries
 * For now, we use only record() and queryStatus().
 */

// TODO: low priority, enhancement
// Align more with formal spec, e.g. look at how Chromium dos it in
// function ParseHSTSHeader in net/http/http_security_headers.cc
// https://github.com/chromium/chromium/blob/6f2047142487aa72d83197950205eff3f022f725/net/http/http_security_headers.cc

// TODO: low priority, but should do eventually
// take into account preload lists
// TODO: Is consistency critera good?

// TODO: do we need a function for a direct query for HSTS record?

module.exports = {queryStatus: queryStatus, record: record, query: null, parseHSTSHeader: parseStrictTransportSecurity}

/**
 * Dictionary with keys domains and values HSTS directive objects
 * @private
 * HSTS diretive object contains:
 *     consistent {boolean}
 *     content {Object}
 *         maxAge {number} - non-negative integer representing record lifetime in seconds
 *         includeSubDomains {boolean} - whether or not this record applies to subdomains
 *         preload {boolean} - whether or not domain asks to be preloaded (not used so far)
 */
// TODO: remember time of record creation
var hstsStore = {}

/**
 * Query the HSTS store
 * @param   {string} domain - domain name to look up
 * @returns {Object} HSTS record
 */
function queryStatus(domain){
  // Domain matching is case-insensitive
  domain = domain.trim().toLowerCase()

  var status = null

  // Check against the HSTS records for superdomain match
  // Iterate over all domain suffixes in case some domain has HSTS directive with includeSubdomains
  const subDomains = domain.split(".")
  const numSubDomains = subDomains.length
  var currSubDomain = ""
  for (var i=1; i<numSubDomains; i++){
    // Update subdomain
    currSubDomain = subDomains[numSubDomains-i] + currSubDomain
    const hstsRecord = hstsStore[currSubDomain]
    if (hstsRecord !== undefined /*&& hstsRecord.consistent*/ && hstsRecord.content.includeSubdomains && hstsRecord.content.maxAge > 0){
      // TODO: take into account time of record creation
      // TODO: take into account consistency
      // TODO: take into account includeSubdomains directve if currSubDomain !== domain
      // TODO: take into account preload list
      status = "secure"
      // Break only if we consider HSTS header sufficiently secure; otherwise carry on
      break
    }
    // Prepare for the next iteration
    currSubDomain = "." + currSubDomain
  }

  // Check against the HSTS records for congruent domain match
  const hstsRecord = hstsStore[domain]
  if (status === null && hstsRecord !== undefined /*&& hstsRecord.consistent*/ && hstsRecord.content.maxAge > 0){
    status = "secure"
  }
  return status
}

/**
 * Record the HSTS header into the store
 * @param   {string} domain - domain name to look up
 * @param   {string} headerValue - HSTS header exactly as it appers in the response
 * @returns {Object} HSTS record
 */
function record(domain, headerValue){
  // Domain matching is case-insensitive
  domain = domain.trim().toLowerCase()

  // Parse HSTS header
  const parsed = parseStrictTransportSecurity(headerValue)

  if (hstsStore[domain]){
    // This domain already has HSTS policy

    // Decide if HSTS policy is consistenst
    if (hstsStore[domain].maxAge !== parsed.maxAge)
      hstsStore[domain].consistent = false
    // Update the HSTS policy
    hstsStore[domain].content = parsed
    hstsStore[domain].createdTime = null // TODO: remember time
  } else {
    // This domain does not have HSTS policy yet
    // Just save the HSTS policy
    hstsStore[domain] = {
      consistent: true,
      content: parsed,
      createdTime: null // TODO: remember time
    }
  }
}

/**
 * This function parses a string HSTS header and converts it into object
 * @param   {string} headerValue - the header as it appears in the request
 * @returns {Object} HSTS record
 */
function parseStrictTransportSecurity (headerValue){
  var parsedAttributes = {maxAge: 0, includeSubDomains: false, preload: false}
  const attributes = headerValue.split(";")
  // Go through directives one at a time,
  // "The order of appearance of directives is not significant." (p. 15)
  for (var attribute of attributes){
    // Collate names to lower case because
    // "Directive names are case-insensitive." (p. 15)
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
