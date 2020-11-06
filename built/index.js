"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var Promise = require("bluebird");
var statSync = fs.statSync;
var _a = require("./utils/post"), extractImageUrls = _a.extractImageUrls, src2tag = _a.src2tag, downloadPostImages = _a.downloadPostImages;
var chalk = require("chalk");
var red = chalk.bold.red;
var green = chalk.bold.green;
function mergeConfig(inputConfig) {
    if (inputConfig === void 0) { inputConfig = {}; }
    var defaultConfig = {};
    var defaultConfigPath = path.resolve(__dirname, "../.poconfig.json");
    try {
        defaultConfig = require(defaultConfigPath);
    }
    catch (err) { }
    var config = __assign(__assign({}, defaultConfig), inputConfig);
    config.postsDir = path.resolve(process.cwd(), config.postsDir || "_posts");
    if (statSync(config.postsDir).isFile()) {
        throw new Error(red("Error: '" + config.postsDir + "' is a file, but its requires a directory.\n        Please enter your posts directory by 'include -P [path]'"));
    }
    return config;
}
function joinPostsDir(postsDir, inputPath) {
    return path.resolve(path.join(postsDir, inputPath));
}
var getMDPosts = function (postsDir) {
    return Promise.promisify(fs.readdir)(postsDir).filter(function (filename) {
        var filePath = joinPostsDir(postsDir, filename);
        return path.extname(filename) === ".md" && statSync(filePath).isFile();
    });
};
function include(config) {
    var postsDir = config.postsDir;
    return getMDPosts(postsDir)
        .map(function (filename) {
        var post = joinPostsDir(postsDir, filename);
        return extractImageUrls(post);
    })
        .filter(function (_a) {
        var post = _a[0], urls = _a[1];
        return !!urls;
    })
        .each(function (_a) {
        var post = _a[0], urls = _a[1];
        var assetFolder = joinPostsDir(postsDir, path.parse(post).name);
        return downloadPostImages(urls, assetFolder)
            .then(function (dones) { return src2tag(post, dones); })
            .catch(function (err) { return console.log(red(err)); });
    });
}
module.exports = function main(inputConfig) {
    var config = mergeConfig(inputConfig);
    console.log(chalk.bold.white("working in " + config.postsDir));
    return include(config)
        .then(function () { return console.log(green("done!")); })
        .catch(function (err) { return console.log(red(err)); });
};
