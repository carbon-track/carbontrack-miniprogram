// 云函数入口文件 - 验证用户
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 验证用户是否存在（用于登录状态检查）
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    // 查询用户
    const userRes = await db.collection('users').where({
      _openid: OPENID
    }).get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在',
        isValid: false
      }
    }

    const user = userRes.data[0]

    // 返回用户信息（不包含敏感信息）
    const { password, _openid, ...returnUserInfo } = user

    return {
      success: true,
      isValid: true,
      userInfo: returnUserInfo
    }
  } catch (error) {
    console.error('验证用户失败:', error)
    return {
      success: false,
      message: error.message || '验证失败',
      isValid: false
    }
  }
}
