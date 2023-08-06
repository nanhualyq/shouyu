const { app, BrowserWindow, Notification } = require('electron')
const { fork } = require('child_process')
const fs = require('fs')

const userDataDir = app.getPath('userData')
const dbDir = `${userDataDir}/sqlite`
const mediaDir = `${userDataDir}/media`
for (const dir of [dbDir, mediaDir]) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
}

const settingsFile = `${userDataDir}/settings.json`
if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, '{}')
}
let settings = {}
try {
    const text = fs.readFileSync(settingsFile, 'utf-8')
    settings = JSON.parse(text)
} catch (error) {
    console.error(error);
}

const env = {
    ...settings,
    ...process.env
}

if (!env.NITRO_PORT) {
    env.NITRO_PORT = 3456
}
if (!env.NUXT_SQLITE_FILE) {
    env.NUXT_SQLITE_FILE = `${dbDir}/data.db`
}
if (!env.NUXT_MEDIA_PATH) {
    env.NUXT_MEDIA_PATH = mediaDir
}


let ps = fork(`${__dirname}/../.output/server/index.mjs`, [], {
    silent: true,
    cwd: `${__dirname}/../`,
    env
});


ps.stdout.on('data', (data) => {
    const val = data.toString()
    console.log(val);
    if (val.match(/^Listening.*\d+/)) {
        app.whenReady().then(() => {
            const win = new BrowserWindow({ width: 800, height: 600 })
            win.loadURL(`http://localhost:${env.NITRO_PORT}`)
        })
    }
})
ps.stderr.on('data', data => {
    const val = data.toString()
    console.error(val);
    if (val.includes('Error: listen EADDRINUSE: address already in use')) {
        new Notification({ body: val }).show()
    }
})

app.on('will-quit', () => {
    ps.kill()
})