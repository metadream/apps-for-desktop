/**
 * --------------------------------------------------------
 * Renderer Process
 * Author: Ai Chen
 * Copyright (c) 2020 Cloudseat.net
 * --------------------------------------------------------
 */
const { formatBytes } = require('../helpers')
const controls = require('./controls')
const grid = require('./grid')
const viewer = require('./viewer')

controls.onScanCompleted = function(result) {
    result = flatten(result)
    viewer.setGallery(result)

    grid.render(result)
    grid.onSelectedOpen = pos => viewer.open(pos)
    grid.onSelectedChanged = pos => viewer.slide(pos)
}

function flatten(list) {
    const result = []
    list.forEach((group, index) => {
        group.forEach((image, i) => {
            image.group = i == 0 ? index + 1 : ''
            image.dimension = image.width + '×' + image.height
            image.hsize = formatBytes(image.size)
            image.percent = Math.round(image.similarity * 100) + '%'
            result.push(image)
        })
    })
    return result
}
