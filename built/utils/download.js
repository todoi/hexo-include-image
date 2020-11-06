"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var request = require("request");
var Promiseb = require("bluebird");
var ProgressBar = require("progress");
var path = require("path");
function download(inputUrl, inputPath) {
    return new Promiseb(function (resolve, reject) {
        try {
            if (fs.statSync(inputPath).isFile()) {
                return reject("Error: EEXIST: file already exists open '" + inputPath + "'");
            }
        }
        catch (err) { }
        var writer = fs.createWriteStream(inputPath, { flags: "wx" });
        var progressBar;
        request
            .get(inputUrl)
            .on("response", function (response) {
            var statusCode = response.statusCode, headers = response.headers;
            var totalLength = headers["content-length"] || "0";
            if (statusCode !== 200) {
                return reject("Response status was " + statusCode);
            }
            progressBar = new ProgressBar(path.basename(inputPath) + "-> downloading [:bar] :percent :etas", {
                width: 40,
                complete: "=",
                incomplete: " ",
                renderThrottle: 1,
                total: parseInt(totalLength),
            });
        })
            .on("data", function (chunk) { return progressBar.tick(chunk.length); })
            .pipe(writer)
            .on("close", resolve)
            .on("error", function (err) {
            fs.unlink(inputPath, function () {
                return reject(err);
            });
        });
    });
}
module.exports = download;
