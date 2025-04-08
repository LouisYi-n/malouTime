Page({
  data: {
    // 基本设置
    salary: '10000',

    // 工作时间
    workStartTime: '09:00',
    workEndTime: '18:00',
    hasLunchBreak: true,
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',

    // 工作日设置
    workdays: [true, true, true, true, true, false, false], // 周一到周日

    // 其他设置
    payDays: Array.from({length: 31}, (_, i) => i + 1), // 1-31号
    payDayIndex: 9, // 默认10号
    joinDate: '2025-01-01',
    retireDate: '2075-01-01'
  },

  onLoad() {
    // 从本地存储加载设置
    this.loadSettings();
  },

  // 加载设置
  loadSettings() {
    const settings = wx.getStorageSync('settings');
    if (settings) {
      this.setData({
        salary: settings.monthlySalary.toString(),
        workStartTime: settings.workStartTime,
        workEndTime: settings.workEndTime,
        hasLunchBreak: settings.lunchBreakEnabled,
        lunchStartTime: settings.lunchBreakStart,
        lunchEndTime: settings.lunchBreakEnd,
        workdays: settings.workdays,
        payDayIndex: settings.payday - 1,
        joinDate: settings.employmentDate,
        retireDate: settings.retirementDate
      });
    }
  },

  // 保存设置
  saveSettings() {
    const settings = {
      monthlySalary: parseFloat(this.data.salary),
      workStartTime: this.data.workStartTime,
      workEndTime: this.data.workEndTime,
      lunchBreakEnabled: this.data.hasLunchBreak,
      lunchBreakStart: this.data.lunchStartTime,
      lunchBreakEnd: this.data.lunchEndTime,
      workdays: this.data.workdays,
      payday: this.data.payDayIndex + 1,
      employmentDate: this.data.joinDate,
      retirementDate: this.data.retireDate
    };
    wx.setStorageSync('settings', settings);
  },

  // 基本设置
  onSalaryInput(e) {
    this.setData({
      salary: e.detail.value
    });
    this.saveSettings();
  },

  // 工作时间
  onWorkStartTimeChange(e) {
    this.setData({
      workStartTime: e.detail.value
    });
    this.saveSettings();
  },

  onWorkEndTimeChange(e) {
    this.setData({
      workEndTime: e.detail.value
    });
    this.saveSettings();
  },

  onLunchBreakChange(e) {
    this.setData({
      hasLunchBreak: e.detail.value
    });
    this.saveSettings();
  },

  onLunchStartTimeChange(e) {
    this.setData({
      lunchStartTime: e.detail.value
    });
    this.saveSettings();
  },

  onLunchEndTimeChange(e) {
    this.setData({
      lunchEndTime: e.detail.value
    });
    this.saveSettings();
  },

  // 工作日设置
  toggleWorkday(e) {
    const index = e.currentTarget.dataset.index;
    const workdays = [...this.data.workdays];
    workdays[index] = !workdays[index];
    this.setData({
      workdays
    });
    this.saveSettings();
  },

  // 其他设置
  onPayDayChange(e) {
    this.setData({
      payDayIndex: e.detail.value
    });
    this.saveSettings();
  },

  onJoinDateChange(e) {
    this.setData({
      joinDate: e.detail.value
    });
    this.saveSettings();
  },

  onRetireDateChange(e) {
    this.setData({
      retireDate: e.detail.value
    });
    this.saveSettings();
  }
}); 