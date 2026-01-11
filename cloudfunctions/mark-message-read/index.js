// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { messageId, markAll = false } = event
  
  try {
    if (markAll) {
      // 标记所有消息为已读
      await db.collection('messages')
        .where({
          userId: wxContext.OPENID,
          read: false
        })
        .update({
          data: {
            read: true,
            readAt: new Date()
          }
        })
      
      return {
        success: true,
        message: '所有消息已标记为已读'
      }
    } else {
      // 标记指定消息为已读
      if (!messageId) {
        return {
          success: false,
          error: '消息ID不能为空'
        }
      }
      
      await db.collection('messages')
        .doc(messageId)
        .update({
          data: {
            read: true,
            readAt: new Date()
          }
        })
      
      return {
        success: true,
        message: '消息已标记为已读'
      }
    }
  } catch (error) {
    console.error('标记消息失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
