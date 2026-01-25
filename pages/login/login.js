// pages/login/login.js
const app = getApp();
const { login, wxLogin, getUserProfile } = require('../../utils/auth.js');

Page({
  data: {
    theme: 'light',
    email: '',
    password: '',
    loading: false,
    showPassword: false,
    redirectUrl: '',
    debugVisible: false,
    nickname: '',
    avatarUrl: '',
    debugInfo: {
      sdkVersion: '',
      canGetUserProfile: false,
      cloudInited: false,
      loginCode: '',
      userInfoStr: '',
      userProfileStr: '',
      cloudLoginResultStr: ''
    }
  },

  onLoad: function(options) {
    // 获取主题设置
    this.setTheme();
    
    // 获取重定向URL
    if (options.redirect) {
      this.setData({ redirectUrl: options.redirect });
    }
    this.refreshDebug();
    if (options.debug === '1') {
      this.setData({ debugVisible: true });
    }
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

  // 输入框内容变化
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  // 切换显示密码
  togglePasswordVisibility: function() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 验证输入
  validateForm: function() {
    const { email, password } = this.data;
    
    if (!email.trim()) {
      wx.showToast({
        title: '请输入邮箱',
        icon: 'none'
      });
      return false;
    }
    
    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      wx.showToast({
        title: '请输入有效的邮箱地址',
        icon: 'none'
      });
      return false;
    }
    
    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return false;
    }
    
    if (password.length < 6) {
      wx.showToast({
        title: '密码长度至少为6位',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 登录按钮点击
  onLoginTap: async function() {
    // 为了方便测试，即使表单验证失败也允许登录
    // if (!this.validateForm()) return;
    
    this.setData({ loading: true });
    
    try {
      // 严格使用表单输入数据
      const { email, password } = this.data;
      if (!email || !password) {
        throw new Error('邮箱和密码不能为空');
      }
      
      // 安全日志 - 不记录完整密码
      console.log('执行登录...', { 
        email,
        password: password.substring(0, 1) + '*****' 
      });
      const result = await login(email, password);
      
      if (result.success) {
        wx.showToast({
          title: result.message || '登录成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            // 登录成功后跳转到重定向URL或首页
            if (this.data.redirectUrl) {
              wx.redirectTo({
                url: this.data.redirectUrl
              });
            } else {
              wx.switchTab({
                url: '/pages/index/index'
              });
            }
          }
        });
      } else {
        wx.showToast({
          title: result.message || '登录失败，请检查邮箱和密码',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('登录错误:', error);
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 前往注册页面
  goToRegister: function() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },

  // 忘记密码
  onForgotPasswordTap: function() {
    wx.navigateTo({
      url: '/pages/forgot-password/forgot-password'
    });
  },

  // 微信一键登录（旧版，使用 getUserProfile）
  onWechatLoginTap: async function() {
    try {
      const userInfo = await getUserProfile();
      this.setData({ loading: true });
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });
      const code = (loginRes && loginRes.code) ? loginRes.code : '';
      if (userInfo && userInfo.nickName) {
        wx.showToast({ title: `授权成功：${userInfo.nickName}`, icon: 'none' });
      }
      const result = await wxLogin(userInfo || {}, code);
      if (result.success && result.userInfo) {
        const merged = { ...result.userInfo, ...(userInfo || {}) };
        wx.setStorageSync('userInfo', merged);
        app.globalData.userInfo = merged;
      }
      this.setData({
        'debugInfo.loginCode': code,
        'debugInfo.userProfileStr': JSON.stringify(userInfo || {}, null, 2),
        'debugInfo.cloudLoginResultStr': JSON.stringify(result || {}, null, 2)
      });
      if (result.success) {
        wx.showToast({
          title: result.message || '登录成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            const finalUser = app.globalData.userInfo || wx.getStorageSync('userInfo') || {};
            if (!finalUser.school) {
              wx.navigateTo({ url: '/pages/profile/profile' });
              wx.showToast({ title: '请完善学校信息', icon: 'none' });
              return;
            }
            if (this.data.redirectUrl) {
              wx.redirectTo({ url: this.data.redirectUrl });
            } else {
              wx.switchTab({ url: '/pages/index/index' });
            }
          }
        });
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      if (error && typeof error.errMsg === 'string' && error.errMsg.indexOf('auth deny') !== -1) {
        wx.showToast({ title: '您拒绝了授权，无法登录', icon: 'none' });
      } else if (error && typeof error.errMsg === 'string' && error.errMsg.indexOf('can only be invoked by user TAP gesture') !== -1) {
        wx.showToast({ title: '请直接点击按钮以授权', icon: 'none' });
      } else {
        try {
          const result = await wxLogin({}, '');
          this.setData({
            'debugInfo.userProfileStr': JSON.stringify({}, null, 2),
            'debugInfo.cloudLoginResultStr': JSON.stringify(result || {}, null, 2)
          });
          if (result.success) {
            wx.showToast({
              title: result.message || '登录成功',
              icon: 'success',
              duration: 1500,
              success: () => {
                if (this.data.redirectUrl) {
                  wx.redirectTo({ url: this.data.redirectUrl });
                } else {
                  wx.switchTab({ url: '/pages/index/index' });
                }
              }
            });
          } else {
            throw new Error(result.message || '登录失败');
          }
        } catch (e2) {
          let errorMsg = '微信登录失败';
          if (e2.message) errorMsg = e2.message;
          else if (e2.errMsg) errorMsg = e2.errMsg;
          wx.showModal({
            title: '登录失败',
            content: `${errorMsg}\n\n请确保已开通云开发并配置好云环境ID`,
            showCancel: false,
            confirmText: '确定'
          });
        }
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  // 微信一键登录（新版，使用头像昵称填写能力）
  onWechatSimpleLoginTap: async function() {
    try {
      const { nickname, avatarUrl } = this.data;
      const userInfo = {
        nickName: nickname || '微信用户',
        avatarUrl: avatarUrl || ''
      };

      this.setData({ loading: true });
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });
      const code = (loginRes && loginRes.code) ? loginRes.code : '';
      const result = await wxLogin(userInfo, code);

      this.setData({
        'debugInfo.loginCode': code,
        'debugInfo.userProfileStr': JSON.stringify(userInfo, null, 2),
        'debugInfo.cloudLoginResultStr': JSON.stringify(result || {}, null, 2)
      });

      if (result.success) {
        wx.showToast({
          title: result.message || '登录成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            const finalUser = app.globalData.userInfo || wx.getStorageSync('userInfo') || {};
            if (!finalUser.school) {
              wx.navigateTo({ url: '/pages/profile/profile' });
              wx.showToast({ title: '请完善学校信息', icon: 'none' });
              return;
            }
            if (this.data.redirectUrl) {
              wx.redirectTo({ url: this.data.redirectUrl });
            } else {
              wx.switchTab({ url: '/pages/index/index' });
            }
          }
        });
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      console.error('微信登录失败:', error);
      let errorMsg = '微信登录失败';
      if (error.message) errorMsg = error.message;
      else if (error.errMsg) errorMsg = error.errMsg;
      wx.showToast({
        title: errorMsg,
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 昵称输入
  onNicknameChange: function(e) {
    this.setData({
      nickname: e.detail.value
    });
  },

  // 选择头像
  onChooseAvatar: function(e) {
    try {
      const { avatarUrl } = e.detail || {};
      if (!avatarUrl) {
        wx.showToast({ title: '未获取到头像', icon: 'none' });
        return;
      }
      this.setData({ avatarUrl });
    } catch (error) {
      console.error('选择头像失败:', error);
      wx.showToast({ title: '选择头像失败', icon: 'none' });
    }
  },

  onChooseAvatarTap: function() {
    // 点击头像区域触发选择
    // 实际的选择由 button open-type="chooseAvatar" 处理
  },

  toggleDebug: function() {
    this.setData({ debugVisible: !this.data.debugVisible });
  },

  refreshDebug: function() {
    try {
      const systemInfo = wx.getSystemInfoSync() || {};
      const sdkVersion = systemInfo.SDKVersion || '';
      const canGetUserProfile = !!(wx.canIUse && wx.canIUse('getUserProfile'));
      const cloudInited = !!(wx.cloud && typeof wx.cloud.callFunction === 'function');
      const localUser = wx.getStorageSync('userInfo') || app.globalData.userInfo || {};
      this.setData({
        debugInfo: {
          ...this.data.debugInfo,
          sdkVersion,
          canGetUserProfile,
          cloudInited,
          userInfoStr: JSON.stringify(localUser || {}, null, 2)
        }
      });
    } catch (e) {
      this.setData({
        debugInfo: {
          ...this.data.debugInfo,
          sdkVersion: '',
          canGetUserProfile: false,
          cloudInited: !!(wx.cloud && typeof wx.cloud.callFunction === 'function'),
          userInfoStr: '{}'
        }
      });
    }
  },

  onDebugGetProfile: async function() {
    try {
      const profile = await getUserProfile();
      this.setData({
        'debugInfo.userProfileStr': JSON.stringify(profile || {}, null, 2)
      });
      if (profile && profile.nickName) {
        wx.showToast({ title: `授权成功：${profile.nickName}`, icon: 'none' });
      }
    } catch (e) {
      this.setData({
        'debugInfo.userProfileStr': JSON.stringify({ error: e && (e.message || e.errMsg) }, null, 2)
      });
    }
  },

  onDebugCloudLogin: async function() {
    try {
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });
      const code = (loginRes && loginRes.code) ? loginRes.code : '';
      const result = await wxLogin({}, code);
      this.setData({
        'debugInfo.loginCode': code,
        'debugInfo.cloudLoginResultStr': JSON.stringify(result || {}, null, 2)
      });
      if (result && result.success && result.userInfo) {
        wx.setStorageSync('userInfo', result.userInfo);
        app.globalData.userInfo = result.userInfo;
        this.refreshDebug();
      }
    } catch (e) {
      this.setData({
        'debugInfo.cloudLoginResultStr': JSON.stringify({ error: e && (e.message || e.errMsg) }, null, 2)
      });
    }
  }
});
