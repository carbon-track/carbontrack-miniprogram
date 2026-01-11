// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { type = 'all', page = 1, limit = 20 } = event
  
  try {
    const skip = (page - 1) * limit
    
    // 构建查询条件
    const query = {
      userId: wxContext.OPENID
    }
    
    if (type !== 'all') {
      query.type = type
    }
    
    // 查询消息列表
    const result = await db.collection('messages')
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)
      .get()
    
    // 查询总数
    const countResult = await db.collection('messages')
      .where(query)
      .count()
    
    // 查询未读消息数
    const unreadResult = await db.collection('messages')
      .where({
        userId: wxContext.OPENID,
        read: false
      })
      .count()
    
    return {
      success: true,
      data: result.data,
      total: countResult.total,
      unread: unreadResult.total,
      page,
      limit
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
