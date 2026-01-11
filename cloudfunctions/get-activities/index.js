// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { status = 'active' } = event
  
  try {
    // 查询活动列表
    const result = await db.collection('activities')
      .where({ status })
      .orderBy('sort', 'asc')
      .orderBy('createdAt', 'desc')
      .get()
    
    // 查询用户参与的活动
    const userResult = await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .field({ activityProgress: true })
      .get()
    
    const userProgress = userResult.data.length > 0 
      ? (userResult.data[0].activityProgress || {})
      : {}
    
    // 标记用户已参与的活动和进度
    const activities = result.data.map(activity => {
      const progress = userProgress[activity._id] || { completed: false, currentProgress: 0 }
      return {
        ...activity,
        joined: !!userProgress[activity._id],
        completed: progress.completed,
        currentProgress: progress.currentProgress || 0,
        canClaim: !progress.completed && progress.currentProgress >= activity.targetValue
      }
    })
    
    return {
      success: true,
      data: activities
    }
  } catch (error) {
    console.error('获取活动列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
