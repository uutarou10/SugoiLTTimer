const electron = require('electron')
const fs = require('fs')
const ipc = electron.ipcMain
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const powerSaveBlocker = electron.powerSaveBlocker

const auth = require('basic-auth')
const auth_name = 'timer'
const auth_pass = 'this_is_pass'

const appPath = app.getAppPath()
let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({ width: 800, height: 600 })
    mainWindow.loadURL('file://' + __dirname + '/main.html')

    mainWindow.on('closed', function () {
        mainWindow = null
    })
    //Power save block
    powerSaveBlocker.start('prevent-display-sleep')
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

//コントローラーを配信
const http = require('http')
const server = http.createServer()
let controler_html
const port = 8080 //コントローラーのポート番号

fs.readFile(appPath + '/controler.html', 'utf8', function (err, text) {
    controler_html = text
})

server.on('request', function (req, res) {
    if (req.url === '/') {
        console.log(req.url)
        if (typeof controler_html === "undefined") {
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.write('500 Internal Server Error')
            res.end()
        } else {
            const credential = auth(req)
            if (credential && credential.name === auth_name && credential.pass === auth_pass) {
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.write(controler_html)
                res.end()
            } else {
                res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Sugoi LT Timer"' })
                res.end('401 Unauthorized')
            }
        }
    } else if (fs.existsSync(appPath + req.url)) {
        // /以外へのアクセスがあったときの処理
        res.writeHead(200)
        const stream = fs.createReadStream(appPath + req.url)
        stream.pipe(res)
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        // res.write('404 Not found')
        res.end('404 Not found')
    }
})
server.listen(port)
const io = require('socket.io').listen(server)
console.log('Server running on port ' + port + '...')

//Socket.io
io.sockets.on('connection', function (socket) {
    socket.on('startStop', function (data) {
        mainWindow.webContents.send('startStop')
    })

    socket.on('reset', function (data) {
        //reset
        mainWindow.webContents.send('reset')

    })

    socket.on('bell', function (data) {
        //bell
        mainWindow.webContents.send('bell')
    })

    socket.on('clap', function (data) {
        //clap
        mainWindow.webContents.send('clap')
    })

    ipc.on('remainSecond', function (event, arg) {
        socket.emit('remainSecond', arg)
    })
})