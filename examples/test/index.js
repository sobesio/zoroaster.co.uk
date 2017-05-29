const assert = require('assert')
const myModule = require('../src/')

const myModuleTestSuite = {
    'should do the right thing': () => {
        const expected = 'the-right-thing'
        const res = myModule()
        assert.equal(res, expected)
    },
    'should throw an error with incorrect output': () => {
        assert.throws(() => {
            myModule(null)
        }, /Cannot pass null/)
    },
}

module.exports = myModuleTestSuite
