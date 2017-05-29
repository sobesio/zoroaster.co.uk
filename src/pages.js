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
        title: 'Main Page',
        url: 'index.html',
        file: path.join(appDir, 'index.md'),
    },
    {
        title: 'Test Context',
        url: 'test-context.html',
        file: path.join(appDir, 'test-context.md'),
    },
    {
        title: 'Test File Organisation',
        url: 'test-file-organisation.html',
        file: path.join(appDir, 'file-structure.md'),
    },
    {
        title: 'JS Testing Frameworks',
        url: 'comparison-of-javascript-testing-frameworks.html',
        file: path.join(appDir, 'comparison.md'),
    },
    {
        title: 'Test-Driven Development',
        url: 'test-driven-development.html',
        file: path.join(appDir, 'tdd.md'),
    },
    {
        title: 'Testing Gloassry',
        url: 'testing-glossary.html',
        file: path.join(appDir, 'glossary.md'),
    },
    ],
    output: path.join(__dirname, '../build/'),
}
