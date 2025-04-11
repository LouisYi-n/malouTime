const app = getApp()

Page({
  data: {
    currentColor: '',
    colors: {
      mint: '#98D8C8',      // 薄荷绿
      lavender: '#E6E6FA',  // 薰衣草紫
      skyblue: '#87CEEB',   // 天空蓝
      pink: '#FFB7C5',      // 樱花粉
      cream: '#FFFDD0',     // 奶油黄
      coral: '#FF7F50',     // 珊瑚橙
      tiffany: '#81D8D0',   // 蒂芙尼蓝
      purple: '#DDA0DD',    // 香芋紫
      morandiGreen: '#A8B6A8', // 莫兰迪绿
      morandiPink: '#E6D2D5'   // 莫兰迪粉
    }
  },

  onLoad() {
    // 获取当前背景色
    const backgroundColor = app.globalData.backgroundColor || '#FFE7BA'
    this.setData({ currentColor: backgroundColor })
  },

  onShow() {
    // 每次页面显示时更新导航栏颜色
    const currentColor = this.data.currentColor
    if (currentColor) {
      this.updateAppBackground(currentColor)
    }
  },

  onColorSelect(e) {
    const color = e.currentTarget.dataset.color
    this.setData({ currentColor: color })
    this.updateAppBackground(color)
    this.saveColorPreference(color)
  },

  updateAppBackground(colorKey) {
    const color = this.data.colors[colorKey]
    if (color) {
      // 更新导航栏颜色
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: color
      })

      // 更新全局背景色
      app.globalData.backgroundColor = color
      app.globalData.currentTheme = colorKey

      // 更新页面背景色
      wx.setBackgroundColor({
        backgroundColor: color
      })

      // 发送事件通知其他页面更新背景色
      wx.eventCenter = wx.eventCenter || {}
      if (wx.eventCenter.themeChange) {
        wx.eventCenter.themeChange.forEach(callback => callback(color))
      }

      // 触发页面刷新
      const pages = getCurrentPages()
      pages.forEach(page => {
        if (page && page.onThemeChange) {
          page.onThemeChange(color)
        }
      })
    }
  },

  saveColorPreference(color) {
    wx.setStorage({
      key: 'backgroundColor',
      data: color,
      success: () => {
        wx.showToast({
          title: '主题已更新',
          icon: 'success',
          duration: 1000
        })

        // 延迟返回上一页，让用户看到颜色变化
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      },
      fail: () => {
        wx.showToast({
          title: '保存失败',
          icon: 'error',
          duration: 1000
        })
      }
    })
  },

  changeColor(e) {
    const color = e.currentTarget.dataset.color
    // 更新全局背景色
    app.globalData.backgroundColor = color
    
    // 保存到本地存储
    wx.setStorageSync('backgroundColor', color)
    
    // 触发主题变更事件
    if (wx.eventCenter && wx.eventCenter.themeChange) {
      wx.eventCenter.themeChange.forEach(callback => callback(color))
    }
    
    // 显示提示
    wx.showToast({
      title: '背景色已更新',
      icon: 'success',
      duration: 1500
    })
  }
}) 