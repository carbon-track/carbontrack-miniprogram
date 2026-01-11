// pages/about/about.js
const app = getApp();

Page({
  data: {
    theme: 'light',
    isLoading: false,
    appName: 'CarbonTrack',
    appVersion: '1.0.0',
    slogan: '让每一次环保行动都有价值',
    description: 'CarbonTrack是一款专注于碳足迹记录与环保行动激励的移动应用。通过记录您的日常环保行为，如步行、骑行、节约用水用电等，帮助您了解自己的碳减排贡献，激励您持续参与环保行动，共同为地球的可持续发展贡献力量。',
    features: [
      {
        icon: '📱',
        title: '简便记录',
        desc: '轻松记录各类环保活动，实时计算碳减排量'
      },
      {
        icon: '🏆',
        title: '成就激励',
        desc: '解锁成就徽章，获取积分奖励，保持环保热情'
      },
      {
        icon: '📊',
        title: '数据统计',
        desc: '直观查看个人环保数据，了解减排成效'
      },
      {
        icon: '🎁',
        title: '积分兑换',
        desc: '累积环保积分，兑换精美环保商品'
      }
    ],
    contactInfo: {
      website: 'https://www.carbontrackapp.com',
      email: 'contact@carbontrackapp.com',
      phone: '400-123-4567'
    },
    socialMedia: [
      { name: '微信公众号', icon: '🔵', link: 'https://mp.weixin.qq.com' },
      { name: '微博', icon: '🔴', link: 'https://weibo.com/carbontrack' },
      { name: '小红书', icon: '🔺', link: 'https://xiaohongshu.com/user/profile' }
    ],
    teamMembers: [
      {
        name: 'Angela Zhang',
        role: '小程序主创设计开发',
        emoji: '🦢',
        description: '作为 CarbonTrack 面向国内群体小程序的主创设计与开发负责人，核心围绕 “双碳” 目标下国内用户的低碳行为数字化需求，牵头完成了小程序场景设计到技术落地的全流程工作，打造出贴合本土用户习惯、兼具实用性与激励性的碳足迹追踪工具。',
      },
      {
        name: 'Yuanzheng (Jack) Yu',
        role: '团队领导者',
        emoji: '👑',
        description: '负责团队组建、工作分配、未来规划以及协调与外部合作伙伴的合作。在技术团队中，负责网站设计、测试和维护。希望利用互联网的力量让每个人都参与减排，在应对环境挑战的同时培养一个充满活力和支持性的社区。',
        link: 'https://yuanzhengjackyu.com/'
      },
      {
        name: 'Zining (Jeffery) Lyu',
        role: '联合创始人兼核心技术专家',
        emoji: '💻',
        description: '作为一名熟练的全栈Web工程师，负责碳账户网站的设计和维护。梦想是用技术改变人们的生活方式。'
      },
      {
        name: 'Minghan (Loren) Li',
        role: '网站经理和设计师',
        emoji: '🎨',
        description: '对环境保护充满热情，并拥有扎实的环境科学学术基础，为团队带来了激情与专业知识。喜欢摄影、探索户外和看动漫。愿望是为应对气候变化做出显著贡献，同时推动环境可持续性发展。',
        link: 'https://lorenlmh.com/'
      },
      {
        name: 'Smiley Ni',
        role: '广告宣传和设计师',
        emoji: '🌟',
        description: '作为一个有创造力的人，喜欢跳舞、绘画和马术。梦想是传播快乐。',
        link: 'https://smileyn327.com/'
      },
      {
        name: 'Lan Liu',
        role: '网站设计师和运营者',
        emoji: '🌿',
        description: '热爱自然，尤其喜欢徒步旅行。擅长演讲、与他人沟通、跳舞、马术和陶艺。志向是通过我们的网站向更多人，特别是青少年，提供一系列可持续的绿色生活方式。'
      },
      {
        name: 'Jack Shi',
        role: '网站设计师和运营者',
        emoji: '🌊',
        description: '热爱海洋，并经常在当地专注于海洋保护的组织中做志愿者。喜欢健身、越野跑和游泳。目标是运用自己的技能帮助保护海洋，并激励他人关心环境。'
      },
      {
        name: 'Tony Li',
        role: '核心技术人员',
        emoji: '⚙️',
        description: '负责更新新功能、完善网站交互，并进一步开发用户友好功能以提升整体数字体验。其努力确保网站保持现代和高效。'
      },
      {
        name: 'Eddie Peng',
        role: '内容团队成员',
        emoji: '✍️',
        description: '负责撰写文章和描述。如果您需要任何帮助，他很乐意为您提供支持。'
      },
      {
        name: 'Michael Jiang',
        role: '技术团队成员',
        emoji: '🔧',
        description: '负责编写代码和开发网页，并在我们的网站和应用程序上创建新的技术功能。同时专注于改进网站和应用程序的用户界面。'
      },
      {
        name: 'Peter Zhao',
        role: '内容团队成员',
        emoji: '📝',
        description: '主要负责网站的信息编辑和艺术设计。喜欢旅行、运动和玩电子游戏。旨在促进环境可持续性。'
      },
      {
        name: 'Kiana Jin',
        role: '首席市场经理',
        emoji: '📢',
        description: '负责校内活动、运营社交媒体平台以及组织与外部公司的沟通。希望通过引入不同的声音来积极影响社区氛围。',
        link: ''
      },
      {
        name: 'Kelly Du',
        role: '首席环境科学顾问',
        emoji: '🔬',
        description: '审查我们行动的科学准确性和严谨性，并撰写科普文章。凭借先前的潜水经验和对全球气候问题的了解，希望提高公众对持续环境问题的认识，并为全球环境目标做出贡献。'
      },
      {
        name: 'Thomas Lu',
        role: '技术团队成员',
        emoji: '🧪',
        description: '负责测试网站功能。帮助识别错误、改善用户体验并支持开发过程。对技术和精确性充满热情，并相信“注意力是你所需要的全部”。致力于全球可持续性，并希望通过共识、进化和连续性的价值观支持有意义的变革。',
        link: 'https://www.thomas-hub.com/'
      },
      {
        name: 'Benson Zhou',
        role: '项目早期贡献者',
        emoji: '✨',
        description: '共同提出了应用程序的初始UI设计风格，帮助塑造了我们平台的视觉识别。目前负责审核CarbonTrack上所有用户提交的记录，定期检查官方电子邮件，并与用户保持及时沟通。'
      },
      {
        name: 'Arya Chen',
        role: 'UI设计师',
        emoji: '🎨',
        description: '专注于UI设计。熟练使用Adobe Ps、Au和其他设计软件。期待为项目贡献创意且用户友好的设计。'
      },
      {
        name: 'Amily Gao',
        role: '联合创始人兼内容团队成员',
        emoji: '🌱',
        description: '就读于上海星河湾双语学校，是内容团队成员。主要负责背景研究、文献综述和碳核算。'
      },
      {
        name: 'Jerry Tang',
        role: '联合创始人',
        emoji: '📊',
        description: '上海平和学校学生。负责碳账户项目的前期研究和碳计算。'
      },
      {
        name: 'Yangyang 周奕涵',
        role: '联合创始人',
        emoji: '🏀',
        description: '上海世界外国语中学IBDP课程学生。对经济学和数学有浓厚兴趣，喜欢运动，尤其是篮球。'
      },
      {
        name: 'Dora 徐语笛',
        role: '联合创始人兼内容团队成员',
        emoji: '🌳',
        description: '就读于华南师范大学附属中学国际部（HFI）。作为内容团队成员，负责文献综述和组织碳账户研究。希望鼓励更多人参与节能减排行动，让世界更绿色。'
      },
      {
        name: 'Hannah 张若菡',
        role: '联合创始人兼内容团队成员',
        emoji: '📚',
        description: '通过文献阅读丰富项目内容，同时为媒体相关的工作做出贡献。希望激励他人从日常生活中的小事做起，帮助保护环境。'
      },
      {
        name: 'Richard 胡睿晨',
        role: '联合创始人',
        emoji: '💻',
        description: '负责网站开发并与其他部门协调。希望通过互联网将环保意识和节能理念传播给更广泛的社区，使世界更绿色、更可持续。'
      },
      {
        name: 'Mandy 俞淑彦',
        role: '联合创始人兼艺术设计师',
        emoji: '🎨',
        description: '就读于美国高中。主要协助艺术设计，希望通过创意艺术作品启发他人，为世界增添一抹绿色。'
      }
    ],
    missionPoints: [
      '以学生为目标，提高他们对气候变化和碳排放的认识。',
      '帮助学生记录日常生活中的碳足迹，培养对节能减碳活动的更高认识和参与度。',
      '通过我们的努力，希望提高人们对节能减排重要性的认识，进一步促进全球对环境保护的关注和认可。',
      '参与并支持为环境保护和社会福祉做出贡献的活动和非营利组织，对我们共同的家园产生积极影响。'
    ],
    achievements: [
      {
        icon: '🌍',
        title: '碳减排',
        value: '减少 Loading... 千克 CO₂ 排放',
        description: '我们通过碳账户记录和管理碳足迹，获得碳积分并享受低碳生活方式的好处。'
      },
      {
        icon: '👥',
        title: '低碳社区规模',
        value: '最近增加 Loading... 名用户',
        description: '通过分享我们的低碳生活方式和故事，我们扩大了低碳社区，提高了意识，并吸引了更多成员加入我们的团队。'
      },
      {
        icon: '📝',
        title: '碳账户使用次数',
        value: '处理 Loading... 条记录',
        description: '碳减排记录数量的增加反映了我们为社区带来的积极影响，以及我们网站的稳定性。'
      }
    ],
    copyright: '© 2025 CarbonTrack. 保留所有权利。'
  },

  onLoad: function() {
    this.setTheme();
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({ isLoading: true });
    // 模拟刷新数据
    setTimeout(() => {
      this.setData({ isLoading: false });
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
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

  // 访问官网
  visitWebsite: function() {
    wx.navigateTo({
      url: '/pages/webview/webview?url=' + encodeURIComponent(this.data.contactInfo.website)
    });
  },

  // 发送邮件
  sendEmail: function() {
    wx.setClipboardData({
      data: this.data.contactInfo.email,
      success: () => {
        wx.showToast({
          title: '邮箱地址已复制',
          icon: 'success'
        });
      }
    });
  },

  // 拨打电话
  makeCall: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.contactInfo.phone,
      fail: (error) => {
        console.error('拨打电话失败:', error);
      }
    });
  },

  // 打开链接
  openLink: function(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url: '/pages/webview/webview?url=' + encodeURIComponent(url)
      });
    }
  },

  // 分享给朋友
  onShareAppMessage: function() {
    return {
      title: this.data.appName + ' - ' + this.data.slogan,
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: this.data.appName + ' - ' + this.data.slogan,
      query: '',
      imageUrl: '/images/share.jpg'
    };
  }
});