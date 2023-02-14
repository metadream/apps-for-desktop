const { readDir } = require('./helpers')
const Image = require('./image')
const Fingerprint = require('./fingerprint')

module.exports = class {
    /**
     * @param String path 目录路径
     * @param Boolean recursion 是否遍历子目录
     * @param String algorithm 图像特征指纹算法
     * @param Number threshold 相似度阈值
     */
    constructor(options = {}) {
        this.path = options.path
        this.recursion = options.recursion
        this.threshold = options.threshold || 0.9
        this.fingerprint = new Fingerprint(options.algorithm)
    }

    /**
     * 加载指定目录下的图片文件
     */
    loadImages() {
        const time = Date.now()
        this.files = readDir(this.path, this.recursion)
        this.files = this.files.filter(file => /\.(bmp|jpg|jpeg|png|webp)$/i.test(file.path))
        console.log(`Images loaded in ${ Date.now() - time } ms`)
    }

    /**
     * 创建所有图片的特征指纹
     * @param Function callback 回调函数
     */
    async createImageFingerprints(callback) {
        const time = Date.now()
        const length = this.files.length
        let index = 0

        for (let file of this.files) {
            const image = await Image(file.path)
            file.fingerprint = this.fingerprint.generate(image)
            file.width = image.width
            file.height = image.height
            index++

            if (callback) {
                callback(file, index, length)
            }
        }
        console.log(`Fingerprints created in ${ Date.now() - time } ms`)
    }

    /**
     * 比对图片指纹
     * @return Array 二维数组
     */
    compareImages() {
        const time = Date.now()
        const result = []
        const length = this.files.length

        for (let i = 0; i < length; i++) {
            if (i === length - 1) break // 最后一张图片不用比对
            let group = null // 相似图片分组

            for (let j = i + 1; j < length; j++) {
                const file1 = Object.assign({}, this.files[i])
                const file2 = Object.assign({}, this.files[j])
                const similarity = this.fingerprint.compare(file1.fingerprint, file2.fingerprint)

                if (similarity >= this.threshold) {
                    if (!group) {
                        group = []
                        result.push(group)
                    }
                    file1.similarity = file2.similarity = similarity
                    group.push(file1, file2)
                }
            }
        }
        console.log(`Images compared in ${ Date.now() - time } ms`)
        return result
    }
}
