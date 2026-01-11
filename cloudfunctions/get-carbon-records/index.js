// 云函数入口文件 - 获取碳足迹记录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

/**
 * 获取用户的碳足迹记录列表
 */
exports.main = async (event, context) => {
  const { page = 1, limit = 20, activityType } = event
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    // 查询用户（同时兼容 openid 和 _openid 字段）
    const userRes = await db.collection('users').where(
      _.or([
        { _openid: OPENID },
        { openid: OPENID }
      ])
    ).get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = userRes.data[0]

    // 构建查询条件
    const whereCondition = {
      userId: user._id
    }

    if (activityType && activityType !== 'all') {
      whereCondition.activityType = activityType
    }

    // 获取记录列表
    const recordsRes = await db.collection('carbon_records')
      .where(whereCondition)
      .orderBy('createTime', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()

    // 获取总数
    const countRes = await db.collection('carbon_records')
      .where(whereCondition)
      .count()

    return {
      success: true,
      records: recordsRes.data,
      total: countRes.total,
      page,
      limit,
      hasMore: page * limit < countRes.total
    }
  } catch (error) {
    console.error('获取碳足迹记录失败:', error)
    return {
      success: false,
      message: error.message || '获取记录失败'
    }
  }
}
