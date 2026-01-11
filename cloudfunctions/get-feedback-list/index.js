// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { status = 'all', page = 1, limit = 20 } = event
  
  try {
    const skip = (page - 1) * limit
    
    // 构建查询条件
    const query = {}
    if (status !== 'all') {
      query.status = status
    }
    
    // 查询反馈列表
    const result = await db.collection('feedback')
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)
      .get()
    
    // 查询总数
    const countResult = await db.collection('feedback')
      .where(query)
      .count()
    
    return {
      success: true,
      data: result.data,
      total: countResult.total,
      page,
      limit
    }
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
