// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 邮箱密码登录
 */
exports.main = async (event, context) => {
  const { email, password } = event

  try {
    console.log('邮箱登录请求:', { email, password: '***' })

    // 查询用户
    const userRes = await db.collection('users').where({
      email: email
    }).get()

    console.log('查询结果:', userRes.data.length)

    if (userRes.data.length === 0) {
      console.log('用户不存在')
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = userRes.data[0]
    console.log('找到用户:', { email: user.email, hasPassword: !!user.password })

    // 验证密码
    if (user.password !== password) {
      console.log('密码错误')
      return {
        success: false,
        message: '密码错误'
      }
    }

    // 更新登录时间和状态
    await db.collection('users').doc(user._id).update({
      data: {
        lastLoginTime: db.serverDate(),
        isLogin: true
      }
    })

    // 返回用户信息（不包含密码）
    const { password: _, openid: __, _openid: ___, ...returnUserInfo } = user

    console.log('登录成功，返回用户信息:', { nickName: returnUserInfo.nickName })

    return {
      success: true,
      message: '登录成功',
      userInfo: returnUserInfo
    }
  } catch (error) {
    console.error('邮箱登录失败:', error)
    return {
      success: false,
      message: error.message || '登录失败，请稍后重试'
    }
  }
}
