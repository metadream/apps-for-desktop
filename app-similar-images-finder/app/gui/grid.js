const { dialog } = require('electron').remote
const fs = require('fs')

class Grid {
    constructor() {
        this.grid = document.querySelector('table')

        document.addEventListener('keydown', e => {
            e.preventDefault()
            if (this.grid.rows.length <= 1) {
                return
            }

            const selected = this.grid.querySelector('tr.selected')
            if (selected) {
                if (e.keyCode === 13) { // enter
                    this.onSelectedOpen(selected.rowIndex - 1)
                    return
                }
                if (e.keyCode === 46) { // delete
                    this.remove(selected.rowIndex - 1)
                    return
                }
            }

            let pos = selected ? selected.rowIndex - 1 : -1
            if (e.keyCode === 37 || e.keyCode === 38) { // left/up arrow
                pos = this.getPosition(--pos)
                this.select(pos)
                this.onSelectedChanged(pos)
                return
            }
            if (e.keyCode === 39 || e.keyCode === 40) { // right/down arrow
                pos = this.getPosition(++pos)
                this.select(pos)
                this.onSelectedChanged(pos)
                return
            }
        })
    }

    render(result) {
        this.gallery = result
        const rows = this.grid.querySelectorAll('tr:not(:first-child)')
        rows.forEach(row => row.remove())

        result.forEach(image => {
            const row = this.grid.insertRow()
            row.insertCell().innerHTML = image.group
            row.insertCell().innerHTML = image.path
            row.insertCell().innerHTML = image.dimension
            row.insertCell().innerHTML = image.hsize
            row.insertCell().innerHTML = image.percent

            row.onclick = () => {
                this.select(row.rowIndex - 1) // 排除标题行
            }
            row.ondblclick = () => {
                this.onSelectedOpen(row.rowIndex - 1)
            }
        })
    }

    select(pos) {
        const selected = this.grid.querySelector('tr.selected')
        if (selected) {
            selected.classList.remove('selected')
        }
        if (this.grid.rows.length > 1) {
            this.grid.rows[pos + 1].classList.add('selected')
        }
    }

    remove(pos) {
        const file = this.gallery[pos]
        const result = dialog.showMessageBoxSync({
            type: 'question',
            message: `Are you sure to remove '${file.path}' from disk completely ?`,
            buttons: ['No', 'Yes'],
            defaultId: 1
        })
        if (result === 0) {
            return
        }

        this.gallery.splice(pos, 1)[0]
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
        }

        const row = this.grid.rows[pos + 1]
        row.remove()

        pos = this.getPosition(pos)
        this.select(pos)
        this.onSelectedChanged(pos)
    }

    getPosition(pos) {
        if (pos < 0) {
            pos = 0
        } else
        if (pos > this.gallery.length - 1) {
            pos = this.gallery.length - 1
        }
        return pos
    }

}

module.exports = new Grid()
