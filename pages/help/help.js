// pages/help/help.js
const app = getApp();
const { get, post } = require('../../utils/api.js');

Page({
  data: {
    theme: 'light',
    faqItems: [],
    filteredFaqItems: [],
    feedbackContent: '',
    feedbackType: 'question',
    contactInfo: '',
    loading: true,
    submitting: false,
    showFeedback: false,
    categories: [
      { id: 'all', name: '全部' },
      { id: 'account', name: '账号问题' },
      { id: 'app', name: '应用使用' },
      { id: 'activity', name: '活动相关' },
      { id: 'other', name: '其他问题' }
    ],
    activeCategory: 'all'
  },

  onLoad: function() {
    this.setTheme();
    this.loadFaqList();
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

  // 加载常见问题列表
  loadFaqList: async function() {
    this.setData({ loading: true });
    
    try {
      const { getFaq } = require('../../utils/cloud-api.js');
      const result = await getFaq();
      
      if (result.success && result.data.length > 0) {
        const faqItems = result.data.map(item => ({
          id: item._id,
          question: item.question,
          answer: item.answer,
          category: item.category,
          expand: false
        }));
        
        this.setData({
          faqItems,
          filteredFaqItems: faqItems,
          loading: false
        });
      } else {
        // 如果数据库没有数据，使用默认FAQ数据
        const mockFaqItems = [
          {
            id: 1,
            question: '如何注册CarbonTrack账号？',
            answer: '您可以使用手机号或者微信账号快速注册CarbonTrack。点击登录页面的"立即注册"按钮，按照提示完成注册流程即可。',
            category: 'account',
            expand: false
          },
          {
            id: 2,
            question: '如何记录我的环保活动？',
            answer: '在首页点击"+"按钮，选择您要记录的环保活动类型，填写相关信息并保存。系统会自动计算您减少的碳排放量。',
            category: 'activity',
            expand: false
          },
          {
            id: 3,
            question: '积分有什么用？如何获取积分？',
            answer: '积分可以在兑换中心兑换优惠券、环保商品或进行公益捐赠。您可以通过参与环保活动、邀请好友、每日打卡等方式获取积分。',
            category: 'app',
            expand: false
          },
          {
            id: 4,
            question: '如何修改个人资料？',
            answer: '进入"我的"页面，点击个人头像或昵称进入个人资料页面，您可以修改头像、昵称、性别等个人信息。',
            category: 'account',
            expand: false
          },
          {
            id: 5,
            question: '如何邀请好友加入？',
            answer: '在"我的"页面找到"邀请好友"入口，生成您的专属邀请码或分享链接，分享给好友即可。好友通过您的邀请注册并完成首次活动，您将获得额外积分奖励。',
            category: 'app',
            expand: false
          }
        ];
        
        this.setData({
          faqItems: mockFaqItems,
          filteredFaqItems: mockFaqItems,
          loading: false
        });
      }
    } catch (error) {
      console.error('加载常见问题失败:', error);
      this.setData({ loading: false });
    }
  },

  // 更新过滤后的FAQ列表
  updateFilteredFaq: function() {
    const { faqItems, activeCategory } = this.data;
    
    let filteredFaqItems = faqItems;
    if (activeCategory !== 'all') {
      filteredFaqItems = faqItems.filter(item => item.category === activeCategory);
    }
    
    this.setData({ filteredFaqItems });
  },
  
  // 切换分类
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ activeCategory: category });
    this.updateFilteredFaq();
  },

  // 展开/收起FAQ
  toggleFaqItem: function(e) {
    const id = e.currentTarget.dataset.id;
    const faqItems = this.data.faqItems.map(item => {
      if (item.id === id) {
        return { ...item, expand: !item.expand };
      }
      return item;
    });
    
    this.setData({ faqItems });
    this.updateFilteredFaq();
  },

  // 显示反馈表单
  showFeedbackForm: function() {
    this.setData({ showFeedback: true });
  },

  // 隐藏反馈表单
  hideFeedbackForm: function() {
    this.setData({ showFeedback: false });
  },

  // 输入反馈内容
  inputFeedback: function(e) {
    this.setData({ feedbackContent: e.detail.value });
  },

  // 输入联系方式
  inputContact: function(e) {
    this.setData({ contactInfo: e.detail.value });
  },

  // 选择反馈类型
  selectFeedbackType: function(e) {
    this.setData({ feedbackType: e.detail.value });
  },

  // 提交反馈
  submitFeedback: async function() {
    const { feedbackContent, feedbackType, contactInfo } = this.data;
    
    if (!feedbackContent.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      });
      return;
    }
    
    if (feedbackContent.length < 10) {
      wx.showToast({
        title: '反馈内容至少需要10个字符',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ submitting: true });
    
    try {
      // 模拟提交反馈
      // 实际项目中应该调用后端API
      /*
      const response = await post('/api/help/feedback', {
        content: feedbackContent,
        type: feedbackType,
        contact: contactInfo
      });
      */
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      wx.hideLoading();
      
      wx.showToast({
        title: '感谢您的反馈！',
        icon: 'success',
        duration: 2000
      });
      
      // 重置表单并隐藏
      this.setData({
        feedbackContent: '',
        feedbackType: 'question',
        contactInfo: '',
        showFeedback: false,
        submitting: false
      });
    } catch (error) {
      console.error('提交反馈失败:', error);
      wx.showToast({
        title: error.message || '提交失败，请重试',
        icon: 'none'
      });
      this.setData({ submitting: false });
    }
  },



  // 联系客服
  contactSupport: function() {
    wx.showModal({
      title: '联系客服',
      content: '您可以通过以下方式联系我们：\n- 邮箱：support@carbontrack.com\n- 客服电话：400-123-4567\n- 工作时间：周一至周五 9:00-18:00',
      showCancel: false
    });
  }
});