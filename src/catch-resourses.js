const restream = require('restream')
const stream = require('stream')
const PassThrough = stream.PassThrough

function catchResourses(stream, re) {
    const regexes = Array.isArray(re) ? re : [re]
    const filteredRegex = regexes.filter(re => re instanceof RegExp)

    const restreams = filteredRegex.map((re) => {
        return restream(re)
    })
    const ts = new PassThrough({
        objectMode: true,
    })
    restreams.forEach((so) => {
        stream.pipe(so)
        so.pipe(ts)
    })

    return ts
}

module.exports = catchResourses
