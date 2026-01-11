// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { triggerType = 'carbon_record' } = event
  
  try {
    const now = new Date()
    
    // 查询用户信息
    const userResult = await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .get()
    
    if (userResult.data.length === 0) {
      return {
        success: false,
        error: '用户不存在'
      }
    }
    
    const user = userResult.data[0]
    const userAchievements = user.achievements || []
    
    // 查询所有未解锁的成就
    const achievementsResult = await db.collection('achievements')
      .where({ status: 'active' })
      .get()
    
    const newUnlocked = []
    
    for (const achievement of achievementsResult.data) {
      // 跳过已解锁的成就
      if (userAchievements.includes(achievement._id)) {
        continue
      }
      
      let unlocked = false
      const condition = achievement.condition || {}
      
      // 根据触发类型检查成就条件
      switch (triggerType) {
        case 'carbon_record':
          if (condition.type === 'total_records') {
            const totalRecords = user.totalCarbonRecords || 0
            if (totalRecords >= condition.value) unlocked = true
          } else if (condition.type === 'total_carbon') {
            const totalCarbon = user.totalCarbonSaved || 0
            if (totalCarbon >= condition.value) unlocked = true
          }
          break
          
        case 'login':
          if (condition.type === 'consecutive_days') {
            const consecutiveDays = user.consecutiveLoginDays || 0
            if (consecutiveDays >= condition.value) unlocked = true
          }
          break
          
        case 'exchange':
          if (condition.type === 'total_exchanges') {
            const totalExchanges = user.totalExchanges || 0
            if (totalExchanges >= condition.value) unlocked = true
          }
          break
          
        case 'points':
          if (condition.type === 'total_points') {
            const totalPoints = user.totalPointsEarned || 0
            if (totalPoints >= condition.value) unlocked = true
          } else if (condition.type === 'balance') {
            const balance = user.points || 0
            if (balance >= condition.value) unlocked = true
          }
          break
      }
      
      if (unlocked) {
        // 解锁成就
        newUnlocked.push({
          achievementId: achievement._id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points
        })
        
        // 更新用户成就列表
        await db.collection('users')
          .where({ _openid: wxContext.OPENID })
          .update({
            data: {
              achievements: _.addToSet(achievement._id),
              updatedAt: now
            }
          })
        
        // 奖励积分
        await db.collection('users')
          .where({ _openid: wxContext.OPENID })
          .update({
            data: {
              points: _.inc(achievement.points),
              totalPointsEarned: _.inc(achievement.points),
              updatedAt: now
            }
          })
        
        // 记录积分交易
        const userBalanceResult = await db.collection('users')
          .where({ _openid: wxContext.OPENID })
          .field({ points: true })
          .get()
        
        const newBalance = userBalanceResult.data[0].points
        
        await db.collection('transactions').add({
          data: {
            userId: wxContext.OPENID,
            type: 'earn',
            amount: achievement.points,
            balance: newBalance,
            description: `解锁成就: ${achievement.name}`,
            referenceType: 'achievement',
            referenceId: achievement._id,
            createdAt: now
          }
        })
        
        // 发送成就解锁通知
        await db.collection('messages').add({
          data: {
            userId: wxContext.OPENID,
            type: 'achievement',
            title: '恭喜解锁新成就！',
            content: `您已解锁「${achievement.name}」成就，获得 ${achievement.points} 积分奖励！`,
            read: false,
            createdAt: now
          }
        })
      }
    }
    
    return {
      success: true,
      data: {
        unlocked: newUnlocked,
        message: newUnlocked.length > 0 
          ? `解锁了 ${newUnlocked.length} 个新成就！` 
          : '暂无新成就解锁'
      }
    }
  } catch (error) {
    console.error('检查成就失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
