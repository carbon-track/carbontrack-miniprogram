// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 获取用户信息
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    // 查询用户信息
    const userRes = await db.collection('users').where({
      _openid: OPENID
    }).get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = userRes.data[0]

    // 返回用户信息（不包含敏感信息）
    const { password, _openid, ...returnUserInfo } = user

    return {
      success: true,
      userInfo: returnUserInfo
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      success: false,
      message: error.message || '获取用户信息失败'
    }
  }
}
