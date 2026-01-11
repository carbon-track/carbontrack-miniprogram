// pages/agreement/agreement.js
const app = getApp();

Page({
  data: {
    theme: 'light',
    type: 'user', // 'user' 或 'privacy'
    title: '用户协议',
    content: '',
    loading: true,
    lastUpdated: '2025-01-01',
    scrollToView: '',
    showScrollTop: false
  },

  onLoad: function(options) {
    // 设置协议类型（用户协议或隐私政策）
    const type = options && options.type ? options.type : 'user';
    const title = type === 'user' ? '用户协议' : '隐私政策';
    
    this.setData({ type, title });
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: title
    });
    
    this.setTheme();
    this.loadAgreementContent();
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

  // 加载协议内容
  loadAgreementContent: async function() {
    this.setData({ loading: true });
    
    try {
      // 模拟加载协议内容
      // 实际项目中应该调用后端API获取协议内容
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 根据类型加载不同的协议内容
      let content = '';
      
      if (this.data.type === 'user') {
        content = this.getUserAgreement();
      } else {
        content = this.getPrivacyPolicy();
      }
      
      this.setData({
        content: content,
        loading: false
      });
    } catch (error) {
      console.error('加载协议内容失败:', error);
      wx.showToast({
        title: error.message || '加载失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 获取用户协议内容
  getUserAgreement: function() {
    return `
      <h2>CarbonTrack 用户协议</h2>
      <p>更新日期：2025年1月1日</p>
      <h3>1. 协议的接受</h3>
      <p>欢迎使用 CarbonTrack 应用。通过访问或使用本应用，您同意接受本用户协议的条款和条件（"协议"）。如果您不同意本协议的任何部分，您应立即停止使用本应用。</p>
      
      <h3>2. 账户创建与使用</h3>
      <p>2.1 您必须年满13周岁才能使用本应用。</p>
      <p>2.2 在注册账户时，您必须提供准确、真实、完整的个人资料信息。</p>
      <p>2.3 您负责维护账户密码的安全性，并对您账户下的所有活动负责。</p>
      <p>2.4 如果发现任何未经授权使用您账户的情况，请立即通知我们。</p>
      
      <h3>3. 服务内容</h3>
      <p>CarbonTrack 提供以下服务：</p>
      <p>3.1 碳足迹记录与计算</p>
      <p>3.2 环保活动记录与跟踪</p>
      <p>3.3 环保成就与积分系统</p>
      <p>3.4 环保知识分享与社区交流</p>
      <p>3.5 积分兑换商城</p>
      
      <h3>4. 用户行为规范</h3>
      <p>4.1 您同意不会以任何非法方式使用本应用。</p>
      <p>4.2 您不得上传、发布、传播任何违法、违规、侵权、色情、暴力等内容。</p>
      <p>4.3 您不得干扰、破坏本应用的正常运行。</p>
      <p>4.4 您不得未经授权访问或尝试访问本应用的其他系统或账户。</p>
      
      <h3>5. 知识产权</h3>
      <p>5.1 CarbonTrack 拥有本应用的所有知识产权，包括但不限于商标、著作权、专利等。</p>
      <p>5.2 未经我们书面许可，您不得以任何形式复制、修改、分发、出售本应用的任何部分。</p>
      <p>5.3 用户在本应用上传的内容，用户保留其知识产权，但授予我们永久、不可撤销的使用权。</p>
      
      <h3>6. 隐私保护</h3>
      <p>我们重视您的隐私，详情请参阅我们的《隐私政策》。</p>
      
      <h3>7. 免责声明</h3>
      <p>7.1 本应用提供的信息仅供参考，不构成任何建议或保证。</p>
      <p>7.2 我们不对本应用内容的准确性、完整性、可靠性做出任何承诺。</p>
      <p>7.3 因使用本应用而产生的任何损失，我们不承担责任，除非是由于我们的故意或重大过失造成的。</p>
      
      <h3>8. 协议修改</h3>
      <p>我们有权随时修改本协议。修改后的协议将在应用内公布，并于公布之日起生效。继续使用本应用即视为接受修改后的协议。</p>
      
      <h3>9. 服务终止</h3>
      <p>9.1 您可以随时停止使用本应用。</p>
      <p>9.2 如您违反本协议，我们有权终止您的账户及服务。</p>
      <p>9.3 我们有权在必要时暂停或终止部分或全部服务。</p>
      
      <h3>10. 法律适用</h3>
      <p>本协议的解释、效力及纠纷的解决，适用于中华人民共和国大陆地区法律。如有争议，应提交本公司所在地有管辖权的人民法院诉讼解决。</p>
      
      <h3>11. 联系方式</h3>
      <p>如有任何问题或建议，请联系我们：contact@carbontrackapp.com</p>
    `;
  },

  // 获取隐私政策内容
  getPrivacyPolicy: function() {
    return `
      <h2>CarbonTrack 隐私政策</h2>
      <p>更新日期：2025年1月1日</p>
      <h3>1. 隐私政策的接受</h3>
      <p>欢迎使用 CarbonTrack 应用。我们重视您的隐私，并致力于保护您的个人信息。本隐私政策描述了我们如何收集、使用、存储和共享您的信息。通过访问或使用本应用，您同意我们按照本隐私政策处理您的信息。</p>
      
      <h3>2. 我们收集的信息</h3>
      <p>2.1 您提供的信息：当您注册账户、使用我们的服务时，您可能需要提供个人信息，如姓名、电子邮件地址、手机号码、微信账号等。</p>
      <p>2.2 自动收集的信息：我们可能自动收集有关您使用本应用的信息，包括但不限于设备信息、日志信息、位置信息（如果您允许）、使用情况数据等。</p>
      <p>2.3 环保活动数据：您记录的环保活动数据，如步行里程、骑行距离、节约能源等。</p>
      
      <h3>3. 我们如何使用收集的信息</h3>
      <p>3.1 提供、维护和改进我们的服务</p>
      <p>3.2 计算您的碳足迹和环保贡献</p>
      <p>3.3 向您发送通知和更新</p>
      <p>3.4 个性化您的用户体验</p>
      <p>3.5 预防欺诈和滥用</p>
      <p>3.6 遵守法律义务</p>
      
      <h3>4. 信息共享与披露</h3>
      <p>4.1 我们不会出售您的个人信息。</p>
      <p>4.2 我们可能在以下情况下共享您的信息：</p>
      <p>4.2.1 获得您的明确同意后</p>
      <p>4.2.2 与我们的服务提供商和合作伙伴共享，用于提供和改进服务</p>
      <p>4.2.3 遵守法律要求或政府请求</p>
      <p>4.2.4 保护我们的权利、财产或安全，以及用户或公众的权利、财产或安全</p>
      
      <h3>5. 数据安全</h3>
      <p>我们采取合理的安全措施来保护您的个人信息，防止未授权访问、披露、使用、修改或销毁。但请注意，没有任何安全措施是完全安全的，我们不能保证您信息的绝对安全。</p>
      
      <h3>6. 数据存储</h3>
      <p>我们将您的信息存储在中华人民共和国境内的服务器上，可能会存储在我们在全球拥有或维护的服务器上。</p>
      
      <h3>7. 您的权利</h3>
      <p>根据适用法律，您可能有权访问、更正、删除或限制我们对您个人信息的处理，以及有权接收或传输您的个人数据。如需行使这些权利，请联系我们。</p>
      
      <h3>8. 第三方服务</h3>
      <p>本应用可能包含第三方服务的链接或集成。我们不对第三方的隐私实践负责，建议您查看这些第三方的隐私政策。</p>
      
      <h3>9. 未成年人保护</h3>
      <p>我们非常重视未成年人的隐私保护。我们不会有意收集13周岁以下儿童的个人信息。如果您是未成年人，请在父母或监护人的指导下使用本应用。</p>
      
      <h3>10. 隐私政策更新</h3>
      <p>我们可能会不时更新本隐私政策。更新后的隐私政策将在应用内公布，并于公布之日起生效。我们鼓励您定期查看本隐私政策。</p>
      
      <h3>11. 联系方式</h3>
      <p>如有任何关于本隐私政策的问题或建议，请联系我们：privacy@carbontrackapp.com</p>
    `;
  },

  // 回到顶部
  scrollToTop: function() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  // 滚动到指定位置
  onScroll: function(e) {
    const scrollTop = e.detail.scrollTop;
    // 当滚动超过300rpx时显示回到顶部按钮
    this.setData({
      showScrollTop: scrollTop > 300
    });
  },

  // 滚动到底部
  onScrollToLower: function() {
    // 可以在这里实现加载更多逻辑
  }
});