const assert = require('assert')
const os = require('os')
const fs = require('fs')
const path = require('path')

const pad = n => (n < 10 ? `0${n}` : String(n))
const getDateString = () => {
    const date = new Date()
    const MM = pad(date.getMonth() + 1)
    const dd = pad(date.getDate())
    const yyyy = date.getFullYear()
    const ss = pad(date.getSeconds())
    const mm = pad(date.getMinutes())
    const hh = pad(date.getHours())
    return `${yyyy}-${MM}-${dd}-${hh}-${mm}-${ss}`
}
const id = `zoroaster-test-${getDateString()}`
const mkTestDir = (dirName) => new Promise((resolve, reject) => {
    const dirPath = path.join(os.tmpdir(), dirName)
    fs.mkdir(dirPath, (err) => (
        err ? reject(err) : resolve(dirPath)
    ))
})

let testDir

module.exports = {
    _before: {
        createTestDir: () => mkTestDir(id)
            .then((res) => {
                testDir = res
                console.log('Using test directory: %s', testDir)
            }),
    },
    main: {
        testA: () => {
            const expectedValue = 50
            return Promise.resolve(50)
                .then(res =>
                    assert(res === expectedValue)
                )
        },
    },

    _after: {
        removeTestDir: () => new Promise((resolve, reject) => {
            fs.rmdir(testDir, err => (
                err ? reject(err) : resolve(testDir)
            ))
        })
            .then(console.log.bind(null, 'Removed test directory %s')),
    },
}