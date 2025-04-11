// index.js
// 获取全局应用实例
const app = getApp()

Page({
  // 页面数据
  data: {
    // 当前时间
    currentTime: '',
    // 下班倒计时
    countdown: {
      hours: '00',
      minutes: '00',
      seconds: '00'
    },
    // 下班时间
    workEndTime: '18:00',
    // 工作状态
    workStatus: '工作时间',
    // 今日收入
    todayEarnings: '0.00',
    // 月薪
    monthlySalary: '0.00',
    // 时薪
    hourlyRate: '0.00',
    // 本月收入
    monthEarnings: '0.00',
    // 本年收入
    yearEarnings: '0.00',
    // 发薪日倒计时
    paydayCountdown: '计算中...',
    // 摸鱼状态
    slackingStatus: '摸鱼计时',
    // 摸鱼时长
    slackingTime: '00:00:00',
    // 摸鱼按钮文本
    slackingBtnText: '开始摸鱼',
    // 退休天数
    retirementDays: '0',
    // 入职天数
    employmentDays: '0',
    // 是否正在摸鱼
    isSlacking: false,
    // 是否可以摸鱼
    canSlack: false,
    // 是否显示设置弹窗
    showSetupModal: false,
    // 默认设置
    settings: {
      monthlySalary: 10000,          // 月薪
      workStartTime: '09:00',        // 上班时间
      workEndTime: '18:00',          // 下班时间
      lunchBreakEnabled: true,       // 是否启用午休
      lunchBreakStart: '12:00',      // 午休开始时间
      lunchBreakEnd: '13:00',        // 午休结束时间
      workdays: [true, true, true, true, true, false, false], // 工作日设置（周一到周日）
      payday: 10,                    // 发薪日
      employmentDate: '2024-01-01',  // 入职日期
      retirementDate: '2055-01-01'   // 退休日期
    },
    // 卡片设置
    cardSettings: [
      {
        id: 'incomeInfo',           // 收入信息卡片
        name: '收入信息',
        desc: '显示工资相关信息',
        enabled: true
      },
      {
        id: 'workCountdown',        // 下班倒计时卡片
        name: '下班倒计时',
        desc: '显示距离下班的时间',
        enabled: true
      },
      {
        id: 'slackingTimer',        // 摸鱼计时卡片
        name: '摸鱼计时',
        desc: '记录摸鱼时长',
        enabled: true
      },
      {
        id: 'holidayCountdown',     // 放假倒计时卡片
        name: '放假倒计时',
        desc: '显示距离放假的时间',
        enabled: true
      },
      {
        id: 'paydayCountdown',      // 发薪日倒计时卡片
        name: '发薪日倒计时',
        desc: '显示距离发工资的时间',
        enabled: true
      },
      {
        id: 'retirementCountdown',  // 退休倒计时卡片
        name: '退休倒计时',
        desc: '显示距离退休的时间',
        enabled: true
      },
      {
        id: 'employmentDuration',   // 入职天数卡片
        name: '入职天数',
        desc: '显示已入职的天数',
        enabled: true
      }
    ],
    // 背景颜色
    backgroundColor: getApp().globalData.backgroundColor || '#FFE7BA',
    // 计时器
    timer: null,
    earningsTimer: null,
    mainTimer: null,
    slackingTimer: null,
    // 上次计算时间
    lastCalculatedTime: null,
    // 累计收入
    accumulatedEarnings: 0
  },

  // 更新当前时间
  updateCurrentTime() {
    const now = new Date()
    const timeString = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    this.setData({ currentTime: timeString })
  },

  // 页面加载时执行
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
    
    // 启动主计时器
    this.startMainTimer()
    
    // 更新当前时间
    this.updateCurrentTime()
    setInterval(() => this.updateCurrentTime(), 1000)
  },

  // 页面显示时执行
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
    
    // 重启主计时器
    this.startMainTimer()
  },

  // 页面隐藏时执行
  onHide() {
    this.stopAllTimers()
  },

  // 页面卸载时执行
  onUnload() {
    this.stopAllTimers()
  },

  // 停止所有计时器
  stopAllTimers() {
    if (this.data.mainTimer) {
      clearInterval(this.data.mainTimer)
      this.data.mainTimer = null
    }
    if (this.data.slackingTimer) {
      clearInterval(this.data.slackingTimer)
      this.data.slackingTimer = null
    }
  },

  // 启动主计时器
  startMainTimer() {
    if (this.data.mainTimer) {
      clearInterval(this.data.mainTimer)
    }

    // 初始化累计收入
    this.setData({ 
      lastCalculatedTime: new Date(),
      accumulatedEarnings: 0 
    })

    // 立即执行一次更新
    this.updateAll()

    // 设置计时器每秒更新
    const mainTimer = setInterval(() => {
      this.updateAll()
    }, 1000)

    this.setData({ mainTimer })
  },

  // 更新所有信息
  updateAll() {
    const now = new Date()
    const settings = this.data.settings
    if (!settings) return

    // 更新工作状态和倒计时
    const workStatus = this.calculateWorkStatus(now, settings)
    
    // 更新收入
    const earnings = this.calculateEarnings(now, settings)
    
    // 更新状态
    this.setData({
      currentTime: now.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      ...workStatus,
      ...earnings
    })

    // 更新其他倒计时
    this.calculateCountdowns()
  },

  // 计算工作状态
  calculateWorkStatus(now, settings) {
    const currentDay = now.getDay() || 7 // 将周日的0转换为7
    const isWorkday = settings.workdays[currentDay - 1]

    // 解析工作时间
    const [startHour, startMinute] = settings.workStartTime.split(':').map(Number)
    const [endHour, endMinute] = settings.workEndTime.split(':').map(Number)
    const workStart = new Date(now)
    const workEnd = new Date(now)
    
    workStart.setHours(startHour, startMinute, 0, 0)
    workEnd.setHours(endHour, endMinute, 0, 0)

    // 处理午休时间
    let isLunchBreak = false
    if (settings.lunchBreakEnabled) {
      const [lunchStartHour, lunchStartMinute] = settings.lunchBreakStart.split(':').map(Number)
      const [lunchEndHour, lunchEndMinute] = settings.lunchBreakEnd.split(':').map(Number)
      const lunchStart = new Date(now)
      const lunchEnd = new Date(now)
      
      lunchStart.setHours(lunchStartHour, lunchStartMinute, 0, 0)
      lunchEnd.setHours(lunchEndHour, lunchEndMinute, 0, 0)
      
      isLunchBreak = now >= lunchStart && now < lunchEnd
    }

    // 计算是否在工作时间
    const isWorkHours = now >= workStart && now < workEnd && (!settings.lunchBreakEnabled || !isLunchBreak)
    const canSlack = isWorkday && isWorkHours

    // 计算下班倒计时
    let countdown = { hours: '00', minutes: '00', seconds: '00' }
    if (isWorkday && now < workEnd) {
      const diff = workEnd - now
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      countdown = {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      }
    }

    // 确定工作状态
    let workStatus = '工作时间'
    if (!isWorkday) {
      workStatus = '休息日'
    } else if (isLunchBreak) {
      workStatus = '午休时间'
    } else if (!isWorkHours) {
      workStatus = '非工作时间'
    }

    return {
      workStatus,
      countdown,
      canSlack,
      workEndTime: settings.workEndTime
    }
  },

  // 计算收入
  calculateEarnings(now, settings) {
    // 计算时薪
    const workHoursPerDay = this.calculateWorkHoursPerDay(settings)
    const hourlyRate = settings.monthlySalary / (workHoursPerDay * this.getWorkingDaysInMonth(now, settings.workdays))
    
    // 计算今日收入
    const todayWorkSeconds = this.calculateTodayWorkSeconds(settings)
    const todayEarnings = (todayWorkSeconds / 3600) * hourlyRate
    
    // 计算本月收入
    const monthEarnings = this.calculateMonthEarnings(now, settings)
    
    // 计算本年收入
    const yearEarnings = this.calculateYearEarnings(now, settings, monthEarnings)

    return {
      hourlyRate: hourlyRate.toFixed(2),
      todayEarnings: todayEarnings.toFixed(2),
      monthlySalary: settings.monthlySalary.toFixed(2),
      monthEarnings: monthEarnings.toFixed(2),
      yearEarnings: yearEarnings.toFixed(2)
    }
  },

  // 计算每天工作小时数
  calculateWorkHoursPerDay(settings) {
    const [startHour, startMinute] = settings.workStartTime.split(':').map(Number)
    const [endHour, endMinute] = settings.workEndTime.split(':').map(Number)
    
    let totalHours = (endHour - startHour) + (endMinute - startMinute) / 60
    
    // 减去午休时间
    if (settings.lunchBreakEnabled) {
      const [lunchStartHour, lunchStartMinute] = settings.lunchBreakStart.split(':').map(Number)
      const [lunchEndHour, lunchEndMinute] = settings.lunchBreakEnd.split(':').map(Number)
      const lunchBreakHours = (lunchEndHour - lunchStartHour) + (lunchEndMinute - lunchStartMinute) / 60
      totalHours -= lunchBreakHours
    }
    
    return totalHours
  },

  // 计算倒计时
  calculateCountdowns() {
    const now = new Date()
    const settings = this.data.settings
    
    // 计算发薪日倒计时
    const payday = new Date(now)
    payday.setDate(settings.payday)
    if (now.getDate() > settings.payday) {
      payday.setMonth(payday.getMonth() + 1)
    }
    const paydayDiff = payday - now
    const paydayDays = Math.ceil(paydayDiff / (1000 * 60 * 60 * 24))
    this.setData({ paydayCountdown: `${paydayDays}天` })
    
    // 计算退休倒计时
    const retirementDate = new Date(settings.retirementDate)
    const retirementDiff = retirementDate - now
    const retirementDays = Math.ceil(retirementDiff / (1000 * 60 * 60 * 24))
    this.setData({ retirementDays: retirementDays.toString() })
    
    // 计算入职天数
    const employmentDate = new Date(settings.employmentDate)
    const employmentDiff = now - employmentDate
    const employmentDays = Math.floor(employmentDiff / (1000 * 60 * 60 * 24))
    this.setData({ employmentDays: employmentDays.toString() })
  },

  // 格式化倒计时
  formatCountdown(ms) {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    
    return `${days}天${hours}时${minutes}分${seconds}秒`
  },

  // 切换摸鱼状态
  toggleSlacking() {
    if (!this.data.canSlack) return
    
    if (this.data.isSlacking) {
      this.stopSlackingTimer()
    } else {
      this.startSlackingTimer()
    }
  },

  // 开始摸鱼计时
  startSlackingTimer() {
    if (this.data.slackingTimer) {
      clearInterval(this.data.slackingTimer)
    }
    
    this.setData({
      isSlacking: true,
      slackingBtnText: '结束摸鱼',
      slackingTime: '00:00:00'
    })
    
    let seconds = 0
    const slackingTimer = setInterval(() => {
      seconds++
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      this.setData({
        slackingTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      })
    }, 1000)
    
    this.setData({ slackingTimer })
  },

  // 停止摸鱼计时
  stopSlackingTimer() {
    if (this.data.slackingTimer) {
      clearInterval(this.data.slackingTimer)
      this.data.slackingTimer = null
    }
    
    this.setData({
      isSlacking: false,
      slackingBtnText: '开始摸鱼'
    })
  },

  // 更新摸鱼状态
  updateSlackingStatus() {
    if (!this.data.canSlack && this.data.isSlacking) {
      this.stopSlackingTimer()
    }
  },

  // 跳转到设置页面
  goToSettings() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  // 关闭设置弹窗
  closeSetupModal() {
    this.setData({ showSetupModal: false })
  },

  startCountdown() {
    // 清除已有定时器
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }

    const timer = setInterval(() => {
      const now = new Date()
      const endTime = this.getEndTime()
      const diff = endTime - now

      if (diff <= 0) {
        // 已经下班
        this.setData({
          countdown: {
            hours: '00',
            minutes: '00',
            seconds: '00'
          },
          workStatus: '已下班'
        })
        return
      }

      // 计算剩余时间
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      this.setData({
        countdown: {
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        },
        workStatus: this.getWorkStatus()
      })
    }, 1000)

    this.setData({ timer })
  },

  startEarningsCalculation() {
    // 清除已有定时器
    if (this.data.earningsTimer) {
      clearInterval(this.data.earningsTimer)
    }

    const settings = wx.getStorageSync('settings') || {}
    const monthlySalary = parseFloat(settings.salary) || 0
    const workdays = settings.workdays || [1, 1, 1, 1, 1, 0, 0]
    const workingDaysInMonth = this.getWorkingDaysInMonth(workdays)
    const workHoursPerDay = this.calculateWorkHours(settings)
    
    // 计算每秒收入
    const dailySalary = monthlySalary / workingDaysInMonth
    const hourlyRate = dailySalary / workHoursPerDay
    const secondRate = hourlyRate / 3600

    const earningsTimer = setInterval(() => {
      if (!this.isWorkTime()) {
        return
      }

      // 计算今日工作时长（秒）
      const workSeconds = this.calculateTodayWorkSeconds(settings)
      
      // 计算今日收入
      const todayEarnings = (workSeconds * secondRate).toFixed(2)
      
      // 计算本月收入
      const monthEarnings = this.calculateMonthEarnings(settings)
      
      // 计算今年收入
      const yearEarnings = this.calculateYearEarnings(settings)

      this.setData({
        todayEarnings,
        monthEarnings: monthEarnings.toFixed(2),
        yearEarnings: yearEarnings.toFixed(2)
      })
    }, 1000)

    this.setData({ earningsTimer })
  },

  getEndTime() {
    const [hours, minutes] = this.data.workEndTime.split(':')
    const endTime = new Date()
    endTime.setHours(parseInt(hours))
    endTime.setMinutes(parseInt(minutes))
    endTime.setSeconds(0)
    return endTime
  },

  isWorkTime() {
    const now = new Date()
    const settings = wx.getStorageSync('settings') || {}
    const workdays = settings.workdays || [1, 1, 1, 1, 1, 0, 0]
    const today = now.getDay()
    const adjustedDay = today === 0 ? 6 : today - 1 // 将周日的6调整为数组中的索引

    // 检查是否是工作日
    if (!workdays[adjustedDay]) {
      return false
    }

    // 检查是否在工作时间内
    const [startHour, startMinute] = (settings.workStartTime || '09:00').split(':')
    const [endHour, endMinute] = (settings.workEndTime || '18:00').split(':')
    const startTime = new Date()
    const endTime = new Date()
    
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0)
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0)

    return now >= startTime && now <= endTime
  },

  getWorkStatus() {
    if (!this.isWorkTime()) {
      return '休息时间'
    }
    return '工作时间'
  },

  calculateWorkHours(settings) {
    const startTime = settings.workStartTime || '09:00'
    const endTime = settings.workEndTime || '18:00'
    const hasLunchBreak = settings.hasLunchBreak
    const lunchStartTime = settings.lunchStartTime || '12:00'
    const lunchEndTime = settings.lunchEndTime || '13:00'

    const [startHour, startMinute] = startTime.split(':')
    const [endHour, endMinute] = endTime.split(':')
    const workMinutes = (parseInt(endHour) * 60 + parseInt(endMinute)) - 
                       (parseInt(startHour) * 60 + parseInt(startMinute))

    if (hasLunchBreak) {
      const [lunchStartHour, lunchStartMinute] = lunchStartTime.split(':')
      const [lunchEndHour, lunchEndMinute] = lunchEndTime.split(':')
      const lunchMinutes = (parseInt(lunchEndHour) * 60 + parseInt(lunchEndMinute)) - 
                          (parseInt(lunchStartHour) * 60 + parseInt(lunchStartMinute))
      return (workMinutes - lunchMinutes) / 60
    }

    return workMinutes / 60
  },

  calculateTodayWorkSeconds(settings) {
    if (!this.isWorkTime()) {
      return 0
    }

    const now = new Date()
    const [startHour, startMinute] = (settings.workStartTime || '09:00').split(':')
    const startTime = new Date()
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0)

    let workSeconds = Math.floor((now - startTime) / 1000)

    // 如果有午休时间，需要减去
    if (settings.hasLunchBreak) {
      const [lunchStartHour, lunchStartMinute] = (settings.lunchStartTime || '12:00').split(':')
      const [lunchEndHour, lunchEndMinute] = (settings.lunchEndTime || '13:00').split(':')
      const lunchStart = new Date()
      const lunchEnd = new Date()
      
      lunchStart.setHours(parseInt(lunchStartHour), parseInt(lunchStartMinute), 0)
      lunchEnd.setHours(parseInt(lunchEndHour), parseInt(lunchEndMinute), 0)

      if (now > lunchEnd) {
        // 已经过了午休时间
        workSeconds -= (lunchEnd - lunchStart) / 1000
      } else if (now > lunchStart) {
        // 正在午休时间
        workSeconds -= (now - lunchStart) / 1000
      }
    }

    return Math.max(0, workSeconds)
  },

  getWorkingDaysInMonth(date, workdays) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    let workingDays = 0

    // 遍历当月的每一天
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      const dayOfWeek = currentDate.getDay()
      // 将周日的0转换为7，以匹配workdays数组
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      if (workdays[adjustedDay]) {
        workingDays++
      }
    }

    // 如果当月没有工作日（极端情况），返回默认值避免除以0
    return Math.max(workingDays, 1)
  },

  calculateMonthEarnings(now, settings) {
    const year = now.getFullYear()
    const month = now.getMonth()
    const currentDate = now.getDate()
    let totalEarnings = 0

    // 获取当月工作日数和日工资
    const workDaysPerMonth = this.getWorkingDaysInMonth(now, settings.workdays)
    const dailySalary = settings.monthlySalary / workDaysPerMonth

    // 计算已完成工作日的收入
    for (let day = 1; day < currentDate; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      if (settings.workdays[adjustedDay]) {
        totalEarnings += dailySalary
      }
    }

    // 加上今天的收入（如果是工作日）
    const today = now.getDay()
    const adjustedToday = today === 0 ? 6 : today - 1
    if (settings.workdays[adjustedToday]) {
      // 获取今日已工作时间的收入
      const workHoursPerDay = this.calculateWorkHoursPerDay(settings)
      const hourlyRate = dailySalary / workHoursPerDay
      const secondRate = hourlyRate / 3600
      const workedSeconds = this.calculateWorkedSeconds(now, settings)
      const todayEarnings = workedSeconds * secondRate
      totalEarnings += todayEarnings
    }

    return totalEarnings
  },

  calculateWorkedSeconds(now, settings) {
    // 检查是否是工作日
    const currentDay = now.getDay() || 7
    const adjustedDay = currentDay === 0 ? 6 : currentDay - 1
    if (!settings.workdays[adjustedDay]) return 0

    // 创建工作开始时间
    const [startHour, startMinute] = settings.workStartTime.split(':').map(Number)
    const workStart = new Date(now)
    workStart.setHours(startHour, startMinute, 0, 0)

    if (now < workStart) return 0

    // 创建工作结束时间
    const [endHour, endMinute] = settings.workEndTime.split(':').map(Number)
    const workEnd = new Date(now)
    workEnd.setHours(endHour, endMinute, 0, 0)

    // 如果已经超过下班时间，使用下班时间计算
    if (now > workEnd) {
      now = new Date(workEnd)
    }

    // 计算工作秒数
    let workedSeconds = Math.floor((now - workStart) / 1000)

    // 处理午休时间
    if (settings.lunchBreakEnabled) {
      const [lunchStartHour, lunchStartMinute] = settings.lunchBreakStart.split(':').map(Number)
      const [lunchEndHour, lunchEndMinute] = settings.lunchBreakEnd.split(':').map(Number)
      
      const lunchStart = new Date(now)
      const lunchEnd = new Date(now)
      
      lunchStart.setHours(lunchStartHour, lunchStartMinute, 0, 0)
      lunchEnd.setHours(lunchEndHour, lunchEndMinute, 0, 0)

      if (now > lunchEnd) {
        // 已经过了午休时间，减去整个午休时间
        workedSeconds -= (lunchEnd - lunchStart) / 1000
      } else if (now > lunchStart) {
        // 正在午休，减去已经过去的午休时间
        workedSeconds -= (now - lunchStart) / 1000
      }
    }

    return Math.max(0, workedSeconds)
  },

  calculateYearEarnings(now, settings, monthEarnings) {
    const currentMonth = now.getMonth()
    let totalEarnings = 0

    // 1. 计算已完成月份的收入
    for (let month = 0; month < currentMonth; month++) {
      totalEarnings += settings.monthlySalary
    }

    // 2. 加上当月收入
    totalEarnings += monthEarnings

    return totalEarnings
  }
})
