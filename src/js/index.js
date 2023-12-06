import WaveSurfer from "../../node_modules/wavesurfer.js/dist/wavesurfer.js";
import Spectrogram from "../../node_modules/wavesurfer.js/dist/plugins/spectrogram.js";

class PlayerClient {
    constructor() {
        this.playerContainerElement = document.getElementById("player-line");
        this.localList = this.getLocalList();

        this.prevTrackButton = document.getElementById("prev-track");
        this.nextTrackButton = document.getElementById("next-track");
        this.playButton = document.getElementById("play");
        this.playButton.style.display = "none";
        this.pauseButton = document.getElementById("pause");
        this.volumeONButton = document.getElementById("volumeON");
        this.volumeOFFButton = document.getElementById("volumeOFF");
        this.volumeONButton.style.display = "none";

        this.volumeSlider = document.getElementById("volume-input");
        this.volumeSlider.addEventListener("input", () => {
            const val = this.volumeSlider.value;
            this.player.setVolume(+val / 100);
        });

        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.spectr = undefined;

        this.drawInterval;
        this.visualType = 1;

        this.player = this.getPlayerInstance("Stuart Chatwood - Welcome Within.mp3");
        this.player.addEventListener("finish", () => {
            clearInterval(this.drawInterval);
        });
        this.player.addEventListener("play", () => {
            clearInterval(this.drawInterval);
            this.drawInterval = setInterval(() => this.drawVisual(), Math.trunc(50));
        });
    }

    getAudioURL(trackName) {
        return `/audioTrack/?trackName=${trackName}`;
    }

    getRemoteList() {
        return new Promise((res, rej) => {
            fetch("/audioList")
                .then((data) => data.json())
                .then((List) => res(List))
                .catch((Err) => rej(Err));
        });
    }

    getLocalList() {
        const playlist = localStorage.getItem("playlist");
        if (playlist) {
            return JSON.stringify(playlist);
        } else {
            return null;
        }
    }

    addToLocalList(trackName) {
        let localList = (() => {
            const list = this.getLocalList();
            if (list) {
                return list;
            } else {
                return [];
            }
        })();
        this.getRemoteList().then((List) => {
            if (List.includes(trackName)) {
                localList.push({ fileName: trackName });
                localStorage.setItem("playlist", JSON.stringify(localList));
            } else {
                throw new Error("Такого трека нет на удаленном сервере");
            }
        });
    }

    removeFromLocalList(trackName) {
        let localList = (() => {
            const list = this.getLocalList();
            if (list) {
                return list;
            } else {
                return [];
            }
        })();
        localList = localList.filter((Item) => Item.fileName !== trackName);
        localStorage.setItem("playlist", JSON.stringify(localList));
    }

    updateFrequencies() {
        this.spectr = this.player.getActivePlugins()[0].getFrequencies(app.player.getDecodedData())[0];
    }

    getPlayerInstance(trackName) {
        const Player = WaveSurfer.create({
            container: this.playerContainerElement,
            waveColor: "rgb(200, 0, 200)",
            progressColor: "rgb(100, 0, 100)",
            url: trackName ? this.getAudioURL(trackName) : undefined,
            plugins: [
                Spectrogram.create({
                    container: document.getElementById("empty"),
                    fftSamples: 32,
                }),
            ],
        });
        Player.addEventListener("decode", this.updateFrequencies.bind(this));
        return Player;
    }

    clearCanvas() {
        this.ctx.beginPath();
        this.ctx.clearRect(0, 0, 600, 600);
        this.ctx.stroke();
    }

    drawVisual() {
        this.clearCanvas();
        const duration = this.player.getDuration();
        const currentTime = this.player.getCurrentTime();
        const spectreIndex = Math.trunc((this.spectr.length * currentTime) / duration);
        const currentSpectr = this.spectr[spectreIndex];

        const type = 2;
        switch (type) {
            case 0:
                {
                    const gradient = this.ctx.createLinearGradient(0, 0, 0, 256);
                    gradient.addColorStop(0, "red");
                    gradient.addColorStop(1, "blue");
                    currentSpectr.forEach((Height, Index) => {
                        if (Height <= 1) return;
                        const X = Index * 32;
                        const Y = 256 - Height;
                        this.ctx.beginPath();
                        this.ctx.fillStyle = gradient;
                        this.ctx.fillRect(X + 8, Y, 16, Height);
                        this.ctx.stroke();
                    });
                }
                break;
            case 1:
                {
                    const gradient = this.ctx.createLinearGradient(0, 0, 256, 0);
                    gradient.addColorStop(0, "LimeGreen");
                    gradient.addColorStop(1, "DarkOrange");
                    currentSpectr.forEach((Height, Index) => {
                        if (Index === 0) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(16, 256 - Height);
                        } else if (Index === currentSpectr.length - 1) {
                            this.ctx.lineTo(Index * 32 + 16, 256 - Height);
                            this.ctx.strokeStyle = gradient;
                            this.ctx.lineWidth = 1;
                            this.ctx.stroke();
                        } else {
                            this.ctx.lineTo(Index * 32 + 16, 256 - Height);
                        }
                        this.ctx.lineJoin = "round";
                    });
                }
                break;
            case 2:
                {
                    const gradient = this.ctx.createLinearGradient(0, 0, 0, 256);
                    gradient.addColorStop(0, "red");
                    gradient.addColorStop(0.5, "blue");
                    gradient.addColorStop(1, "red");
                    currentSpectr.forEach((Height, Index) => {
                        if (Height <= 1) return;
                        const X = Index * 32;
                        const Y = 128 - Height / 2;
                        this.ctx.beginPath();
                        this.ctx.fillStyle = gradient;
                        this.ctx.fillRect(X + 8, Y, 16, Height);
                        this.ctx.stroke();
                    });
                }
                break;
            default:
                break;
        }
    }
}

const app = new PlayerClient();
window.app = app;
