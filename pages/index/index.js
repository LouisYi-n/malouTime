// index.js
const app = getApp()

Page({
  data: {
    currentTime: '',
    countdown: {
      hours: '00',
      minutes: '00',
      seconds: '00'
    },
    workEndTime: '--:--',
    workStatus: '非工作时间',
    todayEarnings: '0.00',
    monthlySalary: '0.00',
    hourlyRate: '0.00',
    monthEarnings: '0.00',
    yearEarnings: '0.00',
    paydayCountdown: '计算中...',
    slackingStatus: '摸鱼计时',
    slackingTime: '00:00:00',
    slackingBtnText: '开始摸鱼',
    retirementDays: '0',
    employmentDays: '0',
    isSlacking: false,
    canSlack: false,
    showSetupModal: false,
    // 默认设置
    settings: {
      monthlySalary: 10000,
      workStartTime: '09:00',
      workEndTime: '18:00',
      lunchBreakEnabled: true,
      lunchBreakStart: '12:00',
      lunchBreakEnd: '13:00',
      workdays: [true, true, true, true, true, false, false],
      payday: 10,
      employmentDate: '2024-01-01',
      retirementDate: '2055-01-01'
    },
    // 默认开启所有卡片
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
    ],
    backgroundColor: getApp().globalData.backgroundColor || '#FFE7BA'
  },

  onLoad() {
    // 获取保存的背景色
    const app = getApp()
    const backgroundColor = app.globalData.backgroundColor
    if (backgroundColor) {
      this.setData({ backgroundColor })
    }

    // 监听主题变化
    wx.eventCenter = wx.eventCenter || {}
    wx.eventCenter.themeChange = wx.eventCenter.themeChange || []
    wx.eventCenter.themeChange.push((color) => {
      this.setData({ backgroundColor: color })
    })

    // 检查是否首次使用
    const settings = wx.getStorageSync('settings')
    const cardSettings = wx.getStorageSync('cardSettings')
    
    // 如果有保存的设置，使用保存的设置，否则使用默认设置
    if (settings) {
      this.setData({ settings })
    } else {
      // 首次使用，显示提示框并保存默认设置
      this.setData({ showSetupModal: true })
      wx.setStorageSync('settings', this.data.settings)
    }

    // 如果有保存的卡片设置，使用保存的设置，否则使用默认设置
    if (cardSettings) {
      this.setData({ cardSettings })
    } else {
      wx.setStorageSync('cardSettings', this.data.cardSettings)
    }
    
    this.startTimer()
  },

  onShow() {
    // 每次显示页面时更新背景色
    const app = getApp()
    const backgroundColor = app.globalData.backgroundColor
    if (backgroundColor) {
      this.setData({ backgroundColor })
    }
    // 重新加载设置
    const settings = wx.getStorageSync('settings')
    const cardSettings = wx.getStorageSync('cardSettings')
    
    if (settings) {
      this.setData({ settings })
    }
    if (cardSettings) {
      this.setData({ cardSettings })
    }
    
    this.updateAllCalculations()
  },

  startTimer() {
    // 更新当前时间和各种计算
    this.updateTime()
    setInterval(() => {
      this.updateTime()
    }, 1000)
  },

  updateTime() {
    const now = new Date()
    const timeString = now.toLocaleString('zh-CN', {
      hour12: false
    }).replace(/\//g, '-')

    this.setData({
      currentTime: timeString
    })

    this.updateAllCalculations()
  },

  updateAllCalculations() {
    if (!this.data.settings) return

    this.calculateWorkStatus()
    this.calculateEarnings()
    this.calculateCountdowns()
    this.updateSlackingStatus()
  },

  calculateWorkStatus() {
    const now = new Date()
    const settings = this.data.settings
    const currentDay = now.getDay() || 7 // 将周日的0转换为7
    const isWorkday = settings.workdays[currentDay - 1] // 数组索引从0开始

    // 解析工作时间
    const [startHour, startMinute] = settings.workStartTime.split(':').map(Number)
    const [endHour, endMinute] = settings.workEndTime.split(':').map(Number)
    const workStart = new Date(now.setHours(startHour, startMinute, 0))
    const workEnd = new Date(now.setHours(endHour, endMinute, 0))

    // 处理午休时间
    let isLunchBreak = false
    if (settings.lunchBreakEnabled) {
      const [lunchStartHour, lunchStartMinute] = settings.lunchBreakStart.split(':').map(Number)
      const [lunchEndHour, lunchEndMinute] = settings.lunchBreakEnd.split(':').map(Number)
      const lunchStart = new Date(now.setHours(lunchStartHour, lunchStartMinute, 0))
      const lunchEnd = new Date(now.setHours(lunchEndHour, lunchEndMinute, 0))
      isLunchBreak = now >= lunchStart && now < lunchEnd
    }

    // 计算是否在工作时间
    const isWorkHours = now >= workStart && now < workEnd && (!settings.lunchBreakEnabled || !isLunchBreak)
    const canSlack = isWorkday && isWorkHours

    // 计算倒计时
    let countdown = { hours: '00', minutes: '00', seconds: '00' }
    if (isWorkday) {
      if (now < workEnd) {
        const diff = workEnd - now
        countdown = this.formatCountdown(diff)
      }
    }

    this.setData({
      workEndTime: settings.workEndTime,
      workStatus: isWorkday ? (isWorkHours ? '工作时间' : '休息时间') : '非工作日',
      canSlack,
      countdown
    })
  },

  calculateEarnings() {
    const settings = this.data.settings
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)
    
    // 计算时薪
    const workHoursPerDay = this.calculateWorkHoursPerDay()
    const workDaysPerMonth = this.data.settings.workdays.filter(day => day).length * 4
    const monthlyWorkHours = workHoursPerDay * workDaysPerMonth
    const hourlyRate = settings.monthlySalary / monthlyWorkHours

    // 计算今日收入
    const todayEarnings = this.calculateTodayEarnings(hourlyRate)

    // 计算本月收入
    const monthEarnings = this.calculatePeriodEarnings(monthStart, now, hourlyRate)

    // 计算今年收入
    const yearEarnings = this.calculatePeriodEarnings(yearStart, now, hourlyRate)

    this.setData({
      hourlyRate: hourlyRate.toFixed(2),
      todayEarnings: todayEarnings.toFixed(2),
      monthlySalary: settings.monthlySalary.toFixed(2),
      monthEarnings: monthEarnings.toFixed(2),
      yearEarnings: yearEarnings.toFixed(2)
    })
  },

  calculateWorkHoursPerDay() {
    const settings = this.data.settings
    let totalMinutes = 0

    // 解析工作时间
    const [startHour, startMinute] = settings.workStartTime.split(':').map(Number)
    const [endHour, endMinute] = settings.workEndTime.split(':').map(Number)
    
    totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)

    // 减去午休时间
    if (settings.lunchBreakEnabled) {
      const [lunchStartHour, lunchStartMinute] = settings.lunchBreakStart.split(':').map(Number)
      const [lunchEndHour, lunchEndMinute] = settings.lunchBreakEnd.split(':').map(Number)
      const lunchBreakMinutes = (lunchEndHour * 60 + lunchEndMinute) - (lunchStartHour * 60 + lunchStartMinute)
      totalMinutes -= lunchBreakMinutes
    }

    return totalMinutes / 60
  },

  calculateTodayEarnings(hourlyRate) {
    const now = new Date()
    const settings = this.data.settings
    const currentDay = now.getDay() || 7
    
    if (!settings.workdays[currentDay - 1]) return 0

    const [startHour, startMinute] = settings.workStartTime.split(':').map(Number)
    const workStart = new Date(now.setHours(startHour, startMinute, 0))
    
    if (now < workStart) return 0

    let workedMinutes = (now - workStart) / (1000 * 60)

    // 减去午休时间
    if (settings.lunchBreakEnabled) {
      const [lunchStartHour, lunchStartMinute] = settings.lunchBreakStart.split(':').map(Number)
      const [lunchEndHour, lunchEndMinute] = settings.lunchBreakEnd.split(':').map(Number)
      const lunchStart = new Date(now.setHours(lunchStartHour, lunchStartMinute, 0))
      const lunchEnd = new Date(now.setHours(lunchEndHour, lunchEndMinute, 0))

      if (now > lunchEnd) {
        workedMinutes -= (lunchEnd - lunchStart) / (1000 * 60)
      } else if (now > lunchStart) {
        workedMinutes -= (now - lunchStart) / (1000 * 60)
      }
    }

    return (workedMinutes / 60) * hourlyRate
  },

  calculatePeriodEarnings(startDate, endDate, hourlyRate) {
    const settings = this.data.settings
    let totalEarnings = 0
    const workHoursPerDay = this.calculateWorkHoursPerDay()

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay() || 7
      if (settings.workdays[dayOfWeek - 1]) {
        if (date < endDate) {
          // 完整工作日
          totalEarnings += workHoursPerDay * hourlyRate
        } else {
          // 当天
          totalEarnings += this.calculateTodayEarnings(hourlyRate)
        }
      }
    }

    return totalEarnings
  },

  calculateCountdowns() {
    const settings = this.data.settings
    const now = new Date()

    // 计算发薪日倒计时
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const payday = new Date(currentYear, currentMonth, settings.payday)
    
    if (now > payday) {
      payday.setMonth(payday.getMonth() + 1)
    }
    
    const paydayDiff = payday - now
    const paydayCountdown = this.formatCountdown(paydayDiff)

    // 计算退休倒计时
    const retirement = new Date(settings.retirementDate)
    const retirementDays = Math.ceil((retirement - now) / (1000 * 60 * 60 * 24))

    // 计算入职天数
    const employment = new Date(settings.employmentDate)
    const employmentDays = Math.ceil((now - employment) / (1000 * 60 * 60 * 24))

    this.setData({
      paydayCountdown: `${paydayCountdown.days}天${paydayCountdown.hours}时${paydayCountdown.minutes}分${paydayCountdown.seconds}秒`,
      retirementDays,
      employmentDays
    })
  },

  formatCountdown(ms) {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / 1000 / 60) % 60)
    const hours = Math.floor((ms / 1000 / 60 / 60) % 24)
    const days = Math.floor(ms / 1000 / 60 / 60 / 24)

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    }
  },

  toggleSlacking() {
    if (!this.data.canSlack) {
      wx.showToast({
        title: this.data.workStatus === '非工作日' ? '非工作日无法摸鱼' : '下班时间无法摸鱼',
        icon: 'none'
      })
      return
    }

    const isSlacking = !this.data.isSlacking
    this.setData({
      isSlacking,
      slackingBtnText: isSlacking ? '暂停摸鱼' : '开始摸鱼'
    })

    if (isSlacking) {
      this.startSlackingTimer()
    } else {
      this.stopSlackingTimer()
    }
  },

  startSlackingTimer() {
    if (this.slackingTimer) return
    
    const startTime = Date.now() - (this.data.slackingSeconds || 0) * 1000
    this.slackingTimer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000)
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60
      
      this.setData({
        slackingTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`,
        slackingSeconds: seconds
      })
    }, 1000)
  },

  stopSlackingTimer() {
    if (this.slackingTimer) {
      clearInterval(this.slackingTimer)
      this.slackingTimer = null
    }
  },

  updateSlackingStatus() {
    if (!this.data.canSlack) {
      this.setData({
        slackingBtnText: '非工作时间',
        isSlacking: false
      })
      this.stopSlackingTimer()
    }
  },

  onHide() {
    this.stopSlackingTimer()
  },

  onUnload() {
    this.stopSlackingTimer()
  },

  goToSettings() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  closeSetupModal() {
    this.setData({
      showSetupModal: false
    })
  }
})
