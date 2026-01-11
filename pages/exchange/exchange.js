// pages/exchange/exchange.js
const app = getApp();
const { getProducts, getBalance, createExchangeOrder } = require('../../utils/cloud-api.js');

Page({
  data: {
    theme: 'light',
    balance: 0,
    products: [],
    filteredProducts: [],
    categories: [
      { id: 'all', name: '全部' },
      { id: 'coupon', name: '优惠券' },
      { id: 'product', name: '实物商品' },
      { id: 'donation', name: '公益捐赠' }
    ],
    activeCategory: 'all',
    loading: true,
    refreshing: false
  },

  onLoad: function() {
    this.setTheme();
    this.loadExchangeData();
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

  // 加载兑换数据
  loadExchangeData: async function() {
    this.setData({ loading: true });
    
    try {
      // 并行加载余额和商品数据
      const [balanceResult, productsResult] = await Promise.all([
        getBalance(),
        getProducts({ category: 'all', status: 'active' })
      ]);
      
      // 格式化商品数据
      const formattedProducts = productsResult.success ? productsResult.data.map(p => ({
        id: p._id,
        name: p.name,
        description: p.description,
        points: p.points,
        category: p.category,
        stock: p.stock || 0,
        emoji: p.emoji || '🎁',
        gradient: p.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        exchangeCount: p.exchangeCount || 0
      })) : [];
      
      this.setData({
        balance: balanceResult.success ? (balanceResult.data?.points || 0) : 0,
        products: formattedProducts,
        filteredProducts: formattedProducts,
        loading: false,
        refreshing: false
      });
    } catch (error) {
      console.error('加载兑换数据失败:', error);
      wx.showToast({
        title: error.message || '加载失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false, refreshing: false });
    }
  },

  // 更新过滤后的商品列表
  updateFilteredProducts: function() {
    const { products, activeCategory } = this.data;
    
    let filteredProducts = products;
    if (activeCategory !== 'all') {
      filteredProducts = products.filter(product => product.category === activeCategory);
    }
    
    this.setData({ filteredProducts });
  },
  
  // 切换分类
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ activeCategory: category });
    this.updateFilteredProducts();
  },



  // 查看商品详情
  viewProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    // 这里可以跳转到商品详情页
    wx.showToast({
      title: `查看商品ID: ${productId}`,
      icon: 'none'
    });
  },

  // 立即兑换
  exchangeNow: function(e) {
    const product = e.currentTarget.dataset.product;
    const { balance } = this.data;
    
    if (balance < product.points) {
      wx.showToast({
        title: '积分不足，无法兑换',
        icon: 'none'
      });
      return;
    }
    
    // 显示确认兑换弹窗
    wx.showModal({
      title: '确认兑换',
      content: `确定要使用${product.points}积分兑换「${product.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          this.performExchange(product);
        }
      }
    });
  },

  // 执行兑换操作
  performExchange: async function(product) {
    wx.showLoading({
      title: '兑换中...',
    });
    
    try {
      // 调用真实的云函数创建兑换订单
      const response = await createExchangeOrder({
        productId: product.id
      });
      
      if (!response.success) {
        throw new Error(response.message || '兑换失败');
      }
      
      // 兑换成功后，重新加载数据以获取最新余额和库存
      await this.loadExchangeData();
      
      wx.hideLoading();
      
      wx.showToast({
        title: '兑换成功！',
        icon: 'success',
        duration: 2000
      });
      
      // 更新过滤后的商品列表
      this.updateFilteredProducts();
      
      setTimeout(() => {
        wx.showModal({
          title: '兑换成功',
          content: '兑换已完成，您可以在我的订单中查看详情。',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              // 跳转到订单页
              wx.navigateTo({
                url: '/pages/exchange-orders/exchange-orders'
              });
            }
          }
        });
      }, 2000);
    } catch (error) {
      wx.hideLoading();
      console.error('兑换失败:', error);
      
      let errorMsg = error.message || '兑换失败，请重试';
      
      // 根据错误类型显示更友好的提示
      if (errorMsg.includes('余额不足') || errorMsg.includes('积分不足')) {
        errorMsg = '积分不足，无法兑换';
      } else if (errorMsg.includes('库存')) {
        errorMsg = '商品库存不足，请选择其他商品';
      } else if (errorMsg.includes('商品已下架')) {
        errorMsg = '该商品已下架';
      }
      
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({ refreshing: true });
    this.loadExchangeData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});