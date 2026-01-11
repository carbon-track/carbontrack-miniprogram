// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { messageId, deleteAll = false } = event
  
  try {
    if (deleteAll) {
      // 删除所有消息
      await db.collection('messages')
        .where({
          userId: wxContext.OPENID
        })
        .remove()
      
      return {
        success: true,
        message: '所有消息已删除'
      }
    } else {
      // 删除指定消息
      if (!messageId) {
        return {
          success: false,
          error: '消息ID不能为空'
        }
      }
      
      await db.collection('messages')
        .doc(messageId)
        .remove()
      
      return {
        success: true,
        message: '消息已删除'
      }
    }
  } catch (error) {
    console.error('删除消息失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
