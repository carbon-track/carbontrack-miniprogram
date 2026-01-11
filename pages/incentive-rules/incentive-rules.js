// pages/incentive-rules/incentive-rules.js
const app = getApp();

Page({
  data: {
    theme: 'light',
    rules: [
      {
        id: 'daily',
        title: '📅 日常积分规则',
        icon: '✅',
        description: '记录环保行为即可获得积分',
        rules: [
          { activity: '自带杯/餐具', points: 4, unit: '次', color: '#4CAF50' },
          { activity: '使用环保袋', points: 3, unit: '次', color: '#2196F3' },
          { activity: '节约用电', points: 8, unit: '度', color: '#FF9800' },
          { activity: '绿色出行', points: 5, unit: '次', color: '#9C27B0' },
          { activity: '骑行', points: 2, unit: '公里', color: '#E91E63' },
          { activity: '步行', points: 2, unit: '公里', color: '#009688' }
        ]
      },
      {
        id: 'streak',
        title: '🔥 连续参与奖励',
        icon: '🏆',
        description: '坚持打卡，额外奖励积分',
        rules: [
          { days: 3, bonus: 10, title: '连续3天', color: '#FF9800' },
          { days: 7, bonus: 30, title: '连续7天', color: '#2196F3' },
          { days: 15, bonus: 70, title: '连续15天', color: '#9C27B0' },
          { days: 30, bonus: 150, title: '连续30天', color: '#E91E63' }
        ]
      },
      {
        id: 'special',
        title: '🎯 特殊时段双倍',
        icon: '🌟',
        description: '特定日期或时段，积分翻倍',
        rules: [
          { date: '地球日', bonus: '双倍积分', dateStr: '4月22日', color: '#4CAF50' },
          { date: '世界环境日', bonus: '双倍积分', dateStr: '6月5日', color: '#2196F3' },
          { date: '每周三', bonus: '绿色出行双倍', dateStr: '每周三', color: '#FF9800' },
          { date: '无车日', bonus: '双倍积分', dateStr: '9月22日', color: '#9C27B0' }
        ]
      },
      {
        id: 'achievement',
        title: '🏅 成就奖励',
        icon: '🎖️',
        description: '解锁成就，获得额外积分',
        rules: [
          { name: '初次记录', bonus: 20, condition: '首次记录碳足迹', color: '#4CAF50' },
          { name: '低碳达人', bonus: 50, condition: '累计减少10kg碳排放', color: '#2196F3' },
          { name: '兑换新手', bonus: 20, condition: '首次兑换商品', color: '#FF9800' }
        ]
      },
      {
        id: 'social',
        title: '👥 社交激励',
        icon: '👏',
        description: '邀请好友，共同成长',
        rules: [
          { action: '邀请好友', bonus: 30, condition: '好友注册并记录', color: '#4CAF50' },
          { action: '组队打卡', bonus: 50, condition: '组队完成7天挑战', color: '#E91E63' },
          { action: '排行榜', bonus: 100, condition: '进入月度排行榜前10', color: '#9C27B0' }
        ]
      }
    ]
  },

  onLoad: function() {
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

  // 返回上一页
  onBack: function() {
    wx.navigateBack({ delta: 1 });
  }
});
