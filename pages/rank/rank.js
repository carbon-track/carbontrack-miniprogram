// pages/rank/rank.js
const app = getApp();
const { requireAuth } = require('../../utils/auth.js');
const { getRank } = require('../../utils/cloud-api.js');
const { cachedRequest, throttle } = require('../../utils/performance.js');

Page({
  data: {
    theme: 'light',
    currentTab: 'global', // global, school, friend
    rankList: [], // 排行榜数据
    userRank: null, // 当前用户排名
    loading: true,
    refreshing: false,
    page: 1,
    hasMore: true,
    tabs: [
      { id: 'global', name: '全球榜' },
      { id: 'school', name: '校内榜' },
      { id: 'friend', name: '好友榜' }
    ]
  },

  onLoad: function() {
    // 获取主题设置
    this.setTheme();

    // 创建节流函数
    this.throttledLoadMore = throttle(this._loadMore.bind(this), 500);

    // 加载排行榜数据（允许未登录用户查看模拟数据）
    this.loadRankData();

    // 检查登录状态（只在需要操作时强制登录）
    // 如果未登录，仍然允许查看排行榜
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

  // 切换标签
  switchTab: function(e) {
    const tabId = e.currentTarget.dataset.tab;
    if (tabId === this.data.currentTab) return;
    
    this.setData({
      currentTab: tabId,
      rankList: [],
      page: 1,
      hasMore: true,
      loading: true
    });
    
    this.loadRankData();
  },

  // 加载排行榜数据
  loadRankData: async function() {
    const { currentTab, page, refreshing } = this.data;

    try {
      const cacheKey = `rank:${currentTab}:page${page}`;

      // 第一页且非刷新时使用缓存
      const shouldUseCache = page === 1 && !refreshing;

      let result;
      if (shouldUseCache) {
        result = await cachedRequest(cacheKey, async () => {
          return await getRank({
            type: currentTab,
            page,
            limit: 20
          });
        }, { expire: 2 * 60 * 1000 }); // 缓存2分钟
      } else {
        result = await getRank({
          type: currentTab,
          page,
          limit: 20
        });
      }

      if (result.success) {
        // 合并数据（下拉加载更多）
        const updatedRankList = page === 1 ? result.rankList : [...this.data.rankList, ...result.rankList];

        // 检查数据完整性
        if (updatedRankList.length > 0 && (!updatedRankList[0].username || updatedRankList[0].carbonSaved === undefined)) {
          console.warn('排行榜数据字段不完整，请检查用户数据是否包含 username 和 totalCarbon 字段');
        }

        this.setData({
          rankList: updatedRankList,
          userRank: result.userRank,
          loading: false,
          refreshing: false,
          hasMore: result.hasMore
        });
      } else {
        throw new Error(result.message || '获取排行榜失败');
      }
    } catch (error) {
      console.error('获取排行榜失败:', error);

      // 如果未登录，显示模拟数据
      if (!app.globalData.isLogin) {
        const mockRankList = this.generateMockRankData(page);
        const mockUserRank = this.generateMockUserRank();
        const updatedRankList = page === 1 ? mockRankList : [...this.data.rankList, ...mockRankList];

        this.setData({
          rankList: updatedRankList,
          userRank: mockUserRank,
          loading: false,
          refreshing: false,
          hasMore: page < 3
        });
      } else {
        // 检查是否是字段缺失错误
        if (error.message && error.message.includes('totalCarbon')) {
          wx.showModal({
            title: '数据初始化提示',
            content: '用户数据缺少碳减排量字段，请在数据库中添加 totalCarbon 和 points 字段',
            showCancel: false
          });
        } else {
          wx.showToast({
            title: error.message || '获取排行榜失败，请重试',
            icon: 'none'
          });
        }
        this.setData({
          loading: false,
          refreshing: false
        });
      }
    }
  },

  // 生成模拟排行榜数据
  generateMockRankData: async function(page) {
    const baseRank = (page - 1) * 20;
    const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF8C42', '#6A0572', '#AB83A1'];

    // 更真实的用户名列表
    const usernames = [
      '绿色先锋🌱', '低碳达人💡', '环保卫士🌍', '自然爱好者🌸',
      '地球守护者🌳', '节能小能手⚡', '生态平衡者♻️', '环保志愿者🎯',
      '绿色生活家🏡', '可持续发展者🌊', '清洁地球人🚮', '绿植养护师🌿',
      '环保创新者💚', '低碳出行者🚲', '资源回收师📦', '环保教师👩‍🏫',
      '生态摄影师📸', '环保设计师🎨', '绿色科学家🔬', '碳中和倡导者🌱'
    ];

    // 更多样化的学校名称
    const schools = [
      '北京大学', '清华大学', '复旦大学', '上海交通大学',
      '浙江大学', '南京大学', '武汉大学', '中山大学',
      '环保科技大学', '绿色能源学院', '生态工程学院', '可持续发展大学'
    ];

    // 根据不同榜单类型生成差异化数据
    const generatePoints = (rank) => {
      const basePoints = {
        'global': 1500 - rank * 12 + Math.floor(Math.random() * 30),
        'school': 1200 - rank * 15 + Math.floor(Math.random() * 25),
        'friend': 1000 - rank * 8 + Math.floor(Math.random() * 40)
      };
      return Math.max(100, basePoints[this.data.currentTab]);
    };

    const generateCarbonSaved = (rank) => {
      const baseCarbon = {
        'global': 150 - rank * 0.6 + Math.random() * 3,
        'school': 120 - rank * 0.8 + Math.random() * 2.5,
        'friend': 100 - rank * 0.5 + Math.random() * 3.5
      };
      return (Math.max(10, baseCarbon[this.data.currentTab])).toFixed(2);
    };

    // Emoji头像映射
    const emojiAvatars = ['🌱', '💡', '🌍', '🌸', '🌳', '⚡', '♻️', '🎯', '🏡', '🌊', '🚮', '🌿', '💚', '🚲', '📦', '👩‍🏫', '📸', '🎨', '🔬', '🌱'];

    // 优化：分批生成数据，避免阻塞UI
    const batchSize = 5;
    const rankList = [];
    const total = 20;

    for (let i = 0; i < total; i += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, total - i) }, (_, index) => {
        const rank = baseRank + i + index + 1;
        const usernameIndex = (baseRank + i + index) % usernames.length;

        return {
          id: rank,
          rank: rank,
          username: usernames[usernameIndex],
          avatarEmoji: emojiAvatars[usernameIndex],
          avatarColor: avatarColors[rank % avatarColors.length],
          points: generatePoints(rank),
          carbonSaved: generateCarbonSaved(rank),
          level: Math.min(15, Math.floor(rank / 3) + 1 + Math.floor(Math.random() * 3)),
          school: schools[Math.floor(Math.random() * schools.length)],
          // 添加更多真实数据字段
          contributionDays: Math.floor(Math.random() * 365) + 30,
          activitiesCompleted: Math.floor(Math.random() * 500) + 50
        };
      });

      rankList.push(...batch);

      // 每处理一批后稍微让出主线程
      if (i + batchSize < total) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return rankList;
  },

  // 生成模拟用户排名数据
  generateMockUserRank: function() {
    // 根据不同榜单类型返回不同的用户排名数据
    const userRankData = {
      'global': {
        rank: 45,
        points: 875,
        carbonSaved: 85.6,
        level: 7
      },
      'school': {
        rank: 12,
        points: 950,
        carbonSaved: 92.3,
        level: 8
      },
      'friend': {
        rank: 8,
        points: 990,
        carbonSaved: 97.8,
        level: 9
      }
    };
    
    return userRankData[this.data.currentTab] || userRankData.global;
  },

  // 下拉刷新
  onRefresh: function() {
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    });
    this.loadRankData();
  },

  // 上拉加载更多（带节流）
  onReachBottom: function() {
    // 使用节流函数
    this.throttledLoadMore();
  },

  // 实际加载更多（内部方法）
  _loadMore: function() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({
      page: this.data.page + 1,
      loading: true
    });
    this.loadRankData();
  },

  // 查看用户详情
  viewUserDetail: function(e) {
    const userId = e.currentTarget.dataset.userId;
    // 实际项目中跳转到用户详情页面
    wx.showToast({
      title: `查看用户${userId}详情`,
      icon: 'none'
    });
  },

  // 刷新按钮点击
  refreshRank: function() {
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    });
    this.loadRankData();
  }
});