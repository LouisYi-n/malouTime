Page({
  data: {
    backgroundColor: getApp().globalData.backgroundColor || '#FFE7BA'
  },

  onLoad() {
    // 获取保存的背景色
    const app = getApp()
    const backgroundColor = app.globalData.backgroundColor
    if (backgroundColor) {
      this.setData({ backgroundColor })
    }
  },

  onShow() {
    // 每次显示页面时更新背景色
    const app = getApp()
    const backgroundColor = app.globalData.backgroundColor
    if (backgroundColor) {
      this.setData({ backgroundColor })
    }
  },

  // 点击分享按钮
  onShareClick() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 用户点击右上角分享或转发按钮
  onShareAppMessage() {
    return {
      title: '时间牛马 - 你的贴心工作助手',
      path: '/pages/index/index',
      imageUrl: '/assets/share-image.png' // 如果有分享图片的话
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '时间牛马 - 你的贴心工作助手',
      query: '',
      imageUrl: '/assets/share-image.png' // 如果有分享图片的话
    }
  }
}) 