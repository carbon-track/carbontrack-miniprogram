// pages/index/index.js
const app = getApp();
const { get } = require('../../utils/api.js');
const { isLoggedIn } = require('../../utils/auth.js');
const { getUserStats } = require('../../utils/cloud-api.js');

Page({
  data: {
    theme: 'light',
    banners: [],
    announcements: [],
    features: [],
    userStats: {
      carbonSaved: 0,
      activities: 0,
      points: 0
    },
    loading: true,
    refreshing: false,
    sdkVersion: '',
    canGetUserProfile: false
  },

  onLoad: function() {
    // 获取主题设置
    this.setTheme();
    
    // 加载首页数据
    this.loadHomeData();
    const systemInfo = app.globalData.systemInfo || wx.getSystemInfoSync() || {};
    const sdkVersion = systemInfo.SDKVersion || '';
    const canGetUserProfile = !!(wx.canIUse && wx.canIUse('getUserProfile'));
    this.setData({ sdkVersion, canGetUserProfile });
  },

  onShow: function() {
    // 每次显示页面时检查登录状态
    if (isLoggedIn()) {
      this.loadUserStats();
    }
  },

  onPullDownRefresh: function() {
    this.setData({ refreshing: true });
    this.loadHomeData(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    });
  },

  // 设置主题
  setTheme: function() {
    const theme = app.globalData.theme || wx.getStorageSync('theme') || 'light';
    this.setData({ theme });
    // 添加主题类名到页面
    wx.setNavigationBarColor({
      frontColor: theme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: theme === 'dark' ? '#1C1C1E' : '#ffffff'
    });
  },

  // 加载首页数据
  loadHomeData: async function(callback) {
    this.setData({ loading: true });
    
    try {
      const { getAnnouncements } = require('../../utils/cloud-api.js');
      
      // 加载公告数据
      const announcementsResult = await getAnnouncements();
      
      this.setData({
        banners: [
          {
            id: 1,
            image: '/assets/images/banner1.jpg',
            title: '校园碳账户计划',
            url: '/pages/calculate/calculate',
            emoji: '🌱'
          },
          {
            id: 2,
            image: '/assets/images/banner2.jpg',
            title: '环保达人排行榜',
            url: '/pages/rank/rank',
            emoji: '🏆'
          },
          {
            id: 3,
            image: '/assets/images/banner3.jpg',
            title: '积分兑换商城',
            url: '/pages/store/store',
            emoji: '🛍️'
          }
        ],
        announcements: announcementsResult.success ? announcementsResult.data : [],
        features: [
          {
            id: 1,
            title: '碳足迹计算',
            description: '记录环保活动，计算碳减排量',
            emoji: '📊',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            url: '/pages/calculate/calculate',
            type: 'tab' // 标记为tab页面
          },
          {
            id: 2,
            title: '环保排行榜',
            description: '查看校园环保达人排名',
            emoji: '🏆',
            gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
            url: '/pages/rank/rank',
            type: 'tab' // 标记为tab页面
          },
          {
            id: 3,
            title: '积分商城',
            description: '使用环保积分兑换精美礼品',
            emoji: '🛍️',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            url: '/pages/store/store',
            type: 'page' // 标记为普通页面
          },
          {
            id: 4,
            title: '环保知识',
            description: '了解更多环保知识和小贴士',
            emoji: '💡',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            url: '/pages/help/help',
            type: 'page' // 标记为普通页面
          }
        ],
        loading: false
      });
      
      if (callback) callback();
    } catch (error) {
      console.error('加载首页数据失败:', error);
      this.setData({ loading: false });
    }

  },

  // 加载用户统计数据
  loadUserStats: async function() {
    if (!isLoggedIn()) return;

    try {
      const result = await getUserStats();

      if (result.success) {
        // 碳减排数值取整
        this.setData({
          userStats: {
            carbonSaved: Math.floor(result.stats.totalCarbon || 0),
            activities: result.stats.activityCount || 0,
            points: result.stats.totalPoints || 0
          }
        });
      }
    } catch (error) {
      console.error('加载用户统计数据失败:', error);
    }
  },

  // 轮播图点击事件
  onBannerTap: function(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url
      });
    }
  },

  // 公告点击事件
  onAnnouncementTap: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/announcement/detail?id=${id}`
    });
  },

  // 功能卡片点击事件
  onFeatureTap: function(e) {
    const { url, type } = e.currentTarget.dataset;
    
    if (!url) return;
    
    // 根据type字段选择不同的导航方式
    if (type === 'tab') {
      // 切换到tab页面
      wx.switchTab({
        url
      });
    } else {
      // 普通页面跳转
      wx.navigateTo({
        url
      });
    }
  },

  // 记录活动按钮点击事件
  onRecordActivityTap: function() {
    if (!isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/login/login?redirect=/pages/calculate/calculate'
      });
      return;
    }
    
    // 切换到"记录"tab
    wx.switchTab({
      url: '/pages/calculate/calculate'
    });
  },

  // 前往个人中心
  onUserCenterTap: function() {
    if (!isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/login/login?redirect=/pages/center/center'
      });
      return;
    }
    
    // 切换到"我的"tab
    wx.switchTab({
      url: '/pages/center/center'
    });
  },

  // 切换主题
  onToggleTheme: function() {
    const newTheme = this.data.theme === 'light' ? 'dark' : 'light';
    this.setData({ theme: newTheme });
    app.globalData.theme = newTheme;
    wx.setStorageSync('theme', newTheme);
    
    // 更新页面样式
    this.setTheme();
  },

  onVersionBannerTap: function() {
    wx.navigateTo({
      url: '/pages/login/login?debug=1'
    });
  }
});