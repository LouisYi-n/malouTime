Page({
  data: {
    cardSettings: [
      {
        id: 'incomeInfo',
        name: '收入信息',
        desc: '显示工资相关信息',
        enabled: true
      },
      {
        id: 'workCountdown',
        name: '下班倒计时',
        desc: '显示距离下班的时间',
        enabled: true
      },
      {
        id: 'slackingTimer',
        name: '摸鱼计时',
        desc: '记录摸鱼时长',
        enabled: true
      },
      {
        id: 'holidayCountdown',
        name: '放假倒计时',
        desc: '显示距离放假的时间',
        enabled: true
      },
      {
        id: 'paydayCountdown',
        name: '发薪日倒计时',
        desc: '显示距离发工资的时间',
        enabled: true
      },
      {
        id: 'retirementCountdown',
        name: '退休倒计时',
        desc: '显示距离退休的时间',
        enabled: true
      },
      {
        id: 'employmentDuration',
        name: '入职天数',
        desc: '显示已入职的天数',
        enabled: true
      }
    ]
  },

  onLoad() {
    // 获取存储的设置
    const storedSettings = wx.getStorageSync('cardSettings')
    
    if (storedSettings) {
      // 检查是否是旧格式的数据（对象格式）
      if (!Array.isArray(storedSettings)) {
        // 转换旧格式数据为新格式
        const newSettings = this.data.cardSettings.map(item => ({
          ...item,
          enabled: storedSettings[item.id] !== false // 保持原有的启用状态
        }))
        this.setData({ cardSettings: newSettings })
        // 保存新格式的数据
        this.saveCardSettings()
      } else {
        // 如果是新格式数据，直接使用
        this.setData({ cardSettings: storedSettings })
      }
    }
  },

  onSwitchChange(e) {
    const id = e.currentTarget.dataset.id
    const index = this.data.cardSettings.findIndex(item => item.id === id)
    if (index !== -1) {
      const key = `cardSettings[${index}].enabled`
      this.setData({
        [key]: e.detail.value
      })
      this.saveCardSettings()
    }
  },

  saveCardSettings() {
    wx.setStorage({
      key: 'cardSettings',
      data: this.data.cardSettings,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1000
        })
      },
      fail: () => {
        wx.showToast({
          title: '保存失败',
          icon: 'error',
          duration: 1000
        })
      }
    })
  }
}) 