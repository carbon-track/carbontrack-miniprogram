// pages/messages/messages.js
const app = getApp();
const { callCloudFunction } = require('../../utils/cloud-api.js');

Page({
  data: {
    theme: 'light',
    messages: [],
    loading: true,
    types: ['全部', '系统通知', '活动提醒', '兑换记录', '好友消息'],
    activeType: 0
  },

  onLoad: function() {
    this.setTheme();
    this.loadMessages();
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

  // 加载消息列表
  loadMessages: async function() {
    this.setData({ loading: true });
    
    try {
      const type = this.data.activeType === 0 ? 'all' : 
        this.data.types[this.data.activeType];
      
      const result = await callCloudFunction('get-messages', {
        type,
        page: 1,
        limit: 20
      });
      
      if (result.success) {
        const formattedMessages = result.data.map(m => ({
          id: m._id,
          title: m.title,
          content: m.content,
          type: m.type,
          time: m.createdAt ? new Date(m.createdAt).toLocaleString() : m.time,
          read: m.read
        }));
        
        this.setData({
          messages: formattedMessages,
          loading: false
        });
      } else {
        throw new Error(result.error || '加载消息失败');
      }
    } catch (error) {
      console.error('加载消息失败:', error);
      this.setData({ loading: false, messages: [] });
    }
  },

  // 切换消息类型
  switchType: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeType: index
    });
    this.loadMessages();
  },

  // 查看消息详情
  viewMessage: function(e) {
    const messageId = e.currentTarget.dataset.id;
    // 标记消息为已读
    const messages = [...this.data.messages];
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      messages[messageIndex].read = true;
      this.setData({ messages });
    }
    
    // 实际项目中可以跳转到消息详情页
    wx.showModal({
      title: messages[messageIndex].title,
      content: messages[messageIndex].content,
      showCancel: false
    });
  },

  // 标记全部已读
  markAllAsRead: function() {
    const messages = this.data.messages.map(m => ({ ...m, read: true }));
    this.setData({ messages });
    wx.showToast({
      title: '已全部标记为已读',
      icon: 'success'
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadMessages().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});