// pages/center/center.js
const app = getApp();
const { requireAuth } = require('../../utils/auth.js');
const { getUserStats } = require('../../utils/cloud-api.js');

Page({
  data: {
    theme: 'light',
    userInfo: null,
    stats: {
      totalPoints: 0,
      totalCarbon: 0,
      activityCount: 0,
      level: 1
    },
    menuItems1: [],
    menuItems2: [],
    isLoading: true,
    menuItems: [
      {
        id: 'carbon-history',
        title: '碳足迹记录',
        emoji: '🌱',
        gradient: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
        subtitle: '查看历史记录',
        route: '/pages/carbon-history/carbon-history'
      },
      {
        id: 'activities',
        title: '我的活动',
        emoji: '📋',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        subtitle: '查看挑战进度',
        route: '/pages/my-activities/my-activities'
      },
      {
        id: 'achievements',
        title: '我的成就',
        emoji: '🏆',
        gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
        subtitle: '环保徽章',
        route: '/pages/achievements/achievements'
      },
      {
        id: 'wallet',
        title: '积分钱包',
        emoji: '💰',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        subtitle: '积分明细',
        route: '/pages/wallet/wallet'
      },
      {
        id: 'exchange',
        title: '积分兑换',
        emoji: '🎁',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        subtitle: '兑换礼品',
        route: '/pages/exchange/exchange'
      },
      {
        id: 'settings',
        title: '设置',
        emoji: '⚙️',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        subtitle: '账号管理',
        route: '/pages/settings/settings'
      },
      {
        id: 'about',
        title: '关于我们',
        emoji: 'ℹ️',
        gradient: 'linear-gradient(135deg, #FF2D55 0%, #FF6B81 100%)',
        subtitle: '了解我们',
        route: '/pages/about/about'
      },
      {
        id: 'help',
        title: '帮助与反馈',
        emoji: '❓',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        subtitle: '常见问题',
        route: '/pages/help/help'
      }
    ],
    loading: true,
    unreadMessages: 0
  },

  onLoad: async function() {
    // 检查登录状态
    const authenticated = await requireAuth('/pages/center/center');
    if (!authenticated) return;

    // 获取主题设置
    this.setTheme();

    // 初始化菜单项分组
    this.setMenuItemGroups();

    // 显示导航栏加载动画
    wx.showNavigationBarLoading();
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    this.refreshData();
    wx.stopPullDownRefresh();
    wx.hideNavigationBarLoading();
  },
  
  // 设置菜单项分组
  setMenuItemGroups: function() {
    const menuItems = this.data.menuItems;
    const menuItems1 = menuItems.slice(0, 4);
    const menuItems2 = menuItems.slice(4);
    
    this.setData({
      menuItems1,
      menuItems2
    });
  },

  onShow: function() {
    // 每次显示页面时重新加载用户数据
    this.setData({ isLoading: true });
    this.loadUserData();
    this.checkUnreadMessages();
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

  // 加载用户数据
  loadUserData: async function() {
    this.setData({ isLoading: true });

    try {
      // 调用云函数获取用户统计数据
      const result = await getUserStats();

      if (result.success) {
        const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo;

        this.setData({
          userInfo,
          stats: result.stats,
          isLoading: false
        });
      } else {
        throw new Error(result.message || '获取数据失败');
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      // 使用本地缓存数据，不显示toast避免频繁提示
      const userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo;

      this.setData({
        userInfo: userInfo || {
          nickName: '未登录',
          avatarUrl: ''
        },
        stats: {
          totalPoints: userInfo?.points || 0,
          totalCarbon: userInfo?.totalCarbon || 0,
          activityCount: 0,
          level: userInfo?.level || 1
        },
        isLoading: false
      });
    }
  },

  // 检查未读消息
  checkUnreadMessages: async function() {
    try {
      // 模拟检查未读消息
      // 实际项目中应该调用后端API
      /*
      const messageResponse = await get('/api/user/unread-count');
      const unreadCount = messageResponse.data.count;
      */
      
      // 模拟未读消息数
      const unreadCount = 3;
      
      this.setData({ unreadMessages: unreadCount });
    } catch (error) {
      console.error('检查未读消息失败:', error);
    }
  },

  // 头像点击
  onAvatarTap: function() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  // 消息通知点击
  onMessageTap: function() {
    wx.navigateTo({
      url: '/pages/messages/messages'
    });
  },

  // 菜单项点击
  onMenuItemTap: function(e) {
    const { route } = e.currentTarget.dataset;
    if (route) {
      wx.navigateTo({
        url: route
      });
    }
  },

  // 刷新数据
  refreshData: function() {
    this.setData({ isLoading: true });
    this.loadUserData();
    this.checkUnreadMessages();
  },

  // 查看等级详情
  onLevelTap: function() {
    wx.showToast({
      title: `当前等级：${this.data.stats.level}\n再积累${(this.data.stats.level * 200 - this.data.stats.totalPoints).toFixed(0)}积分升级`,
      icon: 'none',
      duration: 2000
    });
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 清除本地存储
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('token');
            
            // 更新全局状态
            app.globalData.userInfo = null;
            app.globalData.isLogin = false;
            
            // 实际项目中可能需要调用后端登出API
            /*
            await post('/api/auth/logout');
            */
            
            // 跳转到登录页面
            wx.redirectTo({
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