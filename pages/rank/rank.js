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

    // 加载排行榜数据
    this.loadRankData();
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
    const limit = 20;

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
        if (result.code === 'FRIEND_UNSUPPORTED') {
          wx.showToast({
            title: result.message || '好友榜暂未开放',
            icon: 'none'
          });
          this.setData({
            rankList: [],
            userRank: null,
            loading: false,
            refreshing: false,
            hasMore: false
          });
          return;
        }

        // 格式化碳排放值，确保显示两位小数
        const formatCarbonValue = (value) => {
          if (value === undefined || value === null) return 0
          const num = Number(value)
          if (isNaN(num)) return 0
          return Math.round(num * 100) / 100
        }

        // 格式化排行榜数据
        const formattedRankList = (result.rankList || []).map(item => ({
          ...item,
          carbonSaved: formatCarbonValue(item.carbonSaved)
        }))

        // 格式化用户排名数据
        const formattedUserRank = result.userRank ? {
          ...result.userRank,
          carbonSaved: formatCarbonValue(result.userRank.carbonSaved)
        } : null

        // 检查当前用户是否已经在排行榜列表中
        let finalRankList = formattedRankList
        let finalUserRank = formattedUserRank
        
        // 如果当前用户有排名，并且已经在排行榜列表中，从列表中移除，避免重复显示
        if (formattedUserRank && formattedUserRank.userId) {
          // 查找当前用户是否在排行榜列表中
          const userIndex = formattedRankList.findIndex(item => item._id === formattedUserRank.userId)
          if (userIndex !== -1) {
            // 从列表中移除当前用户，因为会在下方单独显示
            finalRankList = formattedRankList.filter(item => item._id !== formattedUserRank.userId)
            // 确保排名顺序正确，重新计算排名
            finalRankList.forEach((item, index) => {
              // 保持原有相对排名，但确保排名数字连续
              const baseRank = (page - 1) * limit + 1
              item.rank = baseRank + index
            })
          }
        }

        // 合并数据（下拉加载更多）
        const updatedRankList = page === 1 ? finalRankList : [...this.data.rankList, ...finalRankList];

        // 检查数据完整性
        if (updatedRankList.length > 0 && (!updatedRankList[0].username || updatedRankList[0].carbonSaved === undefined)) {
          console.warn('排行榜数据字段不完整，请检查用户数据是否包含 username 和 totalCarbon 字段');
        }

        this.setData({
          rankList: updatedRankList,
          userRank: finalUserRank,
          loading: false,
          refreshing: false,
          hasMore: result.hasMore
        });
      } else {
        // 处理特殊错误情况
        if (result.code === 'NO_SCHOOL') {
          wx.showModal({
            title: '提示',
            content: '请先在个人资料中设置学校信息，才能查看校内榜',
            showCancel: false,
            success: () => {
              wx.switchTab({ url: '/pages/profile/profile' });
            }
          });
        } else if (result.code === 'NO_LOGIN') {
          // 未登录时，对于全球榜和校内榜，仍然可以显示（但不会显示用户个人排名）
          if (currentTab === 'global') {
            // 全球榜可以正常显示，只是没有用户个人排名
            this.setData({
              rankList: [],
              userRank: null,
              loading: false,
              refreshing: false,
              hasMore: false
            });
            return;
          } else if (currentTab === 'school') {
            // 校内榜需要学校信息
            this.setData({
              rankList: [],
              userRank: null,
              loading: false,
              refreshing: false,
              hasMore: false
            });
            wx.showToast({
              title: '请先登录并设置学校信息',
              icon: 'none'
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '请先登录查看好友榜',
              showCancel: false,
              success: () => {
                wx.switchTab({ url: '/pages/profile/profile' });
              }
            });
          }
        } else if (result.code === 'INVALID_TYPE') {
          wx.showToast({
            title: '榜单类型错误',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: result.message || '获取排行榜失败，请重试',
            icon: 'none'
          });
        }
        
        this.setData({
          loading: false,
          refreshing: false
        });
      }
    } catch (error) {
      console.error('获取排行榜失败:', error);

      // 未登录用户仍然可以查看全球榜和校内榜
      if (currentTab === 'global' || currentTab === 'school') {
        // 显示空状态
        this.setData({
          rankList: [],
          userRank: null,
          loading: false,
          refreshing: false,
          hasMore: false
        });
        
        wx.showToast({
          title: '暂无排行榜数据',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: error.message || '获取排行榜失败，请重试',
          icon: 'none'
        });
        
        this.setData({
          loading: false,
          refreshing: false
        });
      }
    }
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