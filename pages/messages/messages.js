// pages/messages/messages.js
const app = getApp();
const { getMessages, markAllMessagesRead } = require('../../utils/cloud-api.js');

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
      const result = await getMessages({
        page: 1,
        limit: 20
      });
      
      if (result.success) {
        const formattedMessages = (result.data || []).map(m => ({
          id: m.id,
          title: m.title,
          content: m.content,
          type: m.type || '系统通知',
          time: m.created_at ? new Date(m.created_at).toLocaleString() : '',
          read: !!m.is_read
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
    const messages = [...this.data.messages];
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    if (messageIndex !== -1) {
      messages[messageIndex].read = true;
      this.setData({ messages });
    }

    const m = messages[messageIndex];
    wx.showModal({
      title: m.title || '消息',
      content: m.content || '',
      showCancel: false
    });
  },

  // 标记全部已读
  markAllAsRead: async function() {
    try {
      await markAllMessagesRead();
    } catch (e) {}
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