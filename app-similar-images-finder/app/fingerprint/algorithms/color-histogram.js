/**
 * 图像特征提取之“色彩分布法”（速度较快，准确度待测试）
 *
 * @param Object image 图像操作对象
 * @param Integer imgSize 压缩后的图像尺寸（默认16×16）
 * @return Array 包含64个数字的数组
 */
module.exports = function(image, imgSize = 16) {
    // 1. 图像压缩（保留色彩）
    const pixels = image.resize(imgSize).pixels

    // 2. 简化色彩
    const colorList = simplifyColors(pixels)

    // 3. 将简化后的颜色按 RGB 分组
    const colorGroup = groupColors(colorList)

    // 4. 创建完整的简单颜色对象
    const colorMap = createSimpleColorMap()

    // 5. 统计每种简单颜色的像素数量作为图像特征
    colorGroup.forEach(zone => colorMap[zone]++)
    return Object.values(colorMap)
}

/**
 * 将256种颜色值简化为4种
 * 0～63为第0种，64～127为第1种，128～191为第2种，192～255为第3种
 * RGB 总共构成 64 种颜色组合，任何颜色必然属于其中之一
 * 统计每种组合的像素数量可构成图像特征指纹
 *
 * @return Object 例如：{
 *  '0,0,0': 0,
 *  '0,0,1': 0,
 *  '0,0,2': 0,
 *  '0,0,3': 0,
 *  '0,1,0': 0,
 *  '0,1,1': 0,
 *  ...
 *  '3,3,3': 0,
 * }
 */
function createSimpleColorMap() {
    const zoneSize = 4
    const colorMap = {}

    for (let r = 0; r < zoneSize; r++) {
        for (let g = 0; g < zoneSize; g++) {
            for (let b = 0; b < zoneSize; b++) {
                colorMap[([r, g, b])] = 0
            }
        }
    }
    return colorMap
}

/**
 * 简化色彩
 *
 * @param Array imageData
 * @param Integer zoneSize
 * @return Array 例如：[ 2, 2, 2, 3, 3, 2, 3, 3, 3, 2, 2, 2 ]
 */
function simplifyColors(imageData, zoneSize = 4) {
    // 区间边界
    const zoneBorder = [0]
    for (let i = 1; i <= zoneSize; i++) {
        zoneBorder.push(256 / zoneSize * i - 1)
    }

    const simpleColors = []
    imageData.forEach((value, index) => {
        for (let i = 0; i < zoneBorder.length; i++) {
            if (value > zoneBorder[i] && value <= zoneBorder[i + 1]) {
                return simpleColors.push(i)
            }
        }
    })
    return simpleColors
}

/**
 * 将简单颜色值按 RGB 分组
 *
 * @param Array simpleColors
 * @return Array 例如：[ '2,2,2', '3,3,2', '3,3,3', '2,2,2' ]
 */
function groupColors(simpleColors) {
    const groupList = []
    let tempGroup = []

    simpleColors.forEach((value, index) => {
        tempGroup.push(value)

        // 每3个值组成RGB，在遍历到第三个值时重新分组
        if ((index + 1) % 3 === 0) {
            groupList.push(tempGroup.join(','))
            tempGroup = []
        }
    })
    return groupList
}
