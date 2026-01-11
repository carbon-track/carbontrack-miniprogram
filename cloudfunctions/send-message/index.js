// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { userId, type, title, content } = event
  
  // 验证必填字段
  if (!userId || !type || !title || !content) {
    return {
      success: false,
      error: '用户ID、类型、标题和内容不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 发送消息
    const result = await db.collection('messages').add({
      data: {
        userId,
        type,
        title,
        content,
        read: false,
        createdAt: now
      }
    })
    
    return {
      success: true,
      data: {
        id: result._id,
        message: '消息发送成功'
      }
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
