// pages/wallet/wallet.js
const app = getApp();
const { getTransactions } = require('../../utils/cloud-api.js');
const { cachedRequest, throttle } = require('../../utils/performance.js');

Page({
  data: {
    theme: 'light',
    totalPoints: 0,
    transactions: [],
    transactionList: [],
    isLoading: true,
    isRefreshing: false,
    page: 1,
    hasMore: true,
    tabs: [
      { key: 'income', name: '收入明细' },
      { key: 'expense', name: '支出明细' },
      { key: 'all', name: '全部明细' }
    ],
    activeTab: 'all'
  },

  onLoad: function() {
    this.setTheme();

    // 创建节流函数
    this.throttledLoadMore = throttle(this._loadMore.bind(this), 500);

    this.loadWalletData();
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

  // 格式化单个交易记录
  _formatTransaction: function(t) {
    const emojiMap = {
      income: '💰',
      expense: '💸'
    };
    const gradientMap = {
      income: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
      expense: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)'
    };

    return {
      id: t._id,
      type: t.type,
      amount: t.amount,
      title: t.title,
      description: t.description,
      date: t.createTime ? new Date(t.createTime).toLocaleString() : t.date,
      status: t.status || 'completed',
      emoji: t.emoji || emojiMap[t.type] || '💰',
      gradient: t.gradient || gradientMap[t.type],
      formattedAmount: t.type === 'income' ? `+${t.amount} 积分` : `-${t.amount} 积分`
    };
  },

  // 加载钱包数据
  loadWalletData: async function() {
    this.setData({ isLoading: true });

    try {
      const cacheKey = `transactions:${this.data.activeTab}:page${this.data.page}`;

      // 第一页时使用缓存
      const shouldUseCache = this.data.page === 1 && !this.data.isRefreshing;

      let result;
      if (shouldUseCache) {
        result = await cachedRequest(cacheKey, async () => {
          return await getTransactions({
            page: this.data.page,
            limit: 20,
            type: this.data.activeTab === 'all' ? undefined : this.data.activeTab
          });
        }, { expire: 2 * 60 * 1000 }); // 缓存2分钟
      } else {
        result = await getTransactions({
          page: this.data.page,
          limit: 20,
          type: this.data.activeTab === 'all' ? undefined : this.data.activeTab
        });
      }

      if (result.success) {
        // 优化：使用分批处理避免阻塞
        const batchSize = 10;
        const formattedTransactions = [];
        const transactions = result.transactions || [];

        for (let i = 0; i < transactions.length; i += batchSize) {
          const batch = transactions.slice(i, i + batchSize);
          const formattedBatch = batch.map(t => this._formatTransaction(t));
          formattedTransactions.push(...formattedBatch);

          // 每处理一批后稍微让出主线程
          if (i + batchSize < transactions.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }

        // 合并或替换数据
        const finalTransactions = this.data.page === 1
          ? formattedTransactions
          : [...this.data.transactions, ...formattedTransactions];

        this.setData({
          totalPoints: result.totalPoints,
          transactions: finalTransactions,
          isLoading: false,
          isRefreshing: false,
          hasMore: result.hasMore
        });

        // 更新过滤后的交易
        this.updateTransactionList();
      } else {
        throw new Error(result.message || '获取数据失败');
      }
    } catch (error) {
      console.error('加载钱包数据失败:', error);
      this.setData({ isLoading: false, isRefreshing: false, transactions: [], totalPoints: 0 });
    }
  },

  // 更新过滤后的交易列表
  updateTransactionList: function() {
    const { transactions, activeTab } = this.data;
    let transactionList = transactions;
    
    if (activeTab === 'income') {
      transactionList = transactions.filter(t => t.type === 'income');
    } else if (activeTab === 'expense') {
      transactionList = transactions.filter(t => t.type === 'expense');
    }
    
    this.setData({ transactionList });
  },
  
  // 切换标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab, page: 1, hasMore: true });
    this.loadWalletData();
  },

  // 查看交易详情
  viewTransactionDetail: function(e) {
    const transactionId = e.currentTarget.dataset.id;
    // 这里可以跳转到交易详情页或显示详情弹窗
    wx.showToast({
      title: `查看交易ID: ${transactionId}`,
      icon: 'none'
    });
  },

  // 去兑换页面
  onExchangeTap: function() {
    wx.navigateTo({
      url: '/pages/exchange/exchange'
    });
  },



  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({ isRefreshing: true, page: 1 });
    this.loadWalletData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多（带节流）
  onReachBottom: function() {
    if (!this.data.hasMore || this.data.isLoading) return;

    // 使用节流函数
    this.throttledLoadMore();
  },

  // 实际加载更多（内部方法）
  _loadMore: function() {
    if (!this.data.hasMore || this.data.isLoading) return;

    this.setData({
      page: this.data.page + 1,
      isLoading: true
    });
    this.loadWalletData();
  }
});