const url = require('url');
const path = require('path')
const regexp = /[\w\-\s]+?\w(?:.png|.jpg|.gif|.webp)/;

module.exports = function getImgNameFromUrl(inputUrl: string): string {
    const decodedUrl = decodeURIComponent(inputUrl)
    const {pathname, query} = url.parse(decodedUrl)
    const basename = path.basename(pathname);
    if(regexp.test(basename)) {
        return path.basename(pathname)
    }
    else if(regexp.test(query)){
        return query.match(regexp)[0];
    }
    else {
        return `${basename}.png`
    }
}
