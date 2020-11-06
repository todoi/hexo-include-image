export {};
const fs = require("fs");
const request = require("request");
const Promiseb = require("bluebird");
const ProgressBar = require("progress");
const path = require("path");

function download(inputUrl: string, inputPath: string) {
    return new Promiseb((resolve: (result?: any) => {}, reject: (reason?: any) => {}) => {
        try {
            if (fs.statSync(inputPath).isFile()) {
                return reject(`Error: EEXIST: file already exists open '${inputPath}'`);
            }
        } catch (err) {}

        const writer = fs.createWriteStream(inputPath, { flags: "wx" });
        let progressBar: typeof ProgressBar;
        request
            .get(inputUrl)
            .on("response", (response: any) => {
                const { statusCode, headers } = response;
                const totalLength = headers["content-length"] || "0";
                if (statusCode !== 200) {
                    return reject(`Response status was ${statusCode}`);
                }
                progressBar = new ProgressBar(
                    path.basename(inputPath) + "-> downloading [:bar] :percent :etas",
                    {
                        width: 40,
                        complete: "=",
                        incomplete: " ",
                        renderThrottle: 1,
                        total: parseInt(totalLength),
                    }
                );
            })
            .on("data", (chunk: string) => progressBar.tick(chunk.length))
            .pipe(writer)
            .on("close", resolve)
            .on("error", (err: Error) => {
                fs.unlink(inputPath, () => {
                    return reject(err);
                });
            });
    });
}

module.exports = download;
