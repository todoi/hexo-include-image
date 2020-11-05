export {}
const os = require('os')
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const getImgNameFromUrl = require('./getImgNameFromUrl')


 module.exports.extractImageUrls = function(post: string,): [string, RegExpMatchArray | null][]{
    const regexp = /(?<=\!\[.*?\]\()(https?:)?\/\/.+?(?=\))/g

    return readFile(post, 'utf8')
        .then((data: string) => {
            const matches: RegExpMatchArray | null = data.match(regexp)
            return Promise.resolve([ post, matches ])
        })
}

module.exports.src2tag = function(post: string, dones: string[]) {
    const regexp = /!\[(.*?)\]\(((https?:)?\/\/.+?)\)/g

    return readFile(post, 'utf8')
        .then((data: string) => {
            return data.replace(regexp, (match: string, title: string, url: string) => {
                if(dones.includes(url)) {
                    const imageName = getImgNameFromUrl(url);
                    return `{% asset_img "${imageName}" "${title || 'title'}'src-${url}'" %}`
                }
                else {
                    return match;
                }
            })
        })
        .then((data: string) => writeFile(post, data, 'utf8'))
}