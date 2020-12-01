#!/usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const pkg = require("../package.json");
const main = require("./index");

program.version(pkg.version);

program
    .description(`To download images and embed image with tag plugin syntax in markdown documents.`)
    .option("-P, --posts-dir <path>", "The directory of the hexo posts, required")
    .option("-T, --no-tag-plugins-syntax", "Use tag plugin syntax to embed image")
    .action((options: any) => {
        main(options)
    })
    .parse(process.argv);
