// 云函数入口文件 - 获取学校列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * 获取学校列表
 */
exports.main = async (event, context) => {
  try {
    const result = await db.collection('schools')
      .where({
        status: 'active'
      })
      .orderBy('sort', 'asc')
      .orderBy('name', 'asc')
      .get()

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取学校列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
