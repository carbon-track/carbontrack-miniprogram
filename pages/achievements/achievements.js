// pages/achievements/achievements.js
const app = getApp();
const { getAchievements } = require('../../utils/cloud-api.js');

Page({
  data: {
    theme: 'light',
    achievements: [],
    filteredAchievements: [],
    isLoading: true,
    tabs: [
      { key: 'all', name: '全部' },
      { key: 'unlocked', name: '已获得' },
      { key: 'locked', name: '未获得' }
    ],
    activeTab: 'all',
    unlockedCount: 0,
    totalPoints: 0
  },

  onLoad: function() {
    this.setTheme();
    this.loadAchievements();
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

  // 计算已解锁成就数量和总积分
  calculateStats: function(achievements) {
    const unlockedCount = achievements.filter(item => item.unlocked).length;
    const totalPoints = achievements.reduce((sum, item) => {
      return sum + (item.unlocked ? item.points : 0);
    }, 0);
    
    return { unlockedCount, totalPoints };
  },
  

  
  // 更新过滤后的成就和统计数据
  updateDisplayData: function() {
    const { achievements, activeTab } = this.data;
    const { unlockedCount, totalPoints } = this.calculateStats(achievements);
    
    // 根据当前标签过滤成就
    let filteredAchievements = achievements;
    if (activeTab === 'unlocked') {
      filteredAchievements = achievements.filter(item => item.unlocked);
    } else if (activeTab === 'locked') {
      filteredAchievements = achievements.filter(item => !item.unlocked);
    }
    
    this.setData({
      unlockedCount,
      totalPoints,
      filteredAchievements
    });
  },
  
  // 加载成就列表
  loadAchievements: async function() {
    this.setData({ isLoading: true });

    try {
      const result = await getAchievements();

      if (result.success) {
        // 转换数据格式
        const formattedAchievements = result.data.map(achievement => {
          // 根据积分设置稀有度
          let rarity = 'common';
          if (achievement.points >= 500) rarity = 'legendary';
          else if (achievement.points >= 300) rarity = 'epic';
          else if (achievement.points >= 200) rarity = 'rare';
          else if (achievement.points >= 100) rarity = 'uncommon';

          // 根据稀有度设置渐变色
          const gradientMap = {
            common: 'linear-gradient(135deg, #9CA3AF, #D1D5DB)',
            uncommon: 'linear-gradient(135deg, #34C759, #4CAF50)',
            rare: 'linear-gradient(135deg, #4285F4, #2196F3)',
            epic: 'linear-gradient(135deg, #8E24AA, #7B1FA2)',
            legendary: 'linear-gradient(135deg, #FFD700, #FFA500)'
          };

          // 根据分类设置 emoji
          const emojiMap = {
            carbon: '🌱',
            login: '📅',
            points: '💰'
          };

          return {
            id: achievement._id,
            name: achievement.name,
            description: achievement.description,
            points: achievement.points,
            unlocked: achievement.unlocked,
            date: achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : null,
            emoji: achievement.icon || emojiMap[achievement.category] || '🏆',
            gradient: gradientMap[rarity],
            rarity,
            condition: achievement.condition
          };
        });

        this.setData({
          achievements: formattedAchievements,
          isLoading: false
        });

        // 更新显示数据
        this.updateDisplayData();
      } else {
        throw new Error(result.error || '获取成就失败');
      }
    } catch (error) {
      console.error('加载成就失败:', error);
      this.setData({ isLoading: false });
    }
  },

  // 切换标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.updateDisplayData();
  },

  // 获取筛选后的成就列表
  getFilteredAchievements: function() {
    const { achievements, activeTab } = this.data;
    
    if (activeTab === 'all') {
      return achievements;
    } else if (activeTab === 'unlocked') {
      return achievements.filter(a => a.unlocked);
    } else if (activeTab === 'locked') {
      return achievements.filter(a => !a.unlocked);
    }
    
    return achievements;
  },

  // 获取成就等级样式
  getRarityClass: function(rarity) {
    const rarityMap = {
      common: 'common',
      uncommon: 'uncommon',
      rare: 'rare',
      epic: 'epic',
      legendary: 'legendary'
    };
    
    return rarityMap[rarity] || 'common';
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({ isLoading: true });
    this.loadAchievements().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});