// https://juejin.cn/post/6844904016686628877
// http://www.ruanyifeng.com/blog/2013/03/similar_image_search_part_ii.html
const similarity = require('./similarity')

module.exports = class {
    /**
     * @param String algorithm
     * AVERAGE_HASH: 平均哈希算法（默认）
     * DIFFERENT_HASH: 差异哈希算法
     * PERCEIVE_HASH: 感知哈希算法
     * CONTENT_FEATURE: 内容特征算法
     * COLOR_HISTOGRAM: 色彩分布算法
     */
    constructor(algorithm) {
        this.algorithm = algorithm || 'AVERAGE_HASH'
        this.algFunc = require('./algorithms/' + this.algorithm.toLowerCase().replace('_', '-'))
    }

    /**
     * 生成图像指纹
     * @param Object image 图像操作对象
     * @return String/Array
     */
    generate(image) {
        return this.algFunc(image)
    }

    /**
     * 比对图像指纹
     * @param String/Array fp1
     * @param String/Array fp1
     */
    compare(fp1, fp2) {
        return this.algorithm === 'COLOR_HISTOGRAM' ?
            similarity.cosine(fp1, fp2) :
            similarity.hamming(fp1, fp2)
    }

}
