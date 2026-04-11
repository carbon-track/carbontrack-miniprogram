// pages/register/register.js
const app = getApp();

Page({
  data: {
    theme: 'light',
    formData: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      school: ''
    },
    errors: {},
    loading: false,
    schools: [],
    showSchoolPicker: false,
    agreements: false,
    schoolIndex: 0  // 新增：学校选择器索引
  },

  onLoad: function() {
    // 获取主题设置
    this.setTheme();
    
    // 加载学校列表（模拟数据）
    this.loadSchools();
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

  // 加载学校列表
  loadSchools: async function() {
    try {
      const { getSchools } = require('../../utils/cloud-api.js');
      const result = await getSchools();
      
      if (result.success && result.data.length > 0) {
        const schools = result.data.map(school => ({
          id: school._id,
          name: school.name
        }));
        this.setData({ schools });
      } else {
        // 如果数据库没有数据，使用默认学校列表
        const defaultSchools = [
          { id: 1, name: '北京大学' },
          { id: 2, name: '清华大学' },
          { id: 3, name: '复旦大学' },
          { id: 4, name: '上海交通大学' },
          { id: 5, name: '浙江大学' }
        ];
        this.setData({ schools: defaultSchools });
      }
    } catch (error) {
      console.error('加载学校列表失败:', error);
      // 加载失败时使用默认学校列表
      const defaultSchools = [
        { id: 1, name: '北京大学' },
        { id: 2, name: '清华大学' },
        { id: 3, name: '复旦大学' },
        { id: 4, name: '上海交通大学' },
        { id: 5, name: '浙江大学' }
      ];
      this.setData({ schools: defaultSchools });
    }
  },

  // 输入框内容改变
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
    
    // 清除该字段的错误信息
    if (this.data.errors[field]) {
      this.setData({
        [`errors.${field}`]: ''
      });
    }
  },

  // 显示学校选择器
  showSchoolSelector: function() {
    this.setData({ showSchoolPicker: true });
  },

  // 选择学校
  selectSchool: function(e) {
    const { school } = e.detail;
    this.setData({
      'formData.school': school,
      showSchoolPicker: false
    });
  },

  // 关闭学校选择器
  closeSchoolPicker: function() {
    this.setData({ showSchoolPicker: false });
  },

  // 新增：学校选择器值变化处理
  onSchoolChange: function(e) {
    const index = e.detail.value[0];  // 获取选择的索引
    this.setData({ schoolIndex: index });
  },

  // 新增：确认选择学校
  confirmSchool: function() {
    const { schools, schoolIndex } = this.data;
    if (schools.length > 0 && schoolIndex >= 0) {
      const selectedSchool = schools[schoolIndex].name;
      this.setData({
        'formData.school': selectedSchool,
        showSchoolPicker: false
      });
    }
  },

  // 切换协议勾选
  toggleAgreement: function() {
    this.setData({ agreements: !this.data.agreements });
  },

  // 表单验证
  validateForm: function() {
    const { username, email, password, confirmPassword, school } = this.data.formData;
    const errors = {};
    let isValid = true;
    
    // 验证用户名
    if (!username.trim()) {
      errors.username = '请输入用户名';
      isValid = false;
    } else if (username.length < 3) {
      errors.username = '用户名至少3个字符';
      isValid = false;
    }
    
    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = '请输入邮箱';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = '请输入有效的邮箱地址';
      isValid = false;
    }
    
    // 验证密码
    if (!password) {
      errors.password = '请输入密码';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = '密码至少8个字符（网站要求）';
      isValid = false;
    }
    
    // 验证确认密码
    if (!confirmPassword) {
      errors.confirmPassword = '请确认密码';
      isValid = false;
    } else if (confirmPassword !== password) {
      errors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }
    
    // 验证学校
    if (!school) {
      errors.school = '请选择学校';
      isValid = false;
    }
    
    // 验证协议
    if (!this.data.agreements) {
      errors.agreements = '请阅读并同意用户协议和隐私政策';
      isValid = false;
    }
    
    this.setData({ errors });
    return isValid;
  },

  // 注册
  onRegister: async function() {
    if (!this.validateForm()) return;
    
    this.setData({ loading: true });
    
    try {
      const { register } = require('../../utils/auth.js');
      const { username, email, password, confirmPassword, school } = this.data.formData;
      const { schools, schoolIndex } = this.data;
      const picked = schools[schoolIndex];

      const payload = {
        email: email.trim(),
        username: username.trim(),
        password,
        confirmPassword,
        countryCode: 'CN',
        stateCode: 'BJ'
      };

      if (picked && picked.id != null) {
        payload.schoolId = picked.id;
      } else if (school && String(school).trim()) {
        payload.newSchoolName = String(school).trim();
      }

      const result = await register(payload);

      if (result.success) {
        wx.showToast({
          title: result.message || '注册成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/login/login'
              });
            }, 2000);
          }
        });
      } else {
        wx.showToast({
          title: result.message || '注册失败，请检查表单',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('注册失败:', error);
      wx.showToast({
        title: error.message || '注册失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 跳转到登录页
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
});