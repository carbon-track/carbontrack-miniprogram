// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { activityId, incrementValue = 1 } = event
  
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
    
    // 查询用户活动进度
    const userResult = await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .field({ activityProgress: true })
      .get()
    
    if (userResult.data.length === 0) {
      return {
        success: false,
        error: '用户不存在'
      }
    }
    
    const user = userResult.data[0]
    const progress = user.activityProgress?.[activityId]
    
    if (!progress) {
      return {
        success: false,
        error: '请先参与该活动'
      }
    }
    
    if (progress.completed) {
      return {
        success: false,
        error: '该活动已完成'
      }
    }
    
    const newProgress = (progress.currentProgress || 0) + Number(incrementValue)
    const completed = newProgress >= activity.targetValue
    
    // 更新用户活动进度
    await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .update({
        data: {
          [`activityProgress.${activityId}.currentProgress`]: newProgress,
          [`activityProgress.${activityId}.completed`]: completed,
          [`activityProgress.${activityId}.updatedAt`]: now,
          updatedAt: now
        }
      })
    
    return {
      success: true,
      data: {
        currentProgress: newProgress,
        targetValue: activity.targetValue,
        completed,
        canClaim: completed
      },
      message: '进度更新成功'
    }
  } catch (error) {
    console.error('更新活动进度失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
