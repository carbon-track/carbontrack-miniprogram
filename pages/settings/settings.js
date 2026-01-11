// pages/settings/settings.js
const app = getApp();
const { post } = require('../../utils/api.js');

Page({
  data: {
    theme: 'light',
    settings: {
      notifications: {
        enabled: true,
        push: true,
        email: false
      },
      privacy: {
        shareActivity: true,
        locationTracking: true
      },
      appearance: {
        theme: 'light' // light, dark, auto
      },
      language: 'zh-CN'
    },
    appVersion: '1.0.0'
  },

  onLoad: function() {
    this.setTheme();
    this.loadSettings();
  },

  // 设置主题
  setTheme: function() {
    const theme = app.globalData.theme || wx.getStorageSync('theme') || 'light';
    this.setData({ theme });
    wx.setNavigationBarColor({
      frontColor: theme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: theme === 'dark' ? '#1C1C1E' : '#ffffff'
    });
  },

  // 加载设置
  loadSettings: function() {
    try {
      // 从本地存储加载设置
      const savedSettings = wx.getStorageSync('userSettings');
      if (savedSettings) {
        this.setData({ settings: savedSettings });
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  },

  // 保存设置
  saveSettings: function() {
    try {
      // 保存到本地存储
      wx.setStorageSync('userSettings', this.data.settings);
      
      // 更新全局主题
      if (this.data.settings.appearance.theme !== this.data.theme) {
        this.updateTheme();
      }
      
      wx.showToast({
        title: '设置已保存',
        icon: 'success'
      });
    } catch (error) {
      console.error('保存设置失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  },

  // 更新主题
  updateTheme: function() {
    let newTheme = this.data.settings.appearance.theme;
    
    if (newTheme === 'auto') {
      // 检测系统主题
      const systemInfo = wx.getSystemInfoSync();
      newTheme = systemInfo.theme === 'dark' ? 'dark' : 'light';
    }
    
    // 更新全局主题
    app.globalData.theme = newTheme;
    wx.setStorageSync('theme', newTheme);
    this.setData({ theme: newTheme });
    
    wx.setNavigationBarColor({
      frontColor: newTheme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: newTheme === 'dark' ? '#1C1C1E' : '#ffffff'
    });
  },

  // 切换开关设置
  toggleSwitch: function(e) {
    const { category, setting } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`settings.${category}.${setting}`]: value
    });
    
    this.saveSettings();
  },

  // 更改主题设置
  changeTheme: function(e) {
    const theme = e.detail.value;
    
    this.setData({
      'settings.appearance.theme': theme
    });
    
    this.saveSettings();
  },

  // 更改语言设置
  changeLanguage: function(e) {
    const language = e.detail.value;
    
    this.setData({
      'settings.language': language
    });
    
    wx.showToast({
      title: '语言设置将在下次启动时生效',
      icon: 'none'
    });
    
    this.saveSettings();
  },

  // 激励规则
  incentiveRules: function() {
    wx.navigateTo({
      url: '/pages/incentive-rules/incentive-rules'
    });
  },

  // 清除缓存
  clearCache: function() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除应用缓存吗？这不会影响您的数据。',
      success: (res) => {
        if (res.confirm) {
          try {
            // 清除缓存
            wx.clearStorageSync();
            // 重新加载设置
            this.loadSettings();
            
            wx.showToast({
              title: '缓存已清除',
              icon: 'success'
            });
          } catch (error) {
            console.error('清除缓存失败:', error);
            wx.showToast({
              title: '清除失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 帮助与反馈
  helpAndFeedback: function() {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  // 用户协议
  userAgreement: function() {
    wx.navigateTo({
      url: '/pages/agreement/agreement?type=user'
    });
  },

  // 隐私政策
  privacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/agreement/agreement?type=privacy'
    });
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            // 清除登录状态
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('token');
            
            // 跳转到登录页
            wx.reLaunch({
              url: '/pages/login/login'
            });
          } catch (error) {
            console.error('退出登录失败:', error);
            wx.showToast({
              title: '退出失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});