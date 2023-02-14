/**
 * 图像特征提取之“平均哈希算法”（速度较快，准确度较低）
 *
 * @param Object image 图像操作对象
 * @param String imgSize 压缩后图像尺寸（默认8×8）
 * @return String 64位二进制字符串
 */
module.exports = function(image, imgSize = 8) {
    // 1. 生成灰度图
    const pixels = image.resize(imgSize).grayscale().pixels

    // 2. 生成图像指纹: 某个像素的灰度值大于平均灰度值标记为1, 否则标记为0
    const averageGray = pixels.reduce((acc, val) => (acc + val), 0) / pixels.length
    return pixels.map(val => (val > averageGray ? 1 : 0)).join('')
}
