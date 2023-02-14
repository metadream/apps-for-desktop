/**
 * 图像特征提取之“感知哈希算法”（速度较慢，准确度较高）
 *
 * @param Object image 图像操作对象
 * @param String imgSize 压缩后图像尺寸（默认32×32，使用DCT矩阵左上角8×8区域）
 * @return String 64位二进制字符串
 */
module.exports = function(image, imgSize = 32, rangeSize = 8) {
    // 1. 生成灰度图
    const pixels = image.resize(imgSize).grayscale().pixels

    // 2. DCT 变换
    const dctData = dct(pixels)

    // 3. 创建 DCT 矩阵
    const dctMatrix = createMatrix(dctData)

    // 4. 选取 DCT 矩阵左上角区域
    const rangeMatrix = selectMatrixRange(dctMatrix, rangeSize)

    // 5. 生成图像指纹: 某个像素的 DCT 值大于平均 DCT 值标记为1, 否则标记为0
    const averageDct = rangeMatrix.reduce((acc, val) => (acc + val), 0) / rangeMatrix.length
    return rangeMatrix.map(val => (val >= averageDct ? 1 : 0)).join('')
}

/**
 * DCT（离散余弦变换）
 * 将图像从像素域转换到频率域，携带有效信息的低频成分会集中在 DCT 矩阵的左上角
 *
 * @param ImageData signal
 * @param Integer scale
 * @return Array
 */
function dct(signal, scale = 2) {
    const length = signal.length
    const cosines = new Array(length * length)
    for (let i = 0; i < length; i++) {
        for (let n = 0; n < length; n++) {
            cosines[n + (i * length)] = Math.cos(Math.PI / length * (n + 0.5) * i)
        }
    }

    const coefficients = signal.map(() => 0)
    return coefficients.map((_, i) => {
        return scale * signal.reduce((prev, cur, index) => {
            return prev + (cur * cosines[index + (i * length)])
        }, 0)
    })
}

/**
 * 创建DCT矩阵：将一维数组转换为二维数组
 *
 * @param Array arr 一维数组
 * @return Array 二维数组
 */
function createMatrix(arr) {
    const size = Math.sqrt(arr.length)
    const matrix = []
    for (let i = 0; i < size; i++) {
        const temp = arr.slice(i * size, i * size + size)
        matrix.push(temp)
    }
    return matrix
}

/**
 * 获取矩阵中左上角范围为 range×range 的内容
 *
 * @param Array matrix 二维数组
 * @return Array 一维数组
 */
function selectMatrixRange(matrix, range) {
    const rangeMatrix = []
    for (let i = 0; i < range; i++) {
        for (let j = 0; j < range; j++) {
            rangeMatrix.push(matrix[i][j])
        }
    }
    return rangeMatrix
}
