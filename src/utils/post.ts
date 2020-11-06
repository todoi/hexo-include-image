export {};
const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const getImgNameFromUrl = require("./getImgNameFromUrl");
const download = require("./download");
const chalk = require("chalk");

module.exports.extractImageUrls = function (post: string): [string, RegExpMatchArray | null][] {
    const regexp = /(?<=\!\[.*?\]\()(https?:)?\/\/.+?(?=\))/g;

    return readFile(post, "utf8").then((data: string) => {
        const matches: RegExpMatchArray | null = data.match(regexp);
        return Promise.resolve([post, matches]);
    });
};

module.exports.src2tag = function (post: string, dones: string[]) {
    const regexp = /!\[(.*?)\]\(((https?:)?\/\/.+?)\)/g;
    function replace(data: string, regexp: RegExp) {
        return data.replace(regexp, (match: string, title: string, url: string) => {
            return dones.includes(url)
                ? `{% asset_img "${getImgNameFromUrl(url)}" "${title || "title"}'src-${url}'" %}`
                : match;
        });
    }

    return readFile(post, "utf8")
        .then((data: string) => replace(data, regexp))
        .then((data: string) => writeFile(post, data, "utf8"));
};

module.exports.downloadPostImages = function (urls: string[], assetFolder: string) {
    const dones: string[] = [];

    fs.mkdirSync(assetFolder, { recursive: true });

    return Promise.each(urls, (url: string) => {
        const imageName = getImgNameFromUrl(url);
        const imagePath = path.join(assetFolder, imageName);

        return download(url, imagePath)
            .then(() => dones.push(url))
            .catch((err: any) => console.log(chalk.red(err)));
    }).then(() => dones);
};
