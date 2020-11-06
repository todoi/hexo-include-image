#!/usr/bin/env node
"use strict";
var program = require("commander");
var chalk = require("chalk");
var pkg = require("../package.json");
var main = require("./index");
program.version(pkg.version);
program
    .description("To download images and embed image with tag plugin syntax in markdown documents.")
    .option("-P, --posts-dir <path>", "The directory of the hexo posts, required")
    .action(function (options) { return main(options); })
    .parse(process.argv);
