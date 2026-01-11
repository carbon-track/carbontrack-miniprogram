// pages/my-activities/my-activities.js
const app = getApp();
const { getActivities, callCloudFunction } = require('../../utils/cloud-api.js');

Page({
  data: {
    theme: 'light',
    activities: [],
    loading: true,
    filter: 'all', // all: 全部, ongoing: 进行中, completed: 已完成
    tabs: [
      { key: 'all', name: '全部' },
      { key: 'ongoing', name: '进行中' },
      { key: 'completed', name: '已完成' }
    ]
  },

  onLoad: function() {
    this.setTheme();
    this.loadActivities();
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

  // 加载活动列表
  loadActivities: async function() {
    this.setData({ loading: true });

    try {
      // 调用云函数获取活动数据
      const result = await getActivities();

      if (result.success) {
        // 转换活动数据格式
        const formattedActivities = result.data.map(activity => {
          const progress = activity.targetValue > 0
            ? Math.min(100, Math.round((activity.currentProgress || 0) / activity.targetValue * 100))
            : (activity.completed ? 100 : 0);

          const status = activity.completed ? 'completed' : (progress >= 100 ? 'completed' : 'ongoing');

          return {
            id: activity._id,
            title: activity.name,
            description: activity.description,
            startDate: '', // 活动不设开始结束日期，是持续进行的
            endDate: '',
            status,
            progress,
            points: activity.rewardPoints || 0,
            icon: activity.image || '/assets/icons/activity.png',
            joined: activity.joined,
            canClaim: activity.canClaim
          };
        });

        // 根据筛选条件过滤活动
        let filteredActivities = formattedActivities;
        if (this.data.filter !== 'all') {
          filteredActivities = formattedActivities.filter(activity => activity.status === this.data.filter);
        }

        this.setData({
          activities: filteredActivities,
          loading: false
        });
      } else {
        throw new Error(result.error || '获取活动失败');
      }
    } catch (error) {
      console.error('加载活动失败:', error);
      this.setData({ loading: false, activities: [] });
    }
  },

  // 切换筛选条件
  switchFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ filter });
    this.loadActivities();
  },

  // 查看活动详情/参加活动
  viewActivity: async function(e) {
    const activityId = e.currentTarget.dataset.id;
    const activity = this.data.activities.find(a => a.id === activityId);

    if (activity && !activity.joined) {
      // 未参加的活动，点击参加
      try {
        wx.showLoading({ title: '参加中...' });

        const result = await callCloudFunction('join-activity', { activityId });

        wx.hideLoading();

        if (result.success) {
          wx.showToast({
            title: '参加成功',
            icon: 'success'
          });
          this.loadActivities(); // 重新加载活动列表
        } else {
          wx.showToast({
            title: result.message || '参加失败',
            icon: 'none'
          });
        }
      } catch (error) {
        wx.hideLoading();
        console.error('参加活动失败:', error);
        wx.showToast({
          title: '参加失败，请重试',
          icon: 'none'
        });
      }
    } else {
      // 已参加的活动，跳转详情页
      wx.navigateTo({
        url: `/pages/activity-detail/activity-detail?id=${activityId}`
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadActivities().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom: function() {
    // 活动数量有限，不需要分页加载
  }
});