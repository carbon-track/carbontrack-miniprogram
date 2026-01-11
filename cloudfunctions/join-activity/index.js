// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { activityId } = event
  
  if (!activityId) {
    return {
      success: false,
      error: '活动ID不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 查询活动
    const activityResult = await db.collection('activities')
      .doc(activityId)
      .get()
    
    if (!activityResult.data) {
      return {
        success: false,
        error: '活动不存在'
      }
    }
    
    const activity = activityResult.data
    
    if (activity.status !== 'active') {
      return {
        success: false,
        error: '活动未开始或已结束'
      }
    }
    
    // 查询用户是否已参与
    const userResult = await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .field({ activityProgress: true })
      .get()
    
    if (userResult.data.length > 0) {
      const progress = userResult.data[0].activityProgress || {}
      if (progress[activityId]) {
        return {
          success: false,
          error: '您已参与该活动'
        }
      }
    }
    
    // 更新用户活动进度
    await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .update({
        data: {
          [`activityProgress.${activityId}`]: {
            completed: false,
            currentProgress: 0,
            joinedAt: now
          },
          updatedAt: now
        }
      })
    
    // 增加活动参与人数
    await db.collection('activities')
      .doc(activityId)
      .update({
        data: {
          participants: _.inc(1),
          updatedAt: now
        }
      })
    
    return {
      success: true,
      message: '活动参与成功'
    }
  } catch (error) {
    console.error('参与活动失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
