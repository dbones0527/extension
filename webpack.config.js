const path = require("path")

const ncp = require("ncp").ncp

ncp.limit = 16

ncp("./source/common/pages/", "./build/pages/", function (err) {
 if (err) {
   return console.error(err);
 }
 console.log('done!');
});

ncp("./source/common/img-t/", "./build/img-t/", function (err) {
 if (err) {
   return console.error(err);
 }
 console.log('done!');
});

ncp("./source/common/includes/", "./build/includes/", function (err) {
 if (err) {
   return console.error(err);
 }
 console.log('done!');
});

ncp("./source/common/manifest.json", "./build/manifest.json", function (err) {
 if (err) {
   return console.error(err);
 }
 console.log('done!');
});

const base = "./source/common/"

const files = [
	"background/cookiestore.js",
	"content_scripts/inject.js",
	"web_accessible_resources/inject.js",
	"cookies.js",
	"platform.js",
]

var entries = {}
for (var file of files)
	entries[file] = base + file


module.exports = {
	entry: entries,
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name]"
  }
}
/*
module.exports = {
  entry: "./source/common/content_scripts/inject.js",
  output: {
    path: path.resolve(__dirname, "build/content_scripts"),
    filename: "inject.js"
  }
}*/