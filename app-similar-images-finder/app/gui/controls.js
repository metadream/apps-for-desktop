const { dialog } = require('electron').remote
const message = require('./message')
const Facade = require('../facade')

class Controls {
    constructor() {
        const openBtn = document.querySelector('.open-btn')
        const scanBtn = document.querySelector('.scan-btn')

        openBtn.onclick = () => {
            const dir = dialog.showOpenDialogSync({
                properties: ['openDirectory', 'showHiddenFiles']
            })
            if (dir) {
                openBtn.value = dir
            }
        }

        scanBtn.onclick = async () => {
            const options = this._getOptions()
            if (!options.path) {
                message('Images folder cannot be empty', 'orange')
                return
            }

            scanBtn.disabled = true
            options.threshold = parseFloat(options.threshold) / 100
            const facade = new Facade(options)

            message('Loading images...')
            facade.loadImages()

            await facade.createImageFingerprints((image, index, length) => {
                message(`Analyzing images... ${index}/${length}`)
            })

            message('Comparing images...')
            const result = facade.compareImages()
            message(result.length + ' groups of similar images found', 'green')
            scanBtn.disabled = false

            this.onScanCompleted(result)
        }

    }

    _getOptions() {
        const data = {}
        const fields = document.querySelectorAll('[id]')
        fields.forEach(el => {
            if (el.type == 'checkbox') {
                data[el.id] = el.checked
            } else {
                data[el.id] = el.value
            }
        })
        return data
    }

}

module.exports = new Controls()
