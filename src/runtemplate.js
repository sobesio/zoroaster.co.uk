'use strict'

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
            re: /_((?:(?!_)[\s\S])+)_/mg,
            replacement: (match, p1) => {
                return `<span class="em">${p1}</span>`
            },
        },
        {
            re: /```(\w+)?\n((?:(?!```)[\s\S])+)\n```/g,
            replacement: (match, p1, p2) => {
                const output = highlightJs.highlight(p1, p2)
                return `<pre><code class="${p1} hljs">${output.value}</code></pre>`
            },
        },
        {
            re: /``((?:(?!``)[\s\S])+)``/g,
            replacement: (match, p1) => {
                return `<span class="tm2">${p1}</span>`
            },
        },
        {
            re: /`((?:(?!`)[\s\S])+)`/g,
            replacement: (match, p1) => {
                return `<span class="tm">${p1}</span>`
            },
        },
        {
            re: /\*((?:(?![\*\n])[\s\S])+)\*/mg,
            replacement: (match, p1) => {
                return `<span class="bold">${p1}</span>`
            },
        },
        {
            re: /^ *(#+) *((?:(?!\n)[\s\S])+)\n/gm,
            replacement: (match, p1, p2) => {
                const l = p1.length
                return `<h${l}>${p2}</h${l}>`
            },
        },
        {
            re: /✓/g,
            replacement: '<span class="tick">&#10003;</span>',
        },
        {
            re: /✗/g,
            replacement: '<span class="cross">&#10007;</span>',
        },
        {
            re: /--/g,
            replacement: '&#8212;',
        },
        {
            re: /\[((?:(?!\])[\s\S])+)\]\(((?:(?!\))[\s\S])+)\)/g,
            replacement: (match, p1, p2) => {
                return `<a href="${p2}">${p1}</a>`
            },
        },
        {
            re: /((?:\n *\*(?!\n)[\s\S]*)+)/g,
            replacement: (match, p1) => {
                return `<ul>${p1}</ul>`
            },
        },
        {
            re: /^ *\* *((?:(?!\n)[\s\S])+)/mg,
            replacement: (match, p1) => {
                return `<li>${p1}</li>`
            },
        },
    ])
    rs.pipe(pageReplaceStream).pipe(catchment)
    return catchment.promise
}

class CopyStream extends Transform {
    constructor(from, to) {
        super({
            objectMode: true,
        })
        this.from = from
        this.to = to
    }
    _transform(data, encoding, next) {
        copyResourse(data[1], this.from, this.to)
            .then((res) => {
                this.push(res)
                console.log('copied %s', res.resourse)
                next()
            })
    }
}

const pagesHtml = conf.pages.reduce((acc, page) => {
    return [].concat(acc, [`<a href="${page.name}">${page.title}</a>`])
}, []).join('\n')

const writePromises = conf.pages.map((page) => {
    const outputPath = path.join(conf.output, page.name)
    return readFile(page.file)
    .then((res) => {
        const rs = fs.createReadStream(conf.layout)
        const _regexes = [
            {
                re: /{{ content }}/,
                replacement: res,
            },
            {
                re: /{{ pages }}/,
                replacement: `<p class="list">${pagesHtml}</p>`,
            },
            {
                re: /^ *(#+) *((?:(?!\n)[\s\S])+)\n/gm,
                replacement: (match, p1, p2) => {
                    const l = p1.length
                    return `<h${l}>${p2}</h${l}>`
                },
            },
        ]
        const regexes = [].concat(conf.pre || [], _regexes)
        const stream = restream.replaceStream(regexes)
        return wrote.ensurePath(outputPath)
            .then(() => {
                return wrote(outputPath)
            })
            .then((ws) => {
                // pipe all at the same time
                rs.pipe(stream)
                const resoursesStream = catchResourses(stream, [
                    /<link href="(.+\.(css|ico))" rel="(stylesheet|shortcut icon)">/g,
                    /<img src="(.+\.(jpg|png))"/g,
                ]) // combine streams
                const copyStream = new CopyStream(conf.appDir, conf.output)
                resoursesStream.pipe(copyStream)
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
