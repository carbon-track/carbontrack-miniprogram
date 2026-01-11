// pages/store/store.js
const app = getApp();
const { getProducts } = require('../../utils/cloud-api.js');

Page({
  data: {
    theme: 'light',
    products: [],
    loading: true,
    page: 1,
    hasMore: true,
    categories: ['全部', '环保产品', '优惠券', '实物奖品', '数字商品'],
    activeCategory: 0
  },

  onLoad: function() {
    this.setTheme();
    this.loadProducts();
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

  // 加载商品列表
  loadProducts: async function() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const category = this.data.activeCategory === 0 ? 'all' : 
        this.data.categories[this.data.activeCategory];
      
      const result = await getProducts({
        category,
        page: this.data.page,
        limit: 20
      });
      
      if (result.success) {
        const newProducts = [...this.data.products, ...result.data];
        
        this.setData({
          products: newProducts,
          loading: false,
          page: this.data.page + 1,
          hasMore: result.data.length >= 20
        });
      } else {
        throw new Error(result.error || '加载商品失败');
      }
    } catch (error) {
      console.error('加载商品失败:', error);
      wx.showToast({
        title: error.message || '加载失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 切换商品分类
  switchCategory: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeCategory: index,
      products: [],
      page: 1,
      hasMore: true
    });
    this.loadProducts();
  },

  // 查看商品详情
  viewProduct: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/store/product?id=${productId}`
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      products: [],
      page: 1,
      hasMore: true
    });
    this.loadProducts().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom: function() {
    this.loadProducts();
  }
});