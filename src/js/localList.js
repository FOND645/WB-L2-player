export class localPlaylist {
    constructor(Player) {
        this.playlistContainer = document.getElementById('local-list')
        this.selectedSongInd = -1
        this.playingIndex = -1
        this.Player = Player
        this.renderPlayList()
    }

    renderPlayList() {
        const playlist = this.getLocalList()
        this.playlistContainer.innerHTML = ''
        const title = document.createElement('p')
        title.innerText = 'Локальный плейлист'
        title.classList.add('playlist-title')
        this.playlistContainer.appendChild(title)
        playlist.forEach((Track, ind) => {
            console.log()
            const row = document.createElement('div')
            row.classList.add('listItem')
            if (ind === this.selectedSongInd) {
                row.style.backgroundColor = 'LightSkyBlue'
            }
            row.addEventListener('click', () => {
                this.selectedSongInd = ind
                this.renderPlayList()
            })
            this.playlistContainer.append(row)

            const buttonContainer = document.createElement('div')
            buttonContainer.classList.add('playlist-button-contianer')
            row.appendChild(buttonContainer)

            const deleteButton = document.createElement('p')
            deleteButton.innerText = '🗑'
            deleteButton.addEventListener('click', () => {
                this.removeFromLocalList(ind)
                this.renderPlayList()
            })
            deleteButton.classList.add('playlist-button')
            buttonContainer.appendChild(deleteButton)

            const playButton = document.createElement('p')
            playButton.innerText = '▷'
            playButton.addEventListener('click', () => {
                // this.Player.playerParams.url = 
                // console.log(this.Player.player.setOptions)
                this.Player.player.setOptions({url: this.getAudioURL(Track.fileName)})
            })
            playButton.classList.add('playlist-button')

            const textElement = document.createElement('p')
            textElement.innerText = Track.fileName
            row.appendChild(textElement)

            buttonContainer.appendChild(playButton)
        })
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
            return JSON.parse(playlist);
        } else {
            return [];
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
                this.renderPlayList()
            } else {
                throw new Error("Такого трека нет на удаленном сервере");
            }
        });
    }

    removeFromLocalList(index) {
        let localList = (() => {
            const list = this.getLocalList();
            if (list) {
                return list;
            } else {
                return [];
            }
        })();
        localList = localList.filter((Item, ind) => ind !== index);
        localStorage.setItem("playlist", JSON.stringify(localList));
        this.renderPlayList()
    }
}