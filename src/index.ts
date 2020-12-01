import { extractImageUrls, src2tag, downloadPostImages, IConfig } from "./utils/post";
const path = require("path");
const fs = require("fs");
const Promise = require("bluebird");
const statSync = fs.statSync;

const chalk = require("chalk");
const red = chalk.bold.red;
const green = chalk.bold.green;

function mergeConfig(inputConfig: IConfig = {}) {
    let defaultConfig: IConfig = {};
    const defaultConfigPath = path.resolve(__dirname, "../.hexo-include-image.json");

    try {
        defaultConfig = require(defaultConfigPath);
    } catch (err) {}

    const config = { ...defaultConfig, ...inputConfig };
    config.postsDir = path.resolve(process.cwd(), config.postsDir || "");

    if (statSync(config.postsDir).isFile()) {
        throw new Error(
            red(`Error: '${config.postsDir}' is a file, but its requires a directory.
        Please enter your posts directory by 'include -P [path]'`)
        );
    }

    return config;
}

function joinPostsDir(postsDir: string, inputPath: string): string {
    return path.resolve(path.join(postsDir, inputPath));
}

const getMDPosts = (postsDir: string) => {
    return Promise.promisify(fs.readdir)(postsDir).filter((filename: string) => {
        const filePath = joinPostsDir(postsDir, filename);
        return path.extname(filename) === ".md" && statSync(filePath).isFile();
    });
};

function include(config: IConfig) {
    const { postsDir, tagPluginsSyntax } = config;
    return getMDPosts(postsDir)
        .map((filename: string) => {
            const post = joinPostsDir(postsDir, filename);
            return extractImageUrls(post);
        })
        .filter(([post, urls]: [string, RegExpMatchArray | null]) => !!urls)
        .each(([post, urls]: [string, RegExpMatchArray]) => {
            const postName = path.parse(post).name;
            const assetFolder = joinPostsDir(postsDir, postName);
            return downloadPostImages(urls, assetFolder)
                .then((dones: string[]) => src2tag({post, dones, postName, tagPluginsSyntax}))
                .catch((err: Error) => console.log(red(err)));
        });
}

module.exports = function main(inputConfig: IConfig) {
    const config = mergeConfig(inputConfig);
    console.log(chalk.bold.white(`working in ${config.postsDir}`));
    return include(config)
        .then(() => console.log(green("done!")))
        .catch((err: Error) => console.log(red(err)));
};
