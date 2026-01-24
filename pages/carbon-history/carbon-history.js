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
    ],
    showDetailModal: false,
    selectedRecord: {}
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

      console.log('云函数返回结果:', result);
      console.log('记录数量:', result.records?.length || 0);
      if (result.records && result.records.length > 0) {
        console.log('第一条记录:', result.records[0]);
        console.log('第一条记录的imageUrl:', result.records[0].imageUrl);
      }

      if (result.success) {
        const newRecords = result.records.map(record => {
          // 尝试从activityDetail中提取数量和单位
          const detailText = record.activityDetail || '';
          let amount = '-';
          let unit = '';

          // 从activityDetail中解析数量和单位（格式如："🚶 步行 5 公里"）
          const match = detailText.match(/(\d+\.?\d*)\s*([^\s]+)/);
          if (match) {
            amount = match[1];
            unit = match[2];
          }

          // 处理日期字段，兼容多种可能的字段名
          const date = record.date || record._createTime || record.createTime || new Date().toISOString();

          // 处理创建时间字段，优先使用_createTime（云数据库自动生成）
          const createTime = record.createTime || record._createTime || record.date || new Date().toISOString();

          // 调试：打印imageUrl信息
          console.log('记录图片信息:', {
            id: record._id,
            activityType: record.activityType,
            imageUrl: record.imageUrl,
            imageUrlLength: record.imageUrl ? record.imageUrl.length : 0,
            hasImage: !!record.imageUrl
          });

          return {
            id: record._id,
            date: date,
            activityType: record.activityType,
            activityDetail: record.activityDetail,
            carbonValue: Math.floor(record.carbonValue) || 0,
            points: record.points,
            imageUrl: record.imageUrl,
            description: record.description,
            createTime: createTime,
            amount: amount,
            unit: unit,
            emoji: detailText.substring(0, 2)
          };
        });

        // 计算总碳减排量
        const allRecords = refresh ? newRecords : [...this.data.records, ...newRecords];
        const totalCarbon = Math.floor(allRecords.reduce((sum, r) => sum + (r.carbonValue || 0), 0));

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
      // 直接使用云存储fileID预览,微信会自动处理
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
    const record = this.data.records.find(r => r.id === recordId);

    if (record) {
      console.log('选中的记录:', record);
      console.log('选中的记录imageUrl:', record.imageUrl);
      console.log('imageUrl类型:', typeof record.imageUrl);
      console.log('imageUrl是否为真值:', !!record.imageUrl);
      this.setData({
        selectedRecord: record,
        showDetailModal: true
      });
    }
  },

  // 关闭详情弹窗
  onCloseDetailModal: function() {
    this.setData({
      showDetailModal: false,
      selectedRecord: {}
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
  },

  // 取整函数
  toInteger: function(value) {
    return Math.floor(value)
  }
});
