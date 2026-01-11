// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 查询所有成就
    const achievementsResult = await db.collection('achievements')
      .orderBy('category', 'asc')
      .orderBy('points', 'desc')
      .get()
    
    // 查询用户已获得的成就
    const userResult = await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .field({ achievements: true })
      .get()
    
    const userAchievements = userResult.data.length > 0 
      ? (userResult.data[0].achievements || [])
      : []
    
    // 标记用户已获得的成就
    const achievements = achievementsResult.data.map(achievement => ({
      ...achievement,
      unlocked: userAchievements.includes(achievement._id),
      unlockedAt: achievement.unlockedAt || null
    }))
    
    return {
      success: true,
      data: achievements
    }
  } catch (error) {
    console.error('获取成就列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
