export class remoteList {
    constructor(Player) {
        this.playlistContainer = document.getElementById('remote-list')
        this.selectedSongInd = -1
        this.Player = Player
        this.renderPlayList()
    }

    async renderPlayList() {
        const playlist = await this.getRemoteList()
        this.playlistContainer.innerHTML = ''
        const title = document.createElement('p')
        title.innerText = 'Удаленный плейлист'
        title.classList.add('playlist-title')
        this.playlistContainer.appendChild(title)
        playlist.forEach((TrackName, ind) => {
            const row = document.createElement('div')
            row.classList.add('listItem')
            if (ind === this.selectedSongInd) {
                row.style.backgroundColor = 'LightSkyBlue'
            }
            row.addEventListener('click', () => {
                this.selectedSongInd = ind
                this.renderPlayList()
            })
            this.playlistContainer.appendChild(row)

            const addButton = document.createElement('p')
            addButton.innerText = 'ᐊ'
            addButton.addEventListener('click', () => {
                this.Player.localList.addToLocalList(TrackName)
            })
            addButton.classList.add('playlist-button')
            row.appendChild(addButton)

            const textElement = document.createElement('p')
            textElement.innerText = TrackName
            row.appendChild(textElement)
        })
    }

    getRemoteList() {
        return new Promise((res, rej) => {
            fetch("/audioList")
                .then((data) => data.json())
                .then((List) => res([...List]))
                .catch((Err) => rej(Err));
        });
    }
}