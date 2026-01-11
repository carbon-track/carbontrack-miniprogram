// pages/calculate/calculate.js
const app = getApp();
const { requireAuth } = require('../../utils/auth.js');
const { saveCarbonRecord, getCarbonRules, getActivities } = require('../../utils/cloud-api.js');
const { debounce, cachedRequest } = require('../../utils/performance.js');
const {
  calculateCarbonSavings,
  calculatePoints,
  getAllActivityTypes,
  getActivityTypeById,
  searchActivities
} = require('../../utils/carbon-calculator.js');

Page({
  data: {
    theme: 'light',
    activityTypes: [], // 所有活动类型
    filteredActivities: [], // 过滤后的活动类型
    selectedActivity: null, // 选中的活动
    searchQuery: '', // 搜索关键词
    amount: '', // 活动数量
    date: '', // 活动日期
    description: '', // 活动描述
    imageUrl: '', // 上传的图片路径
    showImagePickerModal: false, // 是否显示图片选择弹窗
    showCalendar: false, // 是否显示日历选择器
    carbonResult: 0, // 碳减排结果
    pointsResult: 0, // 积分结果
    loading: false, // 加载状态
    submitting: false, // 提交状态
    searchFocus: false // 搜索框焦点状态
  },

  onLoad: function() {
    // 获取主题设置
    this.setTheme();

    // 创建防抖函数
    this.debouncedSearch = debounce(this._performSearch.bind(this), 300);
    this.debouncedCalculate = debounce(this.calculateResults.bind(this), 300);

    // 加载活动类型
    this.loadActivityTypes();

    // 设置默认日期为今天
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    this.setData({ date: formattedDate });
  },

  // 返回上一页
  onBack: function() {
    wx.navigateBack({
      delta: 1
    });
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

  // 加载活动类型
  loadActivityTypes: async function() {
    try {
      // 使用缓存加载活动类型和碳核算规则
      const [activitiesResult, carbonRulesResult] = await Promise.all([
        cachedRequest('activities:active', async () => {
          return await getActivities({ status: 'active' });
        }, { expire: 60 * 60 * 1000 }), // 缓存1小时
        cachedRequest('carbonRules:active', async () => {
          return await getCarbonRules({ status: 'active' });
        }, { expire: 60 * 60 * 1000 }) // 缓存1小时
      ]);
      
      let activityTypes = [];
      
      if (activitiesResult.success && activitiesResult.data.length > 0) {
        activityTypes = activitiesResult.data.map(activity => {
          // 查找对应的碳核算规则
          const carbonRule = carbonRulesResult.success ? 
            carbonRulesResult.data.find(rule => rule.name === activity.name) : null;
          
          return {
            id: activity._id,
            name: activity.name,
            unit: activity.unit,
            emoji: activity.emoji || '🌱',
            gradient: activity.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            carbonFactor: carbonRule ? carbonRule.carbonFactor : 0, // 碳核算系数（kg/单位）
            pointsFactor: carbonRule ? (carbonRule.pointsFactor || 10) : 10 // 积分系数（积分/kg）
          };
        });
      } else {
        // 如果数据库没有活动数据，使用默认数据
        activityTypes = [
          { id: 1, name: '步行', unit: '公里', emoji: '🚶', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', carbonFactor: 0.15, pointsFactor: 10 },
          { id: 2, name: '骑行', unit: '公里', emoji: '🚴', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', carbonFactor: 0.21, pointsFactor: 10 },
          { id: 3, name: '公共交通', unit: '公里', emoji: '🚌', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', carbonFactor: 0.15, pointsFactor: 10 },
          { id: 4, name: '节约用水', unit: '升', emoji: '💧', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', carbonFactor: 0.019, pointsFactor: 10 },
          { id: 5, name: '节约用电', unit: '度', emoji: '💡', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', carbonFactor: 0.785, pointsFactor: 10 },
          { id: 6, name: '自带杯/餐具', unit: '次', emoji: '♻️', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', carbonFactor: 0.05, pointsFactor: 80 },
          { id: 7, name: '使用环保袋', unit: '次', emoji: '🛍️', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', carbonFactor: 0.03, pointsFactor: 100 }
        ];
      }
      
      this.setData({
        activityTypes,
        filteredActivities: activityTypes
      });
    } catch (error) {
      console.error('加载活动类型失败:', error);
      // 加载失败时使用默认数据
      const defaultActivityTypes = [
        { id: 1, name: '步行', unit: '公里', emoji: '🚶', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', carbonFactor: 0.15, pointsFactor: 10 },
        { id: 2, name: '骑行', unit: '公里', emoji: '🚴', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', carbonFactor: 0.21, pointsFactor: 10 },
        { id: 3, name: '公共交通', unit: '公里', emoji: '🚌', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', carbonFactor: 0.15, pointsFactor: 10 },
        { id: 4, name: '节约用水', unit: '升', emoji: '💧', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', carbonFactor: 0.019, pointsFactor: 10 },
        { id: 5, name: '节约用电', unit: '度', emoji: '💡', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', carbonFactor: 0.785, pointsFactor: 10 },
        { id: 6, name: '自带杯/餐具', unit: '次', emoji: '♻️', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', carbonFactor: 0.05, pointsFactor: 80 },
        { id: 7, name: '使用环保袋', unit: '次', emoji: '🛍️', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', carbonFactor: 0.03, pointsFactor: 100 }
      ];
      
      this.setData({
        activityTypes: defaultActivityTypes,
        filteredActivities: defaultActivityTypes
      });
    }
  },

  // 搜索活动（带防抖）
  onSearch: function(e) {
    const query = e.detail.value || '';
    this.setData({ searchQuery: query });

    // 使用防抖函数执行搜索
    this.debouncedSearch(query);
  },

  // 实际执行搜索（内部方法）
  _performSearch: function(query) {
    const filtered = this.data.activityTypes.filter(activity =>
      activity.name.toLowerCase().includes(query.toLowerCase())
    );
    this.setData({ filteredActivities: filtered });
  },

  // 选择活动
  selectActivity: function(e) {
    const activityId = e.currentTarget.dataset.id;
    const activity = this.data.activityTypes.find(a => a.id === activityId);
    
    this.setData({
      selectedActivity: activity,
      searchQuery: '',
      searchFocus: false
    });
  },

  // 清除选择的活动
  clearActivitySelection: function() {
    this.setData({
      selectedActivity: null,
      amount: '',
      carbonResult: 0,
      pointsResult: 0
    });
  },

  // 输入数量变化（带防抖）
  onAmountChange: function(e) {
    const amount = e.detail.value;
    this.setData({ amount });

    // 使用防抖函数执行计算
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      this.debouncedCalculate(amount);
    } else {
      // 清空时立即清零
      this.setData({
        carbonResult: 0,
        pointsResult: 0
      });
    }
  },

  // 显示日历选择器
  showCalendarPicker: function() {
    this.setData({ showCalendar: true });
  },

  // 日历日期选择回调
  onCalendarChange: function(e) {
    const selectedDate = e.detail.value;
    this.setData({ date: selectedDate });
  },

  // 关闭日历选择器
  onCalendarClose: function() {
    this.setData({ showCalendar: false });
  },

  // 日期变化（兼容其他组件可能调用的方法）
  onDateChange: function(e) {
    this.setData({
      date: e.detail.value
    });
  },

  // 描述变化
  onDescriptionChange: function(e) {
    this.setData({
      description: e.detail.value
    });
  },

  // 计算结果
  calculateResults: function(amount) {
    const { selectedActivity } = this.data;
    
    if (!selectedActivity || !amount || isNaN(amount) || amount <= 0) {
      this.setData({
        carbonResult: 0,
        pointsResult: 0
      });
      return;
    }
    
    try {
      // 使用真实的碳核算系数进行计算
      const carbonFactor = selectedActivity.carbonFactor || 0;
      const pointsFactor = selectedActivity.pointsFactor || 10;
      
      const carbon = parseFloat(amount) * carbonFactor;
      const points = Math.round(carbon * pointsFactor);
      
      this.setData({
        carbonResult: carbon.toFixed(2),
        pointsResult: points
      });
    } catch (error) {
      console.error('计算错误:', error);
      wx.showToast({
        title: '计算错误，请重试',
        icon: 'none'
      });
    }
  },

  // 显示图片选择弹窗
  showImagePickerModal: function() {
    this.setData({ showImagePickerModal: true });
  },

  // 隐藏图片选择弹窗
  hideImagePickerModal: function() {
    this.setData({ showImagePickerModal: false });
  },

  // 从相册选择图片
  chooseImageFromAlbum: function() {
    this.chooseImage('album');
  },

  // 拍照
  chooseImageFromCamera: function() {
    this.chooseImage('camera');
  },

  // 选择图片
  chooseImage: function(sourceType) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [sourceType],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          imageUrl: tempFilePath,
          showImagePickerModal: false
        });
      },
      fail: () => {
        this.setData({ showImagePickerModal: false });
      }
    });
  },

  // 删除图片
  deleteImage: function() {
    this.setData({ imageUrl: '' });
  },

  // 验证表单
  validateForm: function() {
    const { selectedActivity, amount, date } = this.data;
    
    if (!selectedActivity) {
      wx.showToast({
        title: '请选择环保活动',
        icon: 'none'
      });
      return false;
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      wx.showToast({
        title: '请输入有效的数量',
        icon: 'none'
      });
      return false;
    }
    
    if (!date) {
      wx.showToast({
        title: '请选择活动日期',
        icon: 'none'
      });
      return false;
    }
    
    // 日期验证已由日历选择器组件内部处理，无需重复验证
    return true;
  },

  // 提交活动记录
  submitActivity: async function() {
    if (!this.validateForm()) return;

    // 检查登录状态
    const { isLoggedIn } = require('../../utils/auth.js');
    const loggedIn = isLoggedIn();

    if (!loggedIn) {
      wx.showModal({
        title: '提示',
        content: '登录后可以保存您的活动记录并获得积分奖励，是否去登录？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }

    this.setData({ submitting: true });

    try {
      const { selectedActivity, amount, date, description, imageUrl, carbonResult, pointsResult } = this.data;

      // 上传图片到云存储（如果有）
      let cloudImageUrl = '';
      if (imageUrl) {
        try {
          const uploadResult = await wx.cloud.uploadFile({
            cloudPath: `activity-images/${Date.now()}.jpg`,
            filePath: imageUrl
          });
          cloudImageUrl = uploadResult.fileID;
        } catch (error) {
          console.error('图片上传失败:', error);
          // 图片上传失败不影响主流程
        }
      }

      // 调用云函数保存记录
      const result = await saveCarbonRecord({
        activityType: selectedActivity.name,
        activityDetail: selectedActivity.emoji + ' ' + selectedActivity.name,
        carbonValue: carbonResult,
        points: pointsResult,
        date,
        description: description || '',
        imageUrl: cloudImageUrl
      });

      if (result.success) {
        // 显示记录成功
        wx.showToast({
          title: '记录成功！',
          icon: 'success',
          duration: 1500
        });

        // 检查并发放激励奖励
        try {
          const incentiveResult = await checkIncentiveBonus();
          
          if (incentiveResult.success && incentiveResult.data) {
            const { consecutiveDays, streakBonus, specialBonus, bonusDetails } = incentiveResult.data;
            
            // 如果有连续打卡奖励，显示提示
            if (streakBonus > 0) {
              setTimeout(() => {
                wx.showModal({
                  title: '🎉 连续打卡奖励',
                  content: `恭喜您连续打卡 ${consecutiveDays} 天！\n获得额外积分奖励：+${streakBonus} 积分`,
                  showCancel: false,
                  confirmText: '太棒了'
                });
              }, 1600);
            }
            
            // 如果是特殊时段，显示提示
            if (specialBonus.isSpecial) {
              setTimeout(() => {
                wx.showToast({
                  title: specialBonus.description,
                  icon: 'none',
                  duration: 3000
                });
              }, 1800);
            }
          }
        } catch (error) {
          console.error('检查激励奖励失败:', error);
          // 激励奖励失败不影响主流程
        }

        // 更新全局用户数据
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          totalCarbon: result.totalCarbon,
          points: result.points
        };
        wx.setStorageSync('userInfo', app.globalData.userInfo);

        // 重置表单
        this.setData({
          selectedActivity: null,
          amount: '',
          description: '',
          imageUrl: '',
          carbonResult: 0,
          pointsResult: 0
        });

        // 跳转到个人中心
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/center/center'
          });
        }, 2500);
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      wx.showToast({
        title: error.message || '提交失败，请稍后重试',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});