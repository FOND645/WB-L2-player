import WaveSurfer from "wavesurfer.js";

const player = WaveSurfer.create({
    container: this.playerContainerElement,
    waveColor: 'rgb(200, 0, 200)',
    progressColor: 'rgb(100, 0, 100)',
    url: this.getAudioURL(trackName),
})

