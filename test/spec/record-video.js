const capturescreen = require('../../examples/capturescreen/src/')

const recordVideoTestSuite = {
    'should be able to record a video': () => {
        return capturescreen.video(1500) // record 1.5s video
    },
}

module.exports = recordVideoTestSuite
