const restream = require('restream')
const fs = require('fs')
const wrote = require('wrote')
const path = require('path')
const Catchment = require('catchment')

const conf = require('./pages')
const catchResourses = require('./catch-resourses')
const stream = require('stream')
const highlightJs = require('highlight.js')

const Transform = stream.Transform

function copyResourse(resourse, from, to) {
    const resoursePath = path.join(from, resourse)
    const outputPath = path.join(to, resourse)
    return wrote.ensurePath(outputPath)
        .then(() => {
            return wrote(outputPath)
        })
        .then((ws) => {
            const rs = fs.createReadStream(resoursePath)
            return wrote.write(ws, rs)
        })
        .then(() => {
            return { resourse, from, to }
        })
}

function readFile(file) {
    const catchment = new Catchment()
    const rs = fs.createReadStream(file)
    const pageReplaceStream = restream.replaceStream([
        {
            re: /```(\w+)?\n((?:(?!```)[\s\S])+)\n```/g,
            replacement: (match, p1, p2) => {
                const output = highlightJs.highlight(p1, p2)
                return `<pre><code class="${p1} hljs">${output.value}</code></pre>`
            },
        },
    ])
    rs.pipe(pageReplaceStream).pipe(catchment)
    return catchment.promise
}

const writePromises = conf.pages.map((page) => {
    // read file
    return readFile(page.file)
    .then((res) => {
        const rs = fs.createReadStream(conf.layout)
        const regex = {
            re: /{{ content }}/,
            replacement: res,
        }
        const regexes = [].concat(conf.pre || [], [regex])
        const stream = restream.replaceStream(regexes)
        rs.pipe(stream)
        const outputPath = path.join(conf.output, page.name)
        const resoursesStream = catchResourses(stream, [
            /<link href="(.+\.css)" rel="stylesheet">/g,
            /<img src="(.+\.(jpg|png))"/g,
        ])
        const copyStream = new Transform({
            objectMode: true,
            transform: (data, encoding, next) => {
                copyResourse(data[1], conf.appDir, conf.output)
                    .then((res) => {
                        copyStream.push(res)
                        console.log('copied %s', res.resourse)
                        next()
                    })
            },
        })
        resoursesStream.pipe(copyStream)
        return wrote.ensurePath(outputPath)
            .then(() => {
                return wrote(outputPath)
            })
            .then((ws) => {
                return wrote.write(ws, stream)
            })
            .then(() => {
                console.log('wrote %s', outputPath)
            })
    })
})

Promise.all(writePromises).then((res) => {
    // console.log(res)
}, (err) => {
    console.error(err)
})
