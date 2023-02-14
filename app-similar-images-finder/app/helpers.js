const fs = require('fs')

/**
 * 读取目录下的所有文件
 *
 * @param String dir 目录路径
 * @param Boolean recursion 是否递归遍历子目录
 * @return Array
 */
exports.readDir = function(dir, recursion = false) {
    let result = []
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)

        files.forEach(path => {
            const file = {}
            file.path = dir + '/' + path

            const stat = fs.statSync(file.path)
            if (stat.isDirectory()) {
                if (recursion)
                    result = result.concat(exports.readDir(file.path, recursion))
            } else {
                file.size = stat.size
                result.push(file)
            }
        })
    }
    return result
}

/**
 * 字节数格式化
 *
 * @param Number bytes
 * @return String
 */
exports.formatBytes = function(bytes) {
    const units = ['B', 'K', 'M', 'G', 'T']
    let index = 0
    bytes = parseFloat(bytes)
    while (Math.abs(bytes) >= 1024) {
        bytes = bytes / 1024
        index++
        if (index === units.length - 1) break
    }
    bytes = index > 0 ? bytes.toFixed(index - 1) : bytes
    return parseFloat(bytes) + units[index]
}
