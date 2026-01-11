// pages/wallet/wallet.js
const app = getApp();
const { getTransactions } = require('../../utils/cloud-api.js');

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

  // 加载钱包数据
  loadWalletData: async function() {
    this.setData({ isLoading: true });

    try {
      // 调用云函数获取交易记录
      const result = await getTransactions({
        page: this.data.page,
        limit: 20,
        type: this.data.activeTab === 'all' ? undefined : this.data.activeTab
      });

      if (result.success) {
        // 转换数据格式
        const formattedTransactions = result.transactions.map(t => {
          // 根据类型设置 emoji 和渐变色
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
        });

        this.setData({
          totalPoints: result.totalPoints,
          transactions: formattedTransactions,
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
    this.setData({ activeTab: tab });
    this.updateTransactionList();
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

  // 上拉加载更多
  onReachBottom: function() {
    if (!this.data.hasMore || this.data.isLoading) return;

    this.setData({
      page: this.data.page + 1,
      isLoading: true
    });
    this.loadWalletData();
  },

  // 切换标签时重新加载
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab, page: 1, hasMore: true });
    this.loadWalletData();
  }
});