// pages/forgot-password/forgot-password.js
const app = getApp();
const { post } = require('../../utils/api.js');

Page({
  data: {
    theme: 'light',
    email: '',
    emailError: '',
    successMessage: '',
    errorMessage: '',
    isLoading: false
  },

  onLoad: function() {
    this.setTheme();
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

  // 输入框内容改变
  onEmailInput: function(e) {
    this.setData({
      email: e.detail.value,
      emailError: ''
    });
  },
  
  // 验证邮箱
  validateEmail: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return '请输入邮箱地址';
    } else if (!emailRegex.test(email)) {
      return '请输入有效的邮箱地址';
    }
    return '';
  },

  // 提交忘记密码请求
  submitForgotPassword: async function() {
    // 重置消息
    this.setData({
      emailError: '',
      errorMessage: '',
      successMessage: ''
    });
    
    // 验证邮箱
    const emailError = this.validateEmail(this.data.email);
    if (emailError) {
      this.setData({ emailError });
      return;
    }
    
    this.setData({ isLoading: true });
    
    try {
      // 模拟发送重置请求
      // 实际项目中应该调用后端API
      /*
      const response = await post('/api/auth/forgot-password', {
        email: this.data.email
      });
      */
      
      // 模拟成功响应
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.setData({
        successMessage: '重置链接已发送到您的邮箱，请查收',
        email: ''
      });
      
    } catch (error) {
      console.error('发送重置请求失败:', error);
      this.setData({
        errorMessage: error.message || '发送失败，请重试'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 跳转到登录页
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
});