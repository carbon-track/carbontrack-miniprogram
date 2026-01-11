// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { category = 'all', status = 'active' } = event
  
  try {
    // 构建查询条件
    const query = {
      status: status
    }
    
    if (category !== 'all') {
      query.category = category
    }
    
    // 查询商品列表
    const result = await db.collection('products')
      .where(query)
      .orderBy('sort', 'asc')
      .orderBy('createdAt', 'desc')
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
