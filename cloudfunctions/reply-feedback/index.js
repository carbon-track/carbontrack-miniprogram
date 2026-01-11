// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { feedbackId, reply, status = 'replied' } = event
  
  if (!feedbackId || !reply) {
    return {
      success: false,
      error: '反馈ID和回复内容不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 查询反馈
    const feedbackResult = await db.collection('feedback')
      .doc(feedbackId)
      .get()
    
    if (!feedbackResult.data) {
      return {
        success: false,
        error: '反馈不存在'
      }
    }
    
    // 更新反馈
    await db.collection('feedback')
      .doc(feedbackId)
      .update({
        data: {
          reply,
          status,
          repliedAt: now,
          updatedAt: now
        }
      })
    
    // 发送回复通知给用户
    await db.collection('messages').add({
      data: {
        userId: feedbackResult.data.userId,
        type: 'feedback',
        title: '您的反馈已回复',
        content: reply,
        read: false,
        createdAt: now
      }
    })
    
    return {
      success: true,
      message: '反馈回复成功'
    }
  } catch (error) {
    console.error('回复反馈失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
