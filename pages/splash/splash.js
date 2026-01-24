// pages/splash/splash.js
const app = getApp()

Page({
  data: {
    animationClass: ''
  },

  onLoad() {
    // 启动动画
    this.setData({
      animationClass: 'fade-in'
    })

    // 2秒后自动跳转到首页
    setTimeout(() => {
      this.setData({
        animationClass: 'fade-out'
      })
      // 动画结束后跳转
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    }, 2000)
  }
})
