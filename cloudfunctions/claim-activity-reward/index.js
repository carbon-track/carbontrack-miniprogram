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
    
    // 查询用户活动进度
    const userResult = await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .field({ activityProgress: true, points: true })
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
        error: '奖励已领取'
      }
    }
    
    if ((progress.currentProgress || 0) < activity.targetValue) {
      return {
        success: false,
        error: '活动目标尚未达成'
      }
    }
    
    // 奖励积分
    const newBalance = (user.points || 0) + activity.rewardPoints
    await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .update({
        data: {
          points: newBalance,
          totalPointsEarned: _.inc(activity.rewardPoints),
          [`activityProgress.${activityId}.completed`]: true,
          [`activityProgress.${activityId}.claimedAt`]: now,
          updatedAt: now
        }
      })
    
    // 记录交易
    await db.collection('transactions').add({
      data: {
        userId: wxContext.OPENID,
        type: 'earn',
        amount: activity.rewardPoints,
        balance: newBalance,
        description: `完成活动: ${activity.name}`,
        referenceType: 'activity',
        referenceId: activityId,
        createdAt: now
      }
    })
    
    // 增加活动完成人数
    await db.collection('activities')
      .doc(activityId)
      .update({
        data: {
          completions: _.inc(1),
          updatedAt: now
        }
      })
    
    // 发送活动完成通知
    await db.collection('messages').add({
      data: {
        userId: wxContext.OPENID,
        type: 'activity',
        title: '活动完成！',
        content: `恭喜您完成「${activity.name}」活动，获得 ${activity.rewardPoints} 积分奖励！`,
        read: false,
        createdAt: now
      }
    })
    
    return {
      success: true,
      data: {
        rewardPoints: activity.rewardPoints,
        balance: newBalance
      },
      message: '奖励领取成功'
    }
  } catch (error) {
    console.error('领取活动奖励失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
