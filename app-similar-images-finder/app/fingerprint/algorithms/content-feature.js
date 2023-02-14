/**
 * 图像特征提取之“内容特征法”（速度较快，准确度待测试）
 *
 * @param Object image 图像操作对象
 * @param String imgSize 压缩后图像尺寸（默认8×8）
 * @return String 64位二进制字符串
 */
module.exports = function(image, imgSize = 8) {
    // 1. 压缩->灰度图->二值图
    const pixels = image.resize(imgSize).grayscale().binaryzation().pixels

    // 2. 二值图即图像指纹
    return pixels.join('')
}
