const express = require('express')
const path = require('path')
const fs = require('fs')

const HTTP_PORT = 28080

class PlayerServer {
    constructor(port) {
        this.server = express()
        this.port = port
        this.audioFolder = path.resolve(__dirname, 'audio')

        this.server.get('/audioList', this.getAudioList.bind(this))

        this.server.get('/audioTrack', this.getAudio.bind(this))

        this.server.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`)
        })
    }

    getAudio(req, res) {
        const { trackName } = req.query
        const trackPath = path.resolve(this.audioFolder, trackName)
        fs.readFile(trackPath, { encoding: 'binary' }, (err, data) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).send(data)
            }
        })
    }

    getAudioList(req, res) {
        fs.readdir(this.audioFolder, (err, files) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).send(files)
            }
        })
    }
}

const playerServer = new PlayerServer(HTTP_PORT)