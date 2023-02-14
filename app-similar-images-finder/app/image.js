/**
 * 图像处理
 *
 * @param String src 图像地址
 * @return Object
 */
module.exports = async function(src) {

    /**
     * 大律法（OTSU Algorithm）计算二值图的最佳阈值
     * Rewrite from http://www.labbookpages.co.uk/software/imgProc/otsuThreshold.html
     *
     * @param Array grayData 灰度图数据
     * @return Integer 0~255
     */
    function otsuThreshold(grayData) {
        let ptr = 0
        let histData = Array(256).fill(0)
        let total = grayData.length

        while (ptr < total) {
            let h = 0xFF & grayData[ptr++]
            histData[h]++
        }

        let sum = 0
        for (let i = 0; i < 256; i++) {
            sum += i * histData[i]
        }

        let wB = 0
        let wF = 0
        let sumB = 0
        let varMax = 0
        let threshold = 0

        for (let t = 0; t < 256; t++) {
            wB += histData[t]
            if (wB === 0) continue
            wF = total - wB
            if (wF === 0) break

            sumB += t * histData[t]
            let mB = sumB / wB
            let mF = (sum - sumB) / wF
            let varBetween = wB * wF * (mB - mF) ** 2

            if (varBetween > varMax) {
                varMax = varBetween
                threshold = t
            }
        }
        return threshold
    }

    /**
     * 用 Canvas 进行图像缩放（保留色彩）
     *
     * @param Number width 压缩宽度（默认 8）
     * @param Number height 压缩高度（默认 0）
     * @return Object
     */
    this.resize = (width = 8, height = 0) => {
        height = height || width
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d', { alpha: false })
        ctx.drawImage(this.image, 0, 0, width, height)
        const data = ctx.getImageData(0, 0, width, height).data

        // 去除 Alpha 通道（data 数组中颜色值顺序为 RGBA，去掉其中的 A）
        this.pixels = []
        for (let i = 0; i < data.length; i += 4) {
            this.pixels.push(data[i], data[i + 1], data[i + 2])
        }
        return this
    }

    /**
     * 图像灰度处理
     *
     * 普通灰度图忽略了红、绿、蓝三种颜色的波长以及对整体图像的影响，生成的图像偏暗，不利于后续生成二值图
     * 鉴于红光有着更长的波长，而绿光波长更短且对视觉的刺激相对更小，所以需地减小红光的权重而提升绿光的权重。
     * 经过统计，较好的权重比是 R:G:B = 0.299:0.587:0.114
     * https://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
     *
     * @return Object
     */
    this.grayscale = () => {
        const GrayscaleWeight = { R: 0.299, G: 0.587, B: 0.114 }
        const grayPixels = []

        for (let i = 0; i < this.pixels.length; i += 3) {
            const r = this.pixels[i] * GrayscaleWeight.R
            const g = this.pixels[i + 1] * GrayscaleWeight.G
            const b = this.pixels[i + 2] * GrayscaleWeight.B
            grayPixels.push(~~(r + g + b))
        }
        this.pixels = grayPixels
        return this
    }

    /**
     * 生成二值图（只有黑白两色）
     * @return Object
     */
    this.binaryzation = () => {
        const threshold = otsuThreshold(this.pixels) // 计算阈值
        this.pixels.forEach((v, i) => this.pixels[i] = v > threshold ? 1 : 0)
        return this
    }

    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = src
        image.onerror = reject

        image.onload = () => {
            this.image = image
            this.width = image.width
            this.height = image.height
            resolve(this)
        }
    })
}
