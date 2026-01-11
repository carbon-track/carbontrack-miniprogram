// 云函数入口文件 - 获取FAQ列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * 获取FAQ列表
 */
exports.main = async (event, context) => {
  try {
    const { category } = event

    // 构建查询条件
    const query = {
      status: 'active'
    }

    if (category && category !== 'all') {
      query.category = category
    }

    const result = await db.collection('faq')
      .where(query)
      .orderBy('sort', 'asc')
      .orderBy('createdAt', 'desc')
      .get()

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取FAQ列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
