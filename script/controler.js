//Socket.io
const socket = io.connect()

socket.on('remainSecond', function (data) {
    console.log(data)
})

function startStop () {
    socket.emit('startStop')
}

function resetTimer () {
    socket.emit('reset')
}

function playBell () {
    socket.emit('bell')
}