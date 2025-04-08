// app.js
App({
  globalData: {
    backgroundColor: '#98D8C8', // 默认使用薄荷绿
    currentTheme: 'mint',
    userInfo: null
  },

  onLaunch() {
    // 加载保存的主题颜色
    const savedColor = wx.getStorageSync('backgroundColor')
    if (savedColor) {
      this.globalData.currentTheme = savedColor
      this.globalData.backgroundColor = this.getColorByTheme(savedColor)
      this.updateAppTheme(savedColor)
    }
  },

  // 根据主题名获取颜色值
  getColorByTheme(theme) {
    const colors = {
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
    return colors[theme] || colors.mint
  },

  // 更新应用主题
  updateAppTheme(theme) {
    const color = this.getColorByTheme(theme)
    
    // 更新导航栏颜色
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: color
    })

    // 更新页面背景色
    wx.setBackgroundColor({
      backgroundColor: color
    })
  }
})
