//app.js
App({
  globalData: {
    userInfo: null,
    isLogin: false,
    useCloudBase: true, // 保留：公告/FAQ/反馈/挑战活动/微信登录等仍走云函数
    useWebsiteApi: true, // 主业务数据走网站 OpenAPI
    apiBaseUrl: 'https://carbontrackapp.com', // 与网站同源，无尾斜杠
    baseUrl: 'https://carbontrackapp.com', // 兼容旧 utils/api 拼接
    theme: 'light', // 默认使用浅色主题
    appVersion: '1.0.0'
  },

  onLaunch: function() {
    // 初始化云开发（如果启用）
    if (this.globalData.useCloudBase) {
      try {
        wx.cloud.init({
          env: 'pangou-8g51newcf37c99d1', // CloudBase 环境ID
          traceUser: true
        });
        console.log('云开发初始化成功，环境ID: pangou-8g51newcf37c99d1');
      } catch (error) {
        console.error('云开发初始化失败:', error);
      }
    }

    // 检查登录状态
    this.checkLoginStatus();

    // 检查主题设置
    this.checkThemeSetting();

    // 监听系统主题变化
    wx.onThemeChange(({theme}) => {
      this.globalData.theme = theme;
      this.setThemeVars(theme);
      this.updateNavigationBar(theme);
    });

    // 获取系统信息
    this.getSystemInfo();

    // 初始化全局变量
    this.initGlobalVars();
  },

  onShow: function() {
    // 应用启动或从后台进入前台时检查更新
    this.checkForUpdates();
    console.log('App Show');
  },

  onHide: function() {
    // 小程序从前台进入后台时触发
    console.log('App Hide');
  },

  // 检查登录状态
  checkLoginStatus: function() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      const token = wx.getStorageSync('token');

      if (userInfo) {
        this.globalData.isLogin = true;
        this.globalData.userInfo = userInfo;
      }
      if (!userInfo && !token) {
        this.globalData.isLogin = false;
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  },

  // CloudBase 不需要 token 验证，openid 自动完成身份认证
  // 验证token（已废弃，保留兼容性）
  validateToken: function(token) {
    return true;
  },

  // 用户登录（简化版，CloudBase 不需要 token）
  login: function(userInfo) {
    this.globalData.isLogin = true;
    this.globalData.userInfo = userInfo;

    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo);
  },

  // 用户登出
  logout: function() {
    this.globalData.isLogin = false;
    this.globalData.userInfo = null;
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
  },

  // 检查主题设置
  checkThemeSetting: function() {
    try {
      const savedTheme = wx.getStorageSync('theme');
      if (savedTheme) {
        this.globalData.theme = savedTheme;
        this.setThemeVars(savedTheme);
        this.updateNavigationBar(savedTheme);
      } else {
        // 获取系统主题
        wx.getSystemInfo({
          success: (res) => {
            this.globalData.theme = res.theme || 'light';
            this.setThemeVars(this.globalData.theme);
            this.updateNavigationBar(this.globalData.theme);
          },
          fail: () => {
            // 默认使用浅色主题
            this.setThemeVars('light');
            this.updateNavigationBar('light');
          }
        });
      }
    } catch (error) {
      console.error('检查主题设置失败:', error);
      this.setThemeVars('light');
      this.updateNavigationBar('light');
    }
  },

  // 设置主题变量
  setThemeVars: function(theme) {
    // 设置详细的主题变量
    const themeVars = theme === 'dark' ? 
      {
        '--primary-color': '#4ECDC4',
        '--primary-color-light': 'rgba(78, 205, 196, 0.1)',
        '--secondary-color': '#FF6B6B',
        '--danger-color': '#FF3B30',
        '--warning-color': '#FFCC00',
        '--success-color': '#4CD964',
        '--background-color': '#1C1C1E',
        '--secondary-background': '#2C2C2E',
        '--tertiary-background': '#3A3A3C',
        '--text-color': '#FFFFFF',
        '--text-secondary-color': '#CCCCCC',
        '--text-tertiary-color': '#8E8E93',
        '--border-color': '#48484A',
        '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.4)',
        '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.5)',
        '--spacing-xs': '8rpx',
        '--spacing-sm': '16rpx',
        '--spacing-md': '24rpx',
        '--spacing-lg': '32rpx',
        '--spacing-xl': '48rpx',
        '--font-size-xs': '24rpx',
        '--font-size-sm': '28rpx',
        '--font-size-base': '32rpx',
        '--font-size-lg': '36rpx',
        '--border-radius-sm': '8rpx',
        '--border-radius-md': '16rpx'
      } : 
      {
        '--primary-color': '#34C759',
        '--primary-color-light': 'rgba(52, 199, 89, 0.1)',
        '--secondary-color': '#FF6B6B',
        '--danger-color': '#FF3B30',
        '--warning-color': '#FFCC00',
        '--success-color': '#4CD964',
        '--background-color': '#F2F2F7',
        '--secondary-background': '#FFFFFF',
        '--tertiary-background': '#FFFFFF',
        '--text-color': '#000000',
        '--text-secondary-color': '#3C3C43',
        '--text-tertiary-color': '#8E8E93',
        '--border-color': '#C6C6C8',
        '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
        '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        '--spacing-xs': '8rpx',
        '--spacing-sm': '16rpx',
        '--spacing-md': '24rpx',
        '--spacing-lg': '32rpx',
        '--spacing-xl': '48rpx',
        '--font-size-xs': '24rpx',
        '--font-size-sm': '28rpx',
        '--font-size-base': '32rpx',
        '--font-size-lg': '36rpx',
        '--border-radius-sm': '8rpx',
        '--border-radius-md': '16rpx'
      };
    
    wx.setStorageSync('themeVars', themeVars);
    wx.setStorageSync('theme', theme);
  },
  
  // 更新导航栏颜色
  updateNavigationBar: function(theme) {
    wx.setNavigationBarColor({
      frontColor: theme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: theme === 'dark' ? '#1C1C1E' : '#ffffff'
    });
  },
  
  // 切换主题
  switchTheme: function(theme) {
    this.globalData.theme = theme;
    this.setThemeVars(theme);
    this.updateNavigationBar(theme);
  },
  
  // 获取系统信息
  getSystemInfo: function() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      return systemInfo;
    } catch (error) {
      console.error('获取系统信息失败:', error);
      return null;
    }
  },
  
  // 初始化全局变量
  initGlobalVars: function() {
    // 可以在这里初始化其他全局变量
    this.globalData.defaultAvatar = '/assets/icons/default-avatar.png';
    this.globalData.pageSize = 20;
  },
  
  // 检查更新
  checkForUpdates: function() {
    // 微信小程序更新机制
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate(function(res) {
        // 有新版本可以更新
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否立即重启应用？',
              success: function(res) {
                if (res.confirm) {
                  // 强制重启并应用新版本
                  updateManager.applyUpdate();
                }
              }
            });
          });
          
          updateManager.onUpdateFailed(function() {
            // 更新失败
            wx.showToast({
              title: '更新失败，请稍后重试',
              icon: 'none'
            });
          });
        }
      });
    }
  }
});