import WaveSurfer from "../../node_modules/wavesurfer.js/dist/wavesurfer.js";
import Spectrogram from "../../node_modules/wavesurfer.js/dist/plugins/spectrogram.js";
import {localPlaylist} from './localList.js'
import {remoteList} from './remoteList.js'

export class PlayerClient {
    constructor() {
        this.playerContainerElement = document.getElementById("player-line");

        this.prevTrackButton = document.getElementById("prev-track");
        this.nextTrackButton = document.getElementById("next-track");

        this.changeVisualButton = document.getElementById('change-visual')
        this.changeVisualButton.addEventListener('click', this.changeVisual.bind(this))
        
        this.playButton = document.getElementById("play");
        this.pauseButton = document.getElementById("pause");
        this.pauseButton.style.display = "none";
        [this.playButton, this.pauseButton].forEach(Btn => Btn.addEventListener('click', this.playPause.bind(this)))

        this.volumeOFFButton = document.getElementById('volumeOFF')
        this.volumeONButton = document.getElementById('volumeON')
        this.volumeOFFButton.style.display = "none";
        [this.volumeONButton, this.volumeOFFButton].forEach(Btn => Btn.addEventListener('click', this.setMuted.bind(this)))

        this.volumeSlider = document.getElementById("volume-input");
        this.volumeSlider.addEventListener("input", () => {
            const val = this.volumeSlider.value;
            this.player.setVolume(+val / 100);
        });

        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.spectr = undefined;
        this.playerParams = {
            container: this.playerContainerElement,
            waveColor: "rgb(200, 0, 200)",
            progressColor: "rgb(100, 0, 100)",
            url: this.getAudioURL('Stuart Chatwood - Welcome Within.mp3'),
            plugins: [
                Spectrogram.create({
                    container: document.getElementById("empty"),
                    fftSamples: 32,
                }),
            ],
        }

        this.drawInterval;
        this.visualType = 1;

        this.player = this.getPlayerInstance();
        this.player.addEventListener("finish", () => {
            clearInterval(this.drawInterval);
        });
        this.player.addEventListener("play", () => {
            clearInterval(this.drawInterval);
            this.drawInterval = setInterval(() => this.drawVisual(), Math.trunc(50));
        });

        this.remoteList = new remoteList(this)
        this.localList = new localPlaylist(this)
    }

    changeVisual() {
        this.visualType = (this.visualType + 1) % 3
    }

    setMuted() {
        const isMute = this.player.getMuted()
        if (isMute) {
            this.volumeOFFButton.style.display = 'none'
            this.volumeONButton.style.display = 'flex'
            this.player.setMuted(false)
        } else {
            this.volumeOFFButton.style.display = 'flex'
            this.volumeONButton.style.display = 'none'
            this.player.setMuted(true)

        }
    }

    playPause() {
        const isPlaying = this.player.isPlaying()
        if (isPlaying) {
            this.player.pause()
            this.playButton.style.display = 'flex'
            this.pauseButton.style.display = 'none'
        } else {
            this.player.play()
            this.pauseButton.style.display = 'flex'
            this.playButton.style.display = 'none'
        }
    }

    getAudioURL(trackName) {
        return `/audioTrack/?trackName=${trackName}`;
    }

    updateFrequencies() {
        this.spectr = this.player.getActivePlugins()[0].getFrequencies(this.player.getDecodedData())[0];
    }

    getPlayerInstance(trackName) {
        const Player = WaveSurfer.create(this.playerParams);
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

        switch (this.visualType) {
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