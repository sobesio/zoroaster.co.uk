// src/index.js
const recordVideo = require('./record-video')

function captureScreen() {
    return Promise.resolve('Screen captured') // pretend to capture a screen
}

captureScreen.video = recordVideo

module.exports = captureScreen
