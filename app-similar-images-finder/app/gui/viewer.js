class Viewer {
    constructor() {
        this.isOpened = false
        this.title = document.title
        this.viewer = document.querySelector('.viewer')
        this.image = this.viewer.querySelector('img')

        PanZoom('.viewer img', {
            minScale: 0.2,
            maxScale: 30,
            increment: 0.1
        })

        this.viewer.onclick = e => {
            if (!this.image.contains(e.target)) this.close()
        }
        this.viewer.ondblclick = () => {
            this.close()
        }
        document.addEventListener('keydown', e => {
            if (!this.isOpened) return
            if (e.keyCode === 27) { // esc
                return this.close()
            }
        })
    }

    setGallery(gallery) {
        this.gallery = gallery
    }

    open(pos) {
        this.isOpened = true
        this.slide(pos)
        this.viewer.style.display = 'flex'
    }

    slide(pos) {
        const image = this.gallery[pos]
        if (image) {
            this.image.src = image.path
            document.title = image.path + ` (${image.dimension} | ${image.hsize})`
        } else {
            this.close()
        }
    }

    close() {
        this.isOpened = false
        this.viewer.style.display = 'none'
        this.image.style.transform = 'matrix(1, 0, 0, 1, 0, 0)'
        document.title = this.title
    }
}

module.exports = new Viewer()
