const fs = require('fs');
const request = require('request');
const Promiseb = require('bluebird')
const ProgressBar = require('progress')

function download(url: string, path: string) {
    return new Promiseb((resolve: ((result?: any) => {}), reject: (reason?: any) => {}) => {
        const isFile = fs.statSync(path).isFile();
        if(isFile) {
            return reject(`Fail: ${path} is already exists!`)
        }

        const writer = fs.createWriteStream(path)
        let progressBar: typeof ProgressBar
        request.get(url)
            .on('response', (response: any) => {
                const {statusCode, headers} = response
                const totalLength = headers['content-length'] || '0'
                if(statusCode !== 200) {
                    return reject(`Response status was ${statusCode}`)
                }
                progressBar = new ProgressBar(url + '-> downloading [:bar] :percent :etas', {
                    width: 40,
                    complete: '=',
                    incomplete: ' ',
                    renderThrottle: 1,
                    total: parseInt(totalLength)
                })
            })
            .on('data', (chunk: string) => progressBar.tick(chunk.length))
            .pipe(writer)
            .on('close', resolve)
            .on('error', (err: Error) => {
                fs.unlink(path)
                return reject(err)
            })
    })
}

module.exports = download;