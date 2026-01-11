// 云函数入口文件 - 获取用户统计数据
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

/**
 * 获取用户统计数据
 */
exports.main = async (event, context) => {
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

    // 统计活动记录数
    const countRes = await db.collection('carbon_records')
      .where({
        userId: user._id
      })
      .count()

    // 计算用户等级（基于积分）
    let level = 1
    if (user.points >= 1000) level = 5
    else if (user.points >= 500) level = 4
    else if (user.points >= 200) level = 3
    else if (user.points >= 100) level = 2

    // 返回统计数据
    const { password, _openid: __openid, ...returnUser } = user

    return {
      success: true,
      stats: {
        ...returnUser,
        activityCount: countRes.total,
        level
      }
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
    return {
      success: false,
      message: error.message || '获取统计失败'
    }
  }
}
