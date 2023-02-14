/**
 * 移动端下拉刷新组件
 */
class PullRefresh {

  /**
   * 构造函数：创建Loading所需元素
   */
  constructor() {
    // 最大可拉动距离
    this.maxPos = 200
    // 触发刷新的位置
    this.activePos = 120
    // loader 状态
    this.status = 0
    // 触摸开始的位置
    this.startY = 0
    // 锁定页面滚动
    this.locked = false

    // 同一元素的 keyframes 动画与下拉动画冲突，故创建单独的图标元素
    this.icon = document.createElement('div')
    // Loader 元素容器
    this.el = document.createElement('div')
    this.el.className = 'pull-refresh'
    this.el.appendChild(this.icon)
    document.body.appendChild(this.el)
  }

  /**
   * 绑定触摸事件
   * @param target 要绑定的目标容器
   * @param callback 刷新回调函数
   */
  bind(target, callback) {
    target.addEventListener('touchstart', e => {
      // 初始状态及目标容器滚动到顶部时触发
      if (this.status == 0 && target.scrollTop == 0) {
        this.status = 1
        this.startY = e.touches[0].clientY
        // 取消回弹动画，避免与跟随下拉的运动冲突
        this.el.classList.remove('trans')
      }
    })

    target.addEventListener('touchmove', e => {
      // 忽略未触发 touchstart 事件的滑动
      if (this.status <= 0) return
      let offsetY = e.touches[0].clientY - this.startY
      // 忽略向上滑动事件
      if (offsetY <= 0) return

      // 阻止页面滚动
      this.lockScroll()
      // 滑动到 activePos 后进入可触发刷新回调状态
      this.status = offsetY >= this.activePos ? 2 : 1

      // 滑动到达 maxPos 之前 Loader 图标跟随运动
      if (offsetY < this.maxPos) {
        this.rebound(offsetY)
      }
    })

    target.addEventListener('touchend', e => {
      // 解锁页面滚动
      this.unlockScroll()

      // 忽略未触发 touchstart 事件的滑动
      if (this.status <= 0) return
      // 增加回弹动画
      this.el.classList.add('trans')

      // 如果满足触发回调条件：回弹到 activePos、增加图标旋转，同时触发回调
      if (this.status == 2) {
        // -1 为回调等待状态，不允许再次下滑刷新
        this.status = -1
        this.rebound(this.activePos)
        this.icon.classList.add('rotate')
        // 避免刷新过快看不到效果
        setTimeout(callback, 1000)
      } else {
        // 不满足触发条件则恢复原状
        this.done()
      }
    })
  }

  rebound(y) {
    // 根据到达 maxPos 的比例旋转图标
    let degree = (y / this.maxPos) * 360

    // 根据到达 activePos 的比例调整透明度
    let opacity = y / this.activePos
    if (opacity > 1) opacity = 1

    // 回弹并旋转
    this.el.style.transform = 'translateY(' + y + 'px) rotate(' + degree + 'deg)'
    this.el.style.opacity = opacity
  }

  done() {
    // 恢复初始状态
    this.status = this.startY = 0
    this.icon.classList.remove('rotate')
    this.rebound(0)
  }

  pd(e) {
    e.preventDefault()
  }

  lockScroll() {
    if (!this.locked) {
      this.locked = true
      document.addEventListener('touchmove', this.pd, false)
    }
  }

  unlockScroll() {
    if (this.locked) {
      this.locked = false
      document.removeEventListener('touchmove', this.pd, false)
    }
  }

}
