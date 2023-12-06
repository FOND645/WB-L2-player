import WaveSurfer from "../../node_modules/wavesurfer.js/dist/wavesurfer.js";

class PlayerClient {
    constructor() {
        this.playerContainerElement = document.getElementById('player-container')
        this.player = this.getPlayerInstance('')
        this.localList = this.getLocalList()

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
                localList.push({fileName: trackName})
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
    
    getPlayerInstance(trackName) {
        const Player = WaveSurfer.create({
            container: this.playerContainerElement,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            url: this.getAudioURL(trackName),
        })
        return Player
    }
}

const app = new PlayerClient()

window.app = app

const Player = WaveSurfer.create({
    container: document.getElementById('player-container'),
    waveColor: 'rgb(200, 0, 200)',
    progressColor: 'rgb(100, 0, 100)',
    url: '/audioTrack/?trackName=Linkin Park - One Step Closer.mp3',
})

Player.on('click', () => {
    Player.play()
})
