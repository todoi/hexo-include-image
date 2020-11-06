"use strict";
var url = require("url");
var path = require("path");
var regexp = /[\w\-\s]+?\w(?:.png|.jpg|.gif|.webp)/;
module.exports = function getImgNameFromUrl(inputUrl) {
    var decodedUrl = decodeURIComponent(inputUrl);
    var _a = url.parse(decodedUrl), pathname = _a.pathname, query = _a.query;
    var basename = path.basename(pathname);
    if (regexp.test(basename)) {
        return path.basename(pathname);
    }
    else if (regexp.test(query)) {
        return query.match(regexp)[0];
    }
    else {
        return basename + ".png";
    }
};
