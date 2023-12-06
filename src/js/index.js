import WaveSurfer from "../../node_modules/wavesurfer.js/dist/wavesurfer.js";
import Spectrogram from '../../node_modules/wavesurfer.js/dist/plugins/spectrogram.js'

class PlayerClient {
    constructor() {
        this.playerContainerElement = document.getElementById('player-line')
        this.localList = this.getLocalList()

        this.canvas = document.querySelector('canvas')
        this.ctx = this.canvas.getContext('2d')

        this.spectr = undefined

        this.player = this.getPlayerInstance('Король И Шут - Ром.mp3')
    }

    getAudioURL(trackName) {
        return `/audioTrack/?trackName=${trackName}`
    }

    getRemoteList() {
        return new Promise((res, rej) => {
            fetch('/audioList')
                .then(data => data.json())
                .then(List => res(List))
                .catch(Err => rej(Err))
        })
    }

    getLocalList() {
        const playlist = localStorage.getItem('playlist')
        if (playlist) {
            return JSON.stringify(playlist)
        } else {
            return null
        }
    }

    addToLocalList(trackName) {
        let localList = (() => {
            const list = this.getLocalList()
            if (list) {
                return list
            } else {
                return []
            }
        })()
        this.getRemoteList().then(List => {
            if (List.includes(trackName)) {
                localList.push({ fileName: trackName })
                localStorage.setItem('playlist', JSON.stringify(localList))
            } else {
                throw new Error('Такого трека нет на удаленном сервере')
            }
        })
    }

    removeFromLocalList(trackName) {
        let localList = (() => {
            const list = this.getLocalList()
            if (list) {
                return list
            } else {
                return []
            }
        })()
        localList = localList.filter(Item => Item.fileName !== trackName)
        localStorage.setItem('playlist', JSON.stringify(localList))
    }

    updateFrequencies() {
        this.spectr = this.player.getActivePlugins()[0].getFrequencies(app.player.getDecodedData())[0]
        this.Interval = setInterval(() => this.drawVisual(), Math.trunc(1000/15))
    }

    getPlayerInstance(trackName) {
        console.log(Spectrogram)
        const Player = WaveSurfer.create({
            container: this.playerContainerElement,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            url: trackName ? this.getAudioURL(trackName) : undefined,
            plugins: [
                Spectrogram.create({
                    container: document.getElementById('empty'),
                    frequencyMin: 20,
                    frequencyMax: 20000,
                })
            ]
        })
        Player.addEventListener('decode', this.updateFrequencies.bind(this))
        return Player
    }

    clearCanvas() {
        this.ctx.beginPath()
        this.ctx.clearRect(0, 0, 500, 300)
        this.ctx.stroke()
    }

    drawVisual() {
        this.clearCanvas()
        const duration = this.player.getDuration()
        const currentTime = this.player.getCurrentTime()
        const spectreIndex = Math.trunc(this.spectr.length * currentTime / duration)
        const currentSpectr = this.spectr[spectreIndex]
        const freqIndexes = new Array(16).fill(0).map((N,ind) => Math.pow(ind + 1, 2) - 1)
        console.log(freqIndexes)
        currentSpectr.forEach((Height, Index) => {
            const X = Index * 2
            const Y = 256 - Height
            this.ctx.beginPath()
            this.ctx.fillRect(X, Y, 2, Height)
            this.ctx.stroke()
        })
    }
}

const app = new PlayerClient()
window.app = app

// console.log(app.player.plugins[1].buffer)
app.player.getDecodedData()

console.log(app.player.getActivePlugins()[0].getFrequencies(app.player.getDecodedData()))

// Предположительно вот это выдает массив спектров частот в заисимости от времени. Примерно на 1 сек получается 15.5 спектров


// app.player.getActivePlugins()[0].getFrequencies(app.player.getDecodedData())[0].map(El => parseInt(El))