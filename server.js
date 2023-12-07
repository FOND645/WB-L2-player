const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const HTTP_PORT = 28080;

class PlayerServer {
    constructor(port) {
        this.server = express();
        this.port = port;
        this.audioFolder = path.resolve(__dirname, "audio");
        this.staticFolder = path.resolve(__dirname, "src");
        this.nodeModulesFolder = path.resolve(__dirname, "node_modules");

        const audioStorage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, "audio/");
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            },
        });

        const uploader = multer({ storage: audioStorage });

        this.server.get("/", this.getIndexPage.bind(this));
        this.server.get("/audioList", this.getAudioList.bind(this));
        this.server.get("/audioTrack", this.getAudio.bind(this));

        this.server.use("/node_modules", express.static(this.nodeModulesFolder));
        this.server.use("/src", express.static(this.staticFolder));

        this.server.post("/uploadTrack", uploader.single("file"), (req, res) => {
            res.status(200).send("success");
        });

        this.server.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }

    getIndexPage(req, res) {
        res.status(200).sendFile(path.resolve(this.staticFolder, "index.html"));
    }

    getAudio(req, res) {
        const { trackName } = req.query;
        const trackPath = path.resolve(this.audioFolder, trackName);
        if (this.isFileAvailable(trackPath)) {
            res.status(200).sendFile(trackPath);
        } else {
            res.sendStatus(404);
        }
    }

    getAudioList(req, res) {
        fs.readdir(this.audioFolder, (err, files) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(files);
            }
        });
    }

    isFileAvailable(filePath) {
        try {
            fs.accessSync(filePath, fs.constants.R_OK);
            return true;
        } catch (err) {
            return false;
        }
    }
}

const playerServer = new PlayerServer(HTTP_PORT);
