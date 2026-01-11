// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const results = {
    success: true,
    summary: {},
    details: {}
  }
  
  try {
    const now = new Date()
    const testUserId = 'test_user_001'
    const testUserName = '测试用户'
    
    // ============================================
    // 1. 创建或更新测试用户
    // ============================================
    results.details.user = await createOrUpdateTestUser(testUserId, testUserName)
    
    // ============================================
    // 2. 插入商品数据（需要先存在，订单才能引用）
    // ============================================
    const productIds = await insertProducts(now)
    results.details.products = { count: productIds.length, ids: productIds }
    results.summary.products = `成功插入${productIds.length}个商品`
    
    // ============================================
    // 3. 插入成就数据
    // ============================================
    const achievementIds = await insertAchievements(now)
    results.details.achievements = { count: achievementIds.length, ids: achievementIds }
    results.summary.achievements = `成功插入${achievementIds.length}个成就`
    
    // ============================================
    // 4. 插入活动数据
    // ============================================
    const activityIds = await insertActivities(now)
    results.details.activities = { count: activityIds.length, ids: activityIds }
    results.summary.activities = `成功插入${activityIds.length}个活动`
    
    // ============================================
    // 5. 插入公告数据
    // ============================================
    const announcementIds = await insertAnnouncements(now)
    results.details.announcements = { count: announcementIds.length }
    results.summary.announcements = `成功插入${announcementIds.length}条公告`
    
    // ============================================
    // 6. 更新用户的积分和统计数据（为交易记录做准备）
    // ============================================
    await updateUserStats(testUserId)
    results.details.userStats = '用户统计数据已更新'
    
    // ============================================
    // 7. 插入交易记录（依赖用户积分余额）
    // ============================================
    const transactionIds = await insertTransactions(testUserId, now)
    results.details.transactions = { count: transactionIds.length, ids: transactionIds }
    results.summary.transactions = `成功插入${transactionIds.length}条交易记录`
    
    // ============================================
    // 8. 插入兑换订单（依赖商品ID和用户积分）
    // ============================================
    const orderIds = await insertExchangeOrders(testUserId, productIds, now)
    results.details.exchangeOrders = { count: orderIds.length, ids: orderIds }
    results.summary.exchangeOrders = `成功插入${orderIds.length}个兑换订单`
    
    // ============================================
    // 9. 插入用户反馈
    // ============================================
    const feedbackIds = await insertFeedback(testUserId, now)
    results.details.feedback = { count: feedbackIds.length }
    results.summary.feedback = `成功插入${feedbackIds.length}条反馈`
    
    // ============================================
    // 10. 插入消息（部分关联订单、成就、活动）
    // ============================================
    const messageIds = await insertMessages(testUserId, orderIds[0], achievementIds[0], activityIds[0], now)
    results.details.messages = { count: messageIds.length }
    results.summary.messages = `成功插入${messageIds.length}条消息`
    
    // ============================================
    // 11. 插入用户设置
    // ============================================
    await insertUserSettings(testUserId, now)
    results.details.userSettings = '用户设置已创建'
    results.summary.userSettings = '成功创建用户设置'
    
    results.summary.total = '所有测试数据创建完成！'
    
    return results
    
  } catch (error) {
    console.error('创建测试数据失败:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
}

// 创建或更新测试用户
async function createOrUpdateTestUser(userId, userName) {
  const now = new Date()
  
  const result = await db.collection('users').where({ _openid: userId }).get()
  
  if (result.data.length > 0) {
    // 更新现有用户
    await db.collection('users').where({ _openid: userId }).update({
      data: {
        nickName: userName,
        avatarUrl: 'https://example.com/avatar/test.png',
        points: 1500,
        totalPointsEarned: 3500,
        totalCarbonRecords: 25,
        totalCarbonSaved: 45.5,
        consecutiveLoginDays: 5,
        achievements: ['ach_001', 'ach_002', 'ach_003'],
        totalExchanges: 3,
        activityProgress: {
          'act_001': { completed: true, currentProgress: 10, joinedAt: new Date(now.getTime() - 7*24*60*60*1000) },
          'act_002': { completed: false, currentProgress: 3, joinedAt: new Date(now.getTime() - 3*24*60*60*1000) }
        },
        updatedAt: now
      }
    })
    return { action: 'updated', userId }
  } else {
    // 创建新用户
    await db.collection('users').add({
      data: {
        _openid: userId,
        nickName: userName,
        avatarUrl: 'https://example.com/avatar/test.png',
        points: 1500,
        totalPointsEarned: 3500,
        totalCarbonRecords: 25,
        totalCarbonSaved: 45.5,
        consecutiveLoginDays: 5,
        achievements: ['ach_001', 'ach_002', 'ach_003'],
        totalExchanges: 3,
        activityProgress: {
          'act_001': { completed: true, currentProgress: 10, joinedAt: new Date(now.getTime() - 7*24*60*60*1000) },
          'act_002': { completed: false, currentProgress: 3, joinedAt: new Date(now.getTime() - 3*24*60*60*1000) }
        },
        createdAt: now,
        updatedAt: now
      }
    })
    return { action: 'created', userId }
  }
}

// 插入商品数据
async function insertProducts(now) {
  const products = [
    {
      id: 'prod_001',
      data: {
        name: '环保购物袋',
        description: '可重复使用的高质量环保购物袋，采用可降解材料制作，减少塑料袋使用，为地球减负。',
        price: 100,
        category: 'daily',
        image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400',
        stock: 500,
        sold: 35,
        sort: 1,
        status: 'active',
        createdAt: new Date(now.getTime() - 30*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'prod_002',
      data: {
        name: '便携式餐具套装',
        description: '包含筷、勺、叉的便携式不锈钢餐具套装，食品级材质，便携收纳，拒绝一次性餐具。',
        price: 150,
        category: 'daily',
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400',
        stock: 300,
        sold: 58,
        sort: 2,
        status: 'active',
        createdAt: new Date(now.getTime() - 25*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'prod_003',
      data: {
        name: '碳减排证书',
        description: '官方认证的碳减排证书，记录您的环保贡献，可分享到社交平台展示您的绿色生活。',
        price: 500,
        category: 'certificate',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
        stock: 100,
        sold: 12,
        sort: 3,
        status: 'active',
        createdAt: new Date(now.getTime() - 20*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'prod_004',
      data: {
        name: '环保水杯',
        description: 'BPA免费的双层保温水杯，容量500ml，保冷保热，简约设计，随身携带。',
        price: 300,
        category: 'daily',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
        stock: 200,
        sold: 42,
        sort: 4,
        status: 'active',
        createdAt: new Date(now.getTime() - 15*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'prod_005',
      data: {
        name: '植物种子礼包',
        description: '包含向日葵、薄荷、薰衣草等多种环保植物种子，种植绿色希望，净化空气。',
        price: 200,
        category: 'plant',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        stock: 400,
        sold: 67,
        sort: 5,
        status: 'active',
        createdAt: new Date(now.getTime() - 10*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'prod_006',
      data: {
        name: '环保T恤',
        description: '使用100%有机棉制成的环保T恤，舒适透气，简约设计，展示您的环保态度。',
        price: 400,
        category: 'clothing',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        stock: 150,
        sold: 23,
        sort: 6,
        status: 'active',
        createdAt: new Date(now.getTime() - 5*24*60*60*1000),
        updatedAt: now
      }
    }
  ]
  
  const ids = []
  for (const product of products) {
    await db.collection('products').add({ data: product.data })
    ids.push(product.id)
  }
  
  return ids
}

// 插入成就数据
async function insertAchievements(now) {
  const achievements = [
    {
      id: 'ach_001',
      data: {
        name: '初次记录',
        description: '完成第一次碳足迹记录，开启您的环保之旅',
        category: 'carbon',
        points: 10,
        icon: '🌱',
        condition: { type: 'total_records', value: 1 },
        sort: 1,
        status: 'active',
        createdAt: new Date(now.getTime() - 30*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'ach_002',
      data: {
        name: '环保新手',
        description: '累计记录10次碳足迹，您正在养成环保好习惯',
        category: 'carbon',
        points: 50,
        icon: '🌿',
        condition: { type: 'total_records', value: 10 },
        sort: 2,
        status: 'active',
        createdAt: new Date(now.getTime() - 25*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'ach_003',
      data: {
        name: '减碳先锋',
        description: '累计减少10kg碳排放，为地球做出了重要贡献',
        category: 'carbon',
        points: 100,
        icon: '🌍',
        condition: { type: 'total_carbon', value: 10 },
        sort: 3,
        status: 'active',
        createdAt: new Date(now.getTime() - 20*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'ach_004',
      data: {
        name: '环保达人',
        description: '累计记录50次碳足迹，您是真正的环保达人',
        category: 'carbon',
        points: 200,
        icon: '🌳',
        condition: { type: 'total_records', value: 50 },
        sort: 4,
        status: 'active',
        createdAt: new Date(now.getTime() - 15*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'ach_005',
      data: {
        name: '连续登录3天',
        description: '连续登录应用3天，养成每日记录的好习惯',
        category: 'login',
        points: 20,
        icon: '📅',
        condition: { type: 'consecutive_days', value: 3 },
        sort: 5,
        status: 'active',
        createdAt: new Date(now.getTime() - 10*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'ach_006',
      data: {
        name: '连续登录7天',
        description: '连续登录应用7天，坚持就是胜利',
        category: 'login',
        points: 50,
        icon: '🏆',
        condition: { type: 'consecutive_days', value: 7 },
        sort: 6,
        status: 'active',
        createdAt: new Date(now.getTime() - 8*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'ach_007',
      data: {
        name: '积分新手',
        description: '累计获得100积分，开启积分兑换之旅',
        category: 'points',
        points: 30,
        icon: '💎',
        condition: { type: 'total_points', value: 100 },
        sort: 7,
        status: 'active',
        createdAt: new Date(now.getTime() - 6*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'ach_008',
      data: {
        name: '积分达人',
        description: '累计获得1000积分，您是积分商城的VIP用户',
        category: 'points',
        points: 100,
        icon: '👑',
        condition: { type: 'total_points', value: 1000 },
        sort: 8,
        status: 'active',
        createdAt: new Date(now.getTime() - 4*24*60*60*1000),
        updatedAt: now
      }
    }
  ]
  
  const ids = []
  for (const achievement of achievements) {
    await db.collection('achievements').add({ data: achievement.data })
    ids.push(achievement.id)
  }
  
  return ids
}

// 插入活动数据
async function insertActivities(now) {
  const activities = [
    {
      id: 'act_001',
      data: {
        name: '每日打卡',
        description: '每天记录一次碳足迹，记录环保生活的每一天',
        type: 'daily',
        targetValue: 1,
        rewardPoints: 5,
        startDate: new Date(now.getTime() - 10*24*60*60*1000),
        endDate: null,
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        sort: 1,
        status: 'active',
        participants: 156,
        completions: 89,
        createdAt: new Date(now.getTime() - 10*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'act_002',
      data: {
        name: '减碳挑战',
        description: '一周内累计减少5kg碳排放，挑战自我，为地球减负',
        type: 'weekly',
        targetValue: 5,
        rewardPoints: 50,
        startDate: new Date(now.getTime() - 5*24*60*60*1000),
        endDate: new Date(now.getTime() + 2*24*60*60*1000),
        image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400',
        sort: 2,
        status: 'active',
        participants: 89,
        completions: 34,
        createdAt: new Date(now.getTime() - 5*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'act_003',
      data: {
        name: '积分达人',
        description: '累计获得500积分，成为积分商城的精英用户',
        type: 'points',
        targetValue: 500,
        rewardPoints: 100,
        startDate: new Date(now.getTime() - 15*24*60*60*1000),
        endDate: null,
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
        sort: 3,
        status: 'active',
        participants: 234,
        completions: 78,
        createdAt: new Date(now.getTime() - 15*24*60*60*1000),
        updatedAt: now
      }
    },
    {
      id: 'act_004',
      data: {
        name: '分享达人',
        description: '分享应用给3位好友，邀请更多人一起参与环保',
        type: 'social',
        targetValue: 3,
        rewardPoints: 30,
        startDate: new Date(now.getTime() - 7*24*60*60*1000),
        endDate: new Date(now.getTime() + 7*24*60*60*1000),
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400',
        sort: 4,
        status: 'active',
        participants: 67,
        completions: 23,
        createdAt: new Date(now.getTime() - 7*24*60*60*1000),
        updatedAt: now
      }
    }
  ]
  
  const ids = []
  for (const activity of activities) {
    await db.collection('activities').add({ data: activity.data })
    ids.push(activity.id)
  }
  
  return ids
}

// 插入公告数据
async function insertAnnouncements(now) {
  const announcements = [
    {
      title: 'CarbonTrack 积分商城上线啦！',
      content: '亲爱的用户，我们很高兴地通知您，CarbonTrack 积分商城正式上线！您可以通过记录碳足迹、完成任务、解锁成就等方式获得积分，然后在商城兑换精美环保礼品。快来体验吧！',
      type: 'update',
      isTop: true,
      status: 'published',
      createdAt: new Date(now.getTime() - 1*24*60*60*1000),
      updatedAt: now
    },
    {
      title: '新增植物种子礼包商品',
      content: '积分商城新增植物种子礼包，包含向日葵、薄荷、薰衣草等多种环保植物种子，仅需200积分即可兑换。让我们一起种植绿色希望，净化空气！',
      type: 'update',
      isTop: false,
      status: 'published',
      createdAt: new Date(now.getTime() - 2*24*60*60*1000),
      updatedAt: now
    },
    {
      title: '系统维护通知',
      content: '为了提供更好的服务，我们将于2024年1月15日凌晨2:00-4:00进行系统维护，届时部分功能可能无法使用，请提前做好准备。',
      type: 'maintenance',
      isTop: false,
      status: 'published',
      createdAt: new Date(now.getTime() - 3*24*60*60*1000),
      updatedAt: now
    },
    {
      title: '新用户注册福利',
      content: '新用户注册即送100积分，完成首次碳足迹记录再送50积分，快来加入CarbonTrack大家庭吧！',
      type: 'event',
      isTop: false,
      status: 'published',
      createdAt: new Date(now.getTime() - 5*24*60*60*1000),
      updatedAt: now
    }
  ]
  
  const ids = []
  for (const announcement of announcements) {
    const result = await db.collection('announcements').add({ data: announcement })
    ids.push(result._id)
  }
  
  return ids
}

// 更新用户统计（为交易做准备）
async function updateUserStats(userId) {
  const now = new Date()
  await db.collection('users').where({ _openid: userId }).update({
    data: {
      points: 1500,
      totalPointsEarned: 3500,
      totalCarbonRecords: 25,
      totalCarbonSaved: 45.5,
      updatedAt: now
    }
  })
}

// 插入交易记录（符合积分余额变化）
async function insertTransactions(userId, now) {
  const transactions = [
    {
      id: 'txn_001',
      data: {
        userId: userId,
        type: 'earn',
        amount: 100,
        balance: 100,
        description: '新用户注册奖励',
        referenceType: 'register',
        referenceId: null,
        createdAt: new Date(now.getTime() - 25*24*60*60*1000)
      }
    },
    {
      id: 'txn_002',
      data: {
        userId: userId,
        type: 'earn',
        amount: 50,
        balance: 150,
        description: '首次记录碳足迹',
        referenceType: 'carbon_record',
        referenceId: null,
        createdAt: new Date(now.getTime() - 25*24*60*60*1000)
      }
    },
    {
      id: 'txn_003',
      data: {
        userId: userId,
        type: 'earn',
        amount: 10,
        balance: 160,
        description: '解锁成就：初次记录',
        referenceType: 'achievement',
        referenceId: 'ach_001',
        createdAt: new Date(now.getTime() - 25*24*60*60*1000)
      }
    },
    {
      id: 'txn_004',
      data: {
        userId: userId,
        type: 'earn',
        amount: 5,
        balance: 165,
        description: '完成活动：每日打卡',
        referenceType: 'activity',
        referenceId: 'act_001',
        createdAt: new Date(now.getTime() - 24*24*60*60*1000)
      }
    },
    {
      id: 'txn_005',
      data: {
        userId: userId,
        type: 'spend',
        amount: 100,
        balance: 65,
        description: '兑换商品：环保购物袋',
        referenceType: 'exchange',
        referenceId: 'order_001',
        createdAt: new Date(now.getTime() - 20*24*60*60*1000)
      }
    },
    {
      id: 'txn_006',
      data: {
        userId: userId,
        type: 'earn',
        amount: 20,
        balance: 85,
        description: '连续登录3天奖励',
        referenceType: 'achievement',
        referenceId: 'ach_005',
        createdAt: new Date(now.getTime() - 18*24*60*60*1000)
      }
    },
    {
      id: 'txn_007',
      data: {
        userId: userId,
        type: 'earn',
        amount: 50,
        balance: 135,
        description: '解锁成就：环保新手',
        referenceType: 'achievement',
        referenceId: 'ach_002',
        createdAt: new Date(now.getTime() - 15*24*60*60*1000)
      }
    },
    {
      id: 'txn_008',
      data: {
        userId: userId,
        type: 'earn',
        amount: 50,
        balance: 185,
        description: '完成活动：减碳挑战',
        referenceType: 'activity',
        referenceId: 'act_002',
        createdAt: new Date(now.getTime() - 14*24*60*60*1000)
      }
    },
    {
      id: 'txn_009',
      data: {
        userId: userId,
        type: 'spend',
        amount: 150,
        balance: 35,
        description: '兑换商品：便携式餐具套装',
        referenceType: 'exchange',
        referenceId: 'order_002',
        createdAt: new Date(now.getTime() - 10*24*60*60*1000)
      }
    },
    {
      id: 'txn_010',
      data: {
        userId: userId,
        type: 'earn',
        amount: 100,
        balance: 135,
        description: '解锁成就：减碳先锋',
        referenceType: 'achievement',
        referenceId: 'ach_003',
        createdAt: new Date(now.getTime() - 8*24*60*60*1000)
      }
    },
    {
      id: 'txn_011',
      data: {
        userId: userId,
        type: 'earn',
        amount: 100,
        balance: 235,
        description: '完成活动：积分达人',
        referenceType: 'activity',
        referenceId: 'act_003',
        createdAt: new Date(now.getTime() - 7*24*60*60*1000)
      }
    },
    {
      id: 'txn_012',
      data: {
        userId: userId,
        type: 'spend',
        amount: 200,
        balance: 35,
        description: '兑换商品：植物种子礼包',
        referenceType: 'exchange',
        referenceId: 'order_003',
        createdAt: new Date(now.getTime() - 5*24*60*60*1000)
      }
    },
    {
      id: 'txn_013',
      data: {
        userId: userId,
        type: 'earn',
        amount: 1000,
        balance: 1035,
        description: '解锁成就：积分达人',
        referenceType: 'achievement',
        referenceId: 'ach_008',
        createdAt: new Date(now.getTime() - 3*24*60*60*1000)
      }
    },
    {
      id: 'txn_014',
      data: {
        userId: userId,
        type: 'spend',
        amount: 300,
        balance: 735,
        description: '兑换商品：环保水杯',
        referenceType: 'exchange',
        referenceId: 'order_004',
        createdAt: new Date(now.getTime() - 2*24*60*60*1000)
      }
    },
    {
      id: 'txn_015',
      data: {
        userId: userId,
        type: 'earn',
        amount: 300,
        balance: 1035,
        description: '连续记录碳足迹7天奖励',
        referenceType: 'login',
        referenceId: null,
        createdAt: new Date(now.getTime() - 1*24*60*60*1000)
      }
    },
    {
      id: 'txn_016',
      data: {
        userId: userId,
        type: 'spend',
        amount: 400,
        balance: 635,
        description: '兑换商品：环保T恤',
        referenceType: 'exchange',
        referenceId: 'order_005',
        createdAt: new Date(now.getTime() - 12*60*60*1000)
      }
    },
    {
      id: 'txn_017',
      data: {
        userId: userId,
        type: 'spend',
        amount: 500,
        balance: 135,
        description: '兑换商品：碳减排证书',
        referenceType: 'exchange',
        referenceId: 'order_006',
        createdAt: new Date(now.getTime() - 6*60*60*1000)
      }
    },
    {
      id: 'txn_018',
      data: {
        userId: userId,
        type: 'earn',
        amount: 1000,
        balance: 1135,
        description: '活动奖励：每周登录签到',
        referenceType: 'activity',
        referenceId: 'act_001',
        createdAt: new Date(now.getTime() - 1*60*60*1000)
      }
    },
    {
      id: 'txn_019',
      data: {
        userId: userId,
        type: 'earn',
        amount: 365,
        balance: 1500,
        description: '累计记录碳足迹奖励',
        referenceType: 'carbon_record',
        referenceId: null,
        createdAt: now
      }
    }
  ]
  
  const ids = []
  for (const transaction of transactions) {
    await db.collection('transactions').add({ data: transaction.data })
    ids.push(transaction.id)
  }
  
  return ids
}

// 插入兑换订单（关联商品和交易）
async function insertExchangeOrders(userId, productIds, now) {
  const orders = [
    {
      id: 'order_001',
      data: {
        userId: userId,
        productId: productIds[0], // 环保购物袋
        productName: '环保购物袋',
        productImage: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400',
        quantity: 1,
        pointsPrice: 100,
        totalPoints: 100,
        status: 'completed',
        contactName: '测试用户',
        contactPhone: '13800138000',
        address: '北京市朝阳区环保路123号',
        remark: '',
        createdAt: new Date(now.getTime() - 20*24*60*60*1000),
        updatedAt: new Date(now.getTime() - 19*24*60*60*1000),
        processedAt: new Date(now.getTime() - 19*24*60*60*1000)
      }
    },
    {
      id: 'order_002',
      data: {
        userId: userId,
        productId: productIds[1], // 便携式餐具套装
        productName: '便携式餐具套装',
        productImage: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400',
        quantity: 1,
        pointsPrice: 150,
        totalPoints: 150,
        status: 'completed',
        contactName: '测试用户',
        contactPhone: '13800138000',
        address: '北京市朝阳区环保路123号',
        remark: '',
        createdAt: new Date(now.getTime() - 10*24*60*60*1000),
        updatedAt: new Date(now.getTime() - 9*24*60*60*1000),
        processedAt: new Date(now.getTime() - 9*24*60*60*1000)
      }
    },
    {
      id: 'order_003',
      data: {
        userId: userId,
        productId: productIds[4], // 植物种子礼包
        productName: '植物种子礼包',
        productImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        quantity: 1,
        pointsPrice: 200,
        totalPoints: 200,
        status: 'completed',
        contactName: '测试用户',
        contactPhone: '13800138000',
        address: '北京市朝阳区环保路123号',
        remark: '',
        createdAt: new Date(now.getTime() - 5*24*60*60*1000),
        updatedAt: new Date(now.getTime() - 4*24*60*60*1000),
        processedAt: new Date(now.getTime() - 4*24*60*60*1000)
      }
    },
    {
      id: 'order_004',
      data: {
        userId: userId,
        productId: productIds[3], // 环保水杯
        productName: '环保水杯',
        productImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
        quantity: 1,
        pointsPrice: 300,
        totalPoints: 300,
        status: 'processing',
        contactName: '测试用户',
        contactPhone: '13800138000',
        address: '北京市朝阳区环保路123号',
        remark: '',
        createdAt: new Date(now.getTime() - 2*24*60*60*1000),
        updatedAt: new Date(now.getTime() - 1*24*60*60*1000),
        processedAt: null
      }
    },
    {
      id: 'order_005',
      data: {
        userId: userId,
        productId: productIds[5], // 环保T恤
        productName: '环保T恤',
        productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        quantity: 1,
        pointsPrice: 400,
        totalPoints: 400,
        status: 'pending',
        contactName: '测试用户',
        contactPhone: '13800138000',
        address: '北京市朝阳区环保路123号',
        remark: '请尽快发货',
        createdAt: new Date(now.getTime() - 12*60*60*1000),
        updatedAt: now,
        processedAt: null
      }
    },
    {
      id: 'order_006',
      data: {
        userId: userId,
        productId: productIds[2], // 碳减排证书
        productName: '碳减排证书',
        productImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
        quantity: 1,
        pointsPrice: 500,
        totalPoints: 500,
        status: 'completed',
        contactName: '测试用户',
        contactPhone: '13800138000',
        address: '北京市朝阳区环保路123号',
        remark: '证书已收到',
        createdAt: new Date(now.getTime() - 6*60*60*1000),
        updatedAt: new Date(now.getTime() - 5*60*60*1000),
        processedAt: new Date(now.getTime() - 5*60*60*1000)
      }
    }
  ]
  
  const ids = []
  for (const order of orders) {
    await db.collection('exchange_orders').add({ data: order.data })
    ids.push(order.id)
  }
  
  return ids
}

// 插入用户反馈
async function insertFeedback(userId, now) {
  const feedbackList = [
    {
      type: 'suggestion',
      content: '建议增加更多环保商品，比如太阳能充电器、环保文具等。',
      images: [],
      status: 'replied',
      reply: '感谢您的建议！我们会认真考虑您的建议，后续会增加更多环保商品。',
      createdAt: new Date(now.getTime() - 7*24*60*60*1000),
      updatedAt: new Date(now.getTime() - 6*24*60*60*1000),
      repliedAt: new Date(now.getTime() - 6*24*60*60*1000)
    },
    {
      type: 'bug',
      content: '在兑换商品时，偶尔会出现加载失败的情况，需要刷新页面才能正常显示。',
      images: ['https://example.com/screenshot1.png'],
      status: 'pending',
      reply: '',
      createdAt: new Date(now.getTime() - 3*24*60*60*1000),
      updatedAt: now,
      repliedAt: null
    },
    {
      type: 'other',
      content: '希望能增加成就排行榜功能，看看其他用户的成就解锁情况。',
      images: [],
      status: 'replied',
      reply: '感谢您的反馈！成就排行榜功能已在开发计划中，敬请期待！',
      createdAt: new Date(now.getTime() - 1*24*60*60*1000),
      updatedAt: new Date(now.getTime() - 12*60*60*1000),
      repliedAt: new Date(now.getTime() - 12*60*60*1000)
    }
  ]
  
  const ids = []
  for (const feedback of feedbackList) {
    const result = await db.collection('feedback').add({
      data: {
        userId: userId,
        ...feedback
      }
    })
    ids.push(result._id)
  }
  
  return ids
}

// 插入消息（关联订单、成就、活动）
async function insertMessages(userId, orderId, achievementId, activityId, now) {
  const messages = [
    {
      type: 'system',
      title: '欢迎使用 CarbonTrack',
      content: '欢迎加入 CarbonTrack，让我们一起为地球减负！记录碳足迹，获得积分，兑换环保礼品。',
      read: true,
      readAt: new Date(now.getTime() - 25*24*60*60*1000),
      createdAt: new Date(now.getTime() - 25*24*60*60*1000)
    },
    {
      type: 'achievement',
      title: '恭喜解锁新成就！',
      content: '您已解锁「初次记录」成就，获得 10 积分奖励！',
      read: true,
      readAt: new Date(now.getTime() - 25*24*60*60*1000),
      createdAt: new Date(now.getTime() - 25*24*60*60*1000)
    },
    {
      type: 'exchange',
      title: '订单发货通知',
      content: '您的订单「环保购物袋」已发货，请保持手机畅通，快递员即将联系您。',
      read: true,
      readAt: new Date(now.getTime() - 19*24*60*60*1000),
      createdAt: new Date(now.getTime() - 19*24*60*60*1000)
    },
    {
      type: 'achievement',
      title: '恭喜解锁新成就！',
      content: '您已解锁「连续登录3天」成就，获得 20 积分奖励！',
      read: true,
      readAt: new Date(now.getTime() - 18*24*60*60*1000),
      createdAt: new Date(now.getTime() - 18*24*60*60*1000)
    },
    {
      type: 'activity',
      title: '活动完成！',
      content: '恭喜您完成「每日打卡」活动，获得 5 积分奖励！继续加油！',
      read: true,
      readAt: new Date(now.getTime() - 24*24*60*60*1000),
      createdAt: new Date(now.getTime() - 24*24*60*60*1000)
    },
    {
      type: 'achievement',
      title: '恭喜解锁新成就！',
      content: '您已解锁「环保新手」成就，获得 50 积分奖励！继续保持！',
      read: true,
      readAt: new Date(now.getTime() - 15*24*60*60*1000),
      createdAt: new Date(now.getTime() - 15*24*60*60*1000)
    },
    {
      type: 'activity',
      title: '活动完成！',
      content: '恭喜您完成「减碳挑战」活动，获得 50 积分奖励！太棒了！',
      read: true,
      readAt: new Date(now.getTime() - 14*24*60*60*1000),
      createdAt: new Date(now.getTime() - 14*24*60*60*1000)
    },
    {
      type: 'exchange',
      title: '订单已完成',
      content: '您的订单「便携式餐具套装」已完成，感谢您的支持！',
      read: true,
      readAt: new Date(now.getTime() - 9*24*60*60*1000),
      createdAt: new Date(now.getTime() - 9*24*60*60*1000)
    },
    {
      type: 'achievement',
      title: '恭喜解锁新成就！',
      content: '您已解锁「减碳先锋」成就，获得 100 积分奖励！您是环保先锋！',
      read: true,
      readAt: new Date(now.getTime() - 8*24*60*60*1000),
      createdAt: new Date(now.getTime() - 8*24*60*60*1000)
    },
    {
      type: 'activity',
      title: '活动完成！',
      content: '恭喜您完成「积分达人」活动，获得 100 积分奖励！继续努力！',
      read: true,
      readAt: new Date(now.getTime() - 7*24*60*60*1000),
      createdAt: new Date(now.getTime() - 7*24*60*60*1000)
    },
    {
      type: 'exchange',
      title: '订单已完成',
      content: '您的订单「植物种子礼包」已完成，期待您的种植成果！',
      read: true,
      readAt: new Date(now.getTime() - 4*24*60*60*1000),
      createdAt: new Date(now.getTime() - 4*24*60*60*1000)
    },
    {
      type: 'achievement',
      title: '恭喜解锁新成就！',
      content: '您已解锁「积分达人」成就，获得 100 积分奖励！太厉害了！',
      read: true,
      readAt: new Date(now.getTime() - 3*24*60*60*1000),
      createdAt: new Date(now.getTime() - 3*24*60*60*1000)
    },
    {
      type: 'feedback',
      title: '您的反馈已回复',
      content: '感谢您的建议！我们会认真考虑您的建议，后续会增加更多环保商品。',
      read: true,
      readAt: new Date(now.getTime() - 6*24*60*60*1000),
      createdAt: new Date(now.getTime() - 6*24*60*60*1000)
    },
    {
      type: 'system',
      title: '积分商城上新啦！',
      content: '积分商城新增植物种子礼包、环保T恤等商品，快来选购吧！',
      read: false,
      readAt: null,
      createdAt: new Date(now.getTime() - 2*24*60*60*1000)
    },
    {
      type: 'system',
      title: '活动提醒',
      content: '「减碳挑战」活动即将结束，请尽快完成任务领取奖励！',
      read: false,
      readAt: null,
      createdAt: new Date(now.getTime() - 1*24*60*60*1000)
    }
  ]
  
  const ids = []
  for (const message of messages) {
    const result = await db.collection('messages').add({
      data: {
        userId: userId,
        ...message
      }
    })
    ids.push(result._id)
  }
  
  return ids
}

// 插入用户设置
async function insertUserSettings(userId, now) {
  await db.collection('user_settings').add({
    data: {
      userId: userId,
      settings: {
        notificationEnabled: true,
        dailyReminder: true,
        reminderTime: '09:00',
        theme: 'light',
        language: 'zh-CN'
      },
      createdAt: now,
      updatedAt: now
    }
  })
}
