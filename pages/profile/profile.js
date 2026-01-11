// pages/profile/profile.js
const app = getApp();
const { updateProfile } = require('../../utils/cloud-api.js');
const { cachedRequest } = require('../../utils/performance.js');

Page({
  data: {
    theme: 'light',
    userInfo: {
      username: '',
      email: '',
      school: '',
      studentId: '',
      unionId: '',
      bio: '',
      avatar: '',
      avatarEmoji: '👤'
    },
    editing: false,
    loading: false,
    saving: false,
    schools: [],
    showSchoolPicker: false,
    schoolIndex: 0
  },

  onLoad: function() {
    this.setTheme();
    this.loadUserInfo();
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

  // 加载用户信息
  loadUserInfo: async function() {
    this.setData({ loading: true });

    try {
      // 从本地存储获取用户信息
      const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {};

      // 转换数据格式
      const displayUserInfo = {
        username: userInfo.nickName || '',
        email: userInfo.email || '',
        school: userInfo.school || '',
        studentId: userInfo.studentId || '',
        unionId: userInfo.unionId || '',
        bio: userInfo.bio || '',
        avatar: userInfo.avatarUrl || '',
        avatarEmoji: '👤'
      };

      this.setData({
        userInfo: displayUserInfo,
        loading: false
      });
    } catch (error) {
      console.error('加载用户信息失败:', error);
      wx.showToast({
        title: error.message || '加载失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 加载学校列表
  loadSchools: async function() {
    try {
      const { getSchools } = require('../../utils/cloud-api.js');

      // 使用缓存加载学校列表
      const result = await cachedRequest('schools:list', async () => {
        return await getSchools();
      }, { expire: 60 * 60 * 1000 }); // 缓存1小时

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

  // 开始编辑
  startEditing: function() {
    this.setData({ editing: true });
  },

  // 取消编辑
  cancelEditing: function() {
    this.setData({ editing: false });
    // 重置数据
    this.loadUserInfo();
  },

  // 输入框内容改变
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`userInfo.${field}`]: value
    });
  },

  // 显示学校选择器
  showSchoolSelector: function() {
    this.setData({ showSchoolPicker: true });
  },

  // 选择学校
  selectSchool: function(e) {
    const idx = e.detail.value;
    const list = this.data.schools || [];
    const selected = list[idx] && (list[idx].name || list[idx]);
    this.setData({
      'userInfo.school': selected || '',
      showSchoolPicker: false,
      schoolIndex: idx
    });
  },

  // 关闭学校选择器
  closeSchoolPicker: function() {
    this.setData({ showSchoolPicker: false });
  },

  // 上传头像
  uploadAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.uploadImage(tempFilePath);
      }
    });
  },

  // 选择微信头像（官方组件）
  onChooseAvatar: function(e) {
    try {
      const { avatarUrl } = e.detail || {};
      if (!avatarUrl) {
        wx.showToast({ title: '未获取到头像', icon: 'none' });
        return;
      }
      this.uploadImage(avatarUrl);
    } catch (error) {
      wx.showToast({ title: '选择头像失败', icon: 'none' });
    }
  },

  // 上传图片
  uploadImage: async function(filePath) {
    this.setData({ loading: true });

    try {
      // 上传到云存储
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: `avatars/${Date.now()}.jpg`,
        filePath: filePath
      });

      const avatarUrl = uploadResult.fileID;

      this.setData({
        'userInfo.avatar': avatarUrl,
        loading: false
      });

      wx.showToast({
        title: '头像上传成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('上传头像失败:', error);
      wx.showToast({
        title: error.message || '上传失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 保存修改
  saveChanges: async function() {
    this.setData({ saving: true });

    try {
      const { userInfo } = this.data;

      // 调用云函数更新用户资料
      const result = await updateProfile({
        nickName: userInfo.username,
        avatarUrl: userInfo.avatar,
        school: userInfo.school,
        bio: userInfo.bio,
        studentId: userInfo.studentId
      });

      if (result.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            // 更新全局用户信息
            app.globalData.userInfo = {
              ...app.globalData.userInfo,
              ...result.userInfo
            };
            wx.setStorageSync('userInfo', app.globalData.userInfo);

            this.setData({ editing: false });
          }
        });
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({
        title: error.message || '保存失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ saving: false });
    }
  }
}); 
