const timer = document.getElementById('timer')
const ipc = require('electron').ipcRenderer
var interval = null
var remainSecond = 5 * 60

document.onkeydown = keyDown

drawTimer()

function drawTimer() {
    let minute = Math.abs(parseInt(remainSecond / 60))
    // let second = ('0' + Math.abs(remainSecond - (minute * 60))).slice(-2)
    let second = ('0' + Math.abs(remainSecond % 60)).slice(-2)

    if (remainSecond < 0) {
        timer.style.color = "red"
    }

    timer.innerHTML = minute + ':' + second
}

function countDown() {
    drawTimer()
    if (remainSecond === 0) {
        playBell()
    }

    remainSecond = remainSecond - 1

    //メインプロセスへ残り時間を送信
    ipc.send('remainSecond', remainSecond)
}

function startTimer() {
    interval = setInterval(countDown, 1000)
}

function stopTimer() {
    clearInterval(interval)
    interval = null
}

function resetTimer() {
    if (interval !== null) {
        stopTimer()
    }
    remainSecond = 5 * 60
    timer.style.color = "white"
    drawTimer()
    ipc.send('remainSecond', remainSecond)
}

function toggleStartStop() {
    if (interval === null) {
        startTimer()
    } else {
        stopTimer()
    }
}

function keyDown() {
    switch (event.keyCode) {
        case 32:
            //space key
            if (interval === null) {
                startTimer()
            } else {
                stopTimer()
            }
            break
        case 82:
            //R key
            resetTimer()
            break
        case 68:
            //D key
            resetTimer()
            remainSecond = 5
            drawTimer()
            break
    }
}

function playBell() {
    const audio = document.getElementById('bell')
    audio.pause()
    audio.currentTime = 0
    audio.play()
}

function playClap() {
    const audio = document.getElementById('clap')
    audio.pause()
    audio.currentTime = 0
    audio.play()
}

//ipc
ipc.on('startStop', function (event, arg) {
    toggleStartStop()
})

ipc.on('reset', function (event, arg) {
    resetTimer()
})

ipc.on('bell', function (event, arg) {
    playBell()
})

ipc.on('clap', function (event, arg) {
    playClap()
})
