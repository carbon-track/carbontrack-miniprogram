// pages/webview/webview.js
const app = getApp();

Page({
  data: {
    theme: 'light',
    url: '',
    title: '网页',
    loading: true,
    error: false,
    errorMsg: '加载失败，请重试'
  },

  onLoad: function(options) {
    // 获取URL参数
    const url = options && options.url ? decodeURIComponent(options.url) : '';
    const title = options && options.title ? options.title : '网页';
    
    if (url) {
      // 验证URL格式
      if (this.isValidUrl(url)) {
        this.setData({ url, title });
        // 设置页面标题
        wx.setNavigationBarTitle({
          title: title
        });
      } else {
        this.setData({ error: true, errorMsg: '无效的链接地址' });
      }
    } else {
      this.setData({ error: true, errorMsg: '未指定链接地址' });
    }
    
    this.setTheme();
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

  // 验证URL格式
  isValidUrl: function(url) {
    try {
      // 尝试解析URL
      const urlObj = new URL(url);
      // 只允许http和https协议
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  },

  // 网页加载开始
  onWebviewLoadStart: function() {
    this.setData({ loading: true, error: false });
  },

  // 网页加载完成
  onWebviewLoadEnd: function() {
    this.setData({ loading: false });
  },

  // 网页加载错误
  onWebviewLoadError: function(e) {
    console.error('网页加载错误:', e);
    this.setData({ 
      loading: false, 
      error: true,
      errorMsg: '网页加载失败，请检查网络连接后重试' 
    });
  },

  // 刷新页面
  refreshPage: function() {
    this.setData({ loading: true, error: false });
    // 重新加载web-view组件
    const webViewContext = wx.createWebViewContext('webview');
    webViewContext.reload();
  },

  // 处理web-view的消息
  onWebviewMessage: function(e) {
    console.log('收到web-view消息:', e.detail.data);
    // 这里可以处理来自web-view的消息
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 分享当前网页
  onShareAppMessage: function() {
    return {
      title: this.data.title,
      path: `/pages/webview/webview?url=${encodeURIComponent(this.data.url)}&title=${encodeURIComponent(this.data.title)}`
    };
  },

  // 关闭页面
  closePage: function() {
    wx.navigateBack();
  }
});