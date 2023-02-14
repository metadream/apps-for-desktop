/**
 * 图像特征比对之“汉明距离”（适用于字符串指纹）
 * 汉明距离: 将一个字符串变换成另一个字符串所需替换的字符数
 * 相似度 = (字符串长度 - 汉明距离) / 字符串长度
 *
 * @param String str1
 * @param String str2
 * @param Number 相似度
 */
exports.hamming = function(str1, str2) {
    let distance = 0
    str1 = str1.split('')
    str2 = str2.split('')

    str1.forEach((letter, index) => {
        if (letter !== str2[index]) distance++
    })
    const similarity = (str1.length - distance) / str1.length
    return similarity.toFixed(4)
}

/**
 * 图像特征比对之“余弦相似度”（适用于色彩分布法）
 * cosθ = ∑n, i=1(Ai × Bi) / (√∑n, i=1(Ai)^2) × (√∑n, i=1(Bi)^2) = A · B / |A| × |B|
 *
 * @param Array arr1
 * @param Array arr2
 * @param Number 相似度
 */
exports.cosine = function(arr1, arr2) {
    const length = arr1.length
    let inner = 0
    for (let i = 0; i < length; i++) {
        inner += arr1[i] * arr2[i]
    }
    let vecA = 0
    let vecB = 0
    for (let i = 0; i < length; i++) {
        vecA += arr1[i] ** 2
        vecB += arr2[i] ** 2
    }
    const outer = Math.sqrt(vecA) * Math.sqrt(vecB)
    return (inner / outer).toFixed(4)
}
