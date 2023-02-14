/**
 * 图像特征提取之“差异哈希算法”（速度较快，准确度较高）
 * 比较相邻像素灰度值差异，9*8尺寸共产生64个差异值
 *
 * @param Object image 图像操作对象
 * @param String imgSize 压缩后图像尺寸（默认8）
 * @return String 64位二进制字符串
 */
module.exports = function(image, imgSize = 8) {
    // 1. 生成灰度图（宽度+1共产生size*size个差异值）
    const pixels = image.resize(imgSize + 1, imgSize).grayscale().pixels

    // 2. 生成图像指纹: 左边的像素值大于右边像素值则标记为1, 否则标记为0
    let result = ''
    for (let h = 0; h < imgSize; h++) {
        for (let w = 0; w < imgSize; w++) {
            const i = h * imgSize + w
            result += pixels[i] > pixels[i + 1] ? 1 : 0
        }
    }
    return result
}
