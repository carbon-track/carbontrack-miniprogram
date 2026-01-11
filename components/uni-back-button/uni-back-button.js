Component({
  properties: {
    // 页面标题（可选）
    title: {
      type: String,
      value: ''
    },
    // 主题
    theme: {
      type: String,
      value: 'light'
    }
  },

  methods: {
    // 返回上一页
    onBack: function() {
      wx.navigateBack({
        delta: 1
      });
    }
  }
});
