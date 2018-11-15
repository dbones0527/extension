/**
 * Determine if resource is a third-party based only on domain names
 * @param   origin - string, domain of the orgin page or frame
 * @param   resource - string, domain of the resource
 * @returns boolean - true if thirdpary, false otherwise
 */

module.exports = {thirdparty: thirdparty}

// This is a very primitive check, need to switch to eTLD+1 check and entities list
// Currently it checks that origin domain is a suffix for the resource domain
// (after dropping common sub-domain "www" from origin)
// E.g.: "cdn.example.com".endsWith("www.example.com".replace("www.", "")) === true

function thirdparty (origin, resource){
	return !resource.endsWith(origin.replace("www.", ""))
}
