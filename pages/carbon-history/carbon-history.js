// pages/carbon-history/carbon-history.js
const app = getApp();
const { getCarbonRecords } = require('../../utils/cloud-api.js');
const { getAllActivityTypes } = require('../../utils/carbon-calculator.js');

Page({
  data: {
    theme: 'light',
    records: [],
    loading: true,
    refreshing: false,
    loadingMore: false,
    page: 1,
    limit: 20,
    hasMore: true,
    total: 0,
    totalCarbon: 0,
    filter: 'all', // all: 全部
    filterOptions: [
      { key: 'all', name: '全部' }
    ]
  },

  onLoad: function() {
    this.setTheme();
    this.loadFilterOptions();
    this.loadRecords();
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

  // 加载筛选选项
  loadFilterOptions: function() {
    const activityTypes = getAllActivityTypes();
    const filterOptions = [{ key: 'all', name: '全部' }];
    
    activityTypes.forEach(type => {
      filterOptions.push({
        key: type.name,
        name: type.name
      });
    });

    this.setData({ filterOptions });
  },

  // 加载记录列表
  loadRecords: async function(refresh = false) {
    if (refresh) {
      this.setData({ page: 1, hasMore: true });
    }

    if (!this.data.hasMore && !refresh) return;

    this.setData({ 
      [refresh ? 'refreshing' : 'loading']: true,
      [refresh ? 'loading' : 'loadingMore']: true 
    });

    try {
      const result = await getCarbonRecords({
        page: this.data.page,
        limit: this.data.limit,
        activityType: this.data.filter === 'all' ? undefined : this.data.filter
      });

      if (result.success) {
        const newRecords = result.records.map(record => ({
          id: record._id,
          date: record.date,
          activityType: record.activityType,
          activityDetail: record.activityDetail,
          carbonValue: record.carbonValue,
          points: record.points,
          imageUrl: record.imageUrl,
          description: record.description,
          createTime: record.createTime
        }));

        // 计算总碳减排量
        const allRecords = refresh ? newRecords : [...this.data.records, ...newRecords];
        const totalCarbon = allRecords.reduce((sum, r) => sum + (r.carbonValue || 0), 0).toFixed(1);

        this.setData({
          records: refresh ? newRecords : [...this.data.records, ...newRecords],
          total: result.total,
          totalCarbon,
          hasMore: result.hasMore,
          page: this.data.page + 1,
          loading: false,
          refreshing: false,
          loadingMore: false
        });
      } else {
        throw new Error(result.message || '获取记录失败');
      }
    } catch (error) {
      console.error('加载记录失败:', error);
      wx.showToast({
        title: error.message || '加载失败，请重试',
        icon: 'none'
      });
      this.setData({ 
        loading: false, 
        refreshing: false, 
        loadingMore: false 
      });
    }
  },

  // 切换筛选条件
  onFilterChange: function(e) {
    const filter = e.detail.value;
    this.setData({ filter });
    this.loadRecords(true);
  },

  // 预览图片
  previewImage: function(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.previewImage({
        urls: [url],
        current: url
      });
    }
  },

  // 阻止事件冒泡
  preventBubble: function() {
    // 阻止事件冒泡到卡片点击
  },

  // 查看记录详情
  viewDetail: function(e) {
    const recordId = e.currentTarget.dataset.id;
    // 可以跳转到详情页或显示弹窗
    wx.showModal({
      title: '记录详情',
      content: `活动类型：${e.currentTarget.dataset.type}\n碳减排量：${e.currentTarget.dataset.carbon}kg\n获得积分：${e.currentTarget.dataset.points}`,
      showCancel: false
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadRecords(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadRecords(false);
    }
  },

  // 格式化日期
  formatDate: function(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },

  // 格式化时间
  formatDateTime: function(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
});
