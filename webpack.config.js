/**
 * webpack configuration script
 * This script builds the extension according to the
 * parameters specifid
 */
// Build output path, can be relative or absolute
// TODO: support absolute paths without trailing /
// Where to save the build
const build_dir = "./build/"
// Rebuild extension when source files are edited
const watch = true
/* End of parameters */

const path = require("path")

const ncp = require("ncp").ncp
ncp.limit = 16

const fs = require("fs")

const base_extension = "./source/"
const base_library = "./node_modules"

// build can be absolute path
const build_dir_long = path.resolve(__dirname, build_dir)

const dirs = ["", "pages/", "images/", "includes/", "includes/materialize-css"]

const copy_extension = [
  "content_scripts/",
  "pages/",
  "images/",
  "includes/",
  "web_accessible_resources/",
  "manifest.json"
]

const copy_library = {
  "materialize-css-styles": {
    dev:  "./node_modules/materialize-css/dist/css/materialize.css",
    prod: "./node_modules/materialize-css/dist/css/materialize.min.css",
    dst:  "includes/materialize-css/materialize.css"
  },
  "materialize-css-scripts": {
    dev:  "./node_modules/materialize-css/dist/js/materialize.js",
    prod: "./node_modules/materialize-css/dist/js/materialize.min.js",
    dst:  "includes/materialize-css/materialize.js"
  }
}

const files = [
  "background/cookiestore.js",
  "content_scripts/inject.js",
  "web_accessible_resources/inject.js"
]

// Create all dirs if they do not exists yet
for (const dir of dirs){
  const dir_full = build_dir_long+"/"+dir
  if (!fs.existsSync(dir_full))
    fs.mkdirSync(dir_full)
}
// Copy all files that do not require processing
for (const src of copy_extension)
  ncp(base_extension + src, build_dir_long + "/" + src, function (err) {
    if (err)
      return console.error(err)
    console.log("Copied " + src)
  })

// Copy all library files that do not require processing
for (const library in copy_library){
  const destination = build_dir_long + "/" + copy_library[library].dst
  ncp(copy_library[library].dev, destination, function (err) {
    if (err)
      return console.error(err)
    console.log("Copied library: " + library)
  })
}

// Add all files that do require processing to webpack work order
var entries = {}
for (const file of files){
  entries[file] = base_extension + file
  console.log("Added for packaging " + file)
}

// Ask webpack to process these files
module.exports = {
  entry: entries,
  output: {
    // build can be absolute or relative path
    path: build_dir_long,
    filename: "[name]"
  },
  watch: watch
}
