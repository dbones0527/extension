const path = require("path")

const ncp = require("ncp").ncp
ncp.limit = 16

const fs = require("fs")

const base = "./source/common/"
const build = "./build/"

const dirs = ["", "pages/", "img-t/", "includes/"]

const copy = [
	"pages/",
	"img-t/",
	"includes/",
	"manifest.json"
]

const files = [
	"background/cookiestore.js",
	"content_scripts/inject.js",
	"web_accessible_resources/inject.js"
]

// Create all dirs if they do not exists yet
for (const dir of dirs)
	if (!fs.existsSync(build+dir))
		fs.mkdirSync(build+dir)

// Copy all files that do not require processing
for (const src of copy)
	ncp(base + src, build + src, function (err) {
		if (err)
			return console.error(err)
		console.log("Copied " + src)
	})

// Add all files that do require processing to webpack work order
var entries = {}
for (const file of files){
	entries[file] = base + file
	console.log("Added for packaging " + file)
}

// Ask webpack to process these files
module.exports = {
	entry: entries,
  output: {
    path: path.resolve(__dirname, build),
    filename: "[name]"
  }
}
