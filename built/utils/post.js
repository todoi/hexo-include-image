"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var Promise = require("bluebird");
var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);
var getImgNameFromUrl = require("./getImgNameFromUrl");
var download = require("./download");
var chalk = require("chalk");
module.exports.extractImageUrls = function (post) {
    var regexp = /(?<=\!\[.*?\]\()(https?:)?\/\/.+?(?=\))/g;
    return readFile(post, "utf8").then(function (data) {
        var matches = data.match(regexp);
        return Promise.resolve([post, matches]);
    });
};
module.exports.src2tag = function (post, dones) {
    var regexp = /!\[(.*?)\]\(((https?:)?\/\/.+?)\)/g;
    function replace(data, regexp) {
        return data.replace(regexp, function (match, title, url) {
            return dones.includes(url)
                ? "{% asset_img \"" + getImgNameFromUrl(url) + "\" \"" + (title || "title") + "'src-" + url + "'\" %}"
                : match;
        });
    }
    return readFile(post, "utf8")
        .then(function (data) { return replace(data, regexp); })
        .then(function (data) { return writeFile(post, data, "utf8"); });
};
module.exports.downloadPostImages = function (urls, assetFolder) {
    var dones = [];
    fs.mkdirSync(assetFolder, { recursive: true });
    return Promise.each(urls, function (url) {
        var imageName = getImgNameFromUrl(url);
        var imagePath = path.join(assetFolder, imageName);
        return download(url, imagePath)
            .then(function () { return dones.push(url); })
            .catch(function (err) { return console.log(chalk.red(err)); });
    }).then(function () { return dones; });
};
