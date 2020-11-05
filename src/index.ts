// fix ts feature: Cannot redeclare block-scoped variable 'Promise'
// https://medium.com/@muravitskiy.mail/cannot-redeclare-block-scoped-variable-varname-how-to-fix-b1c3d9cc8206
export {}
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const statSync = fs.statSync;
const download = require('./utils/download')
const { extractImageUrls, src2tag } = require('./utils/post')
const getImgNameFromUrl = require('./utils/getImgNameFromUrl')

const chalk = require('chalk');
const log = console.log;
const red = chalk.bold.red;
const green = chalk.bold.green;

interface IConfig {
    postsDir: string
}
const config: IConfig = {
    postsDir: '../../blog/source/_posts',
}

const isDirectory: boolean = statSync(config.postsDir).isDirectory()

if(!isDirectory) {
    throw new Error(red('请输入博客目录地址'));
}

function joinPostsDir(inputPath: string): string {
    return path.resolve(path.join(config.postsDir, inputPath));
}

Promise.promisify(fs.readdir)(config.postsDir)
    .filter((filename: string) => {
        const post = joinPostsDir(filename)
        return path.extname(filename) === '.md' && statSync(post).isFile();
    })
    .map((filename: string) => {
        const post = joinPostsDir(filename);
        return extractImageUrls(post)
    })
    .filter(([post, urls]: [string, RegExpMatchArray | null]) => !!urls)
    .each(([post, urls]: [string, RegExpMatchArray]) => {
        const assetFolder = joinPostsDir(path.parse(post).name);
        const dones: string[] = [];

        if(!statSync(assetFolder).isDirectory()) {
            fs.mkdirSync(assetFolder, {recursive: true});
        }

        return Promise.each(urls, (url: string) => {
            const imageName = getImgNameFromUrl(url)
            const imagePath = path.join(assetFolder, imageName)

            return download(url, imagePath)
            .then(() => dones.push(url))
            .catch((err: any) => log(red(err)))
        })
        .then(() => src2tag(post, dones))
        .catch((err: Error) => log(red(err)))
    })
    .then(() => {
        log(green('done!'))
    })
