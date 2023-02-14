const message = document.querySelector('.message')
let timer = null

module.exports = function(text, color) {
    message.innerHTML = text
    message.style.color = color || '#333'
    message.style.display = 'block'

    clearTimeout(timer)
    timer = setTimeout(function() {
        message.style.display = 'none'
        message.innerHTML = ''
    }, 3000)

}
