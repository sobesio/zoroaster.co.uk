// src/record-video.js
function recordVideo(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration) // pretend to record a video
    })
}

module.exports = recordVideo
