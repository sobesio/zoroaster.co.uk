const path = require('path')
const appDir = path.join(__dirname, '../app/')
const fs = require('fs')

module.exports = {
    layout: path.join(appDir, 'layout/main.html'),
    appDir: appDir,
    pre: [{
        re: /{{ navigation }}/,
        replacement: String(fs.readFileSync(path.join(appDir, 'layout/navigation.html'))),
    },
    ],
    pages: [{
        name: 'index.html',
        file: path.join(appDir, 'index.md'),
    },
    {
        name: 'test-context.html',
        file: path.join(appDir, 'test-context.md'),
    },
    ],
    output: path.join(__dirname, '../build/'),
}
