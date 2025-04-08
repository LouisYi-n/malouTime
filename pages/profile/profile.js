Page({
  data: {
    showResetModal: false
  },

  navigateToBasicSettings() {
    wx.navigateTo({
      url: '/pages/profile/basic-settings/basic-settings'
    })
  },

  navigateToCardSettings() {
    wx.navigateTo({
      url: '/pages/profile/card-settings/card-settings'
    })
  },

  showResetConfirm() {
    this.setData({
      showResetModal: true
    })
  },

  cancelReset() {
    this.setData({
      showResetModal: false
    })
  },

  confirmReset() {
    // Clear all local storage
    wx.clearStorage({
      success: () => {
        wx.showToast({
          title: '重置成功',
          icon: 'success'
        })
        this.setData({
          showResetModal: false
        })
        // Reload app
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
      },
      fail: () => {
        wx.showToast({
          title: '重置失败',
          icon: 'error'
        })
        this.setData({
          showResetModal: false
        })
      }
    })
  }
}) 