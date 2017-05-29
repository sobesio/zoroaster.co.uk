// src/index.js
const myModule = (arg) => {
    if (arg === null) {
        throw new Error('Cannot pass null')
    }
    return 'the-right-thing'
}
module.exports = myModule
