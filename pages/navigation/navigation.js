// pages/navigation/navigation.js
const app = getApp();

Page({
  data: {
    theme: 'light'
  },

  onLoad: function() {
    this.setTheme();
  },

  onShow: function() {
    // 确保页面显示时主题正确
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

  // 跳转到页面
  navigateToPage: function(e) {
    const route = e.currentTarget.dataset.route;
    if (!route) return;
    
    // 检查是否是Tab页面
    const tabPages = [
      '/pages/index/index',
      '/pages/calculate/calculate', 
      '/pages/rank/rank',
      '/pages/center/center'
    ];
    
    if (tabPages.includes(route)) {
      wx.switchTab({
        url: route,
        fail: (err) => {
          console.error('切换Tab失败:', err);
          wx.showToast({
            title: '导航失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.navigateTo({
        url: route,
        fail: (err) => {
          console.error('跳转失败:', err);
          wx.showToast({
            title: '页面不存在',
            icon: 'none'
          });
        }
      });
    }
  },

  // 跳转到网页
  navigateToWebview: function(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;
    
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面不存在',
          icon: 'none'
        });
      }
    });
  },

  // 分享给朋友
  onShareAppMessage: function() {
    return {
      title: '🗺️ CarbonTrack 导航指南 - 快速了解应用功能',
      path: '/pages/navigation/navigation',
      imageUrl: '/images/share.jpg'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '🗺️ CarbonTrack 导航指南 - 快速了解应用功能',
      query: '',
      imageUrl: '/images/share.jpg'
    };
  }
});
