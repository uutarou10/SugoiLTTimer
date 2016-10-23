//Socket.io
const socket = io.connect()

socket.on('remainSecond', function (data) {
    refreshTimer(data)
})

function startStop() {
    socket.emit('startStop')
}

function resetTimer() {
    socket.emit('reset')
}

function playBell() {
    socket.emit('bell')
}

function refreshTimer(remainSecond) {
    const minute = Math.abs(parseInt(remainSecond / 60))
    const second = ('0' + Math.abs(remainSecond % 60)).slice(-2)
    const progress = (remainSecond / (5 * 60)) * 100

    const remainTime = document.getElementById('remainTime')

    if (remainSecond < 0) {
        remainTime.style.color = 'red'
    } else {
        remainTime.style.color = 'black'
        const progressBar = document.getElementById('progress')
        progressBar.style.width = progress + '%'
    }
    remainTime.innerHTML = minute + ':' + second
}