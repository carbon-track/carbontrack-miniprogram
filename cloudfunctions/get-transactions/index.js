// 云函数入口文件 - 获取交易记录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 获取用户的交易记录
 */
exports.main = async (event, context) => {
  const { page = 1, limit = 20, type } = event
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    // 查询用户
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

    // 获取用户积分
    const totalPoints = user.points || 0

    // 构建查询条件
    const whereCondition = {
      userId: user._id
    }

    if (type && type !== 'all') {
      whereCondition.type = type
    }

    // 获取交易记录
    const recordsRes = await db.collection('transactions')
      .where(whereCondition)
      .orderBy('createTime', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()

    // 获取总数
    const countRes = await db.collection('transactions')
      .where(whereCondition)
      .count()

    return {
      success: true,
      totalPoints,
      transactions: recordsRes.data,
      total: countRes.total,
      page,
      limit,
      hasMore: page * limit < countRes.total
    }
  } catch (error) {
    console.error('获取交易记录失败:', error)
    return {
      success: false,
      message: error.message || '获取记录失败'
    }
  }
}
