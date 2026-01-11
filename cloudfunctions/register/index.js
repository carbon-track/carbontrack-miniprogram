// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 用户注册
 */
exports.main = async (event, context) => {
  const { email, username, password, verificationCode } = event
  const wxContext = cloud.getWXContext()

  console.log('注册请求:', { email, username })
  console.log('微信上下文:', {
    OPENID: wxContext.OPENID,
    APPID: wxContext.APPID,
    UNIONID: wxContext.UNIONID
  })

  try {
    // 验证验证码（这里简化处理，实际应该验证验证码）
    // 可以从验证码集合中查找对应的验证码

    // 检查邮箱是否已注册
    const emailRes = await db.collection('users').where({
      email: email
    }).get()

    if (emailRes.data.length > 0) {
      console.log('邮箱已注册:', email)
      return {
        success: false,
        message: '该邮箱已被注册'
      }
    }

    // 创建新用户
    const createTime = db.serverDate()

    // 使用 openid 或生成一个唯一的标识符
    // 在模拟器中没有 openid，使用 email 作为标识
    const openid = wxContext.OPENID || email

    console.log('使用的 openid:', openid)
    console.log('wxContext.OPENID:', wxContext.OPENID)

    const newUser = {
      _openid: openid, // 邮箱用户也需要 openid 字段
      email,
      nickName: username,
      password,
      createTime,
      updateTime: createTime,
      totalCarbon: 0,
      points: 0,
      level: 1,
      isLogin: true,
      lastLoginTime: createTime
    }

    console.log('准备创建用户:', { email: newUser.email, _openid: newUser._openid })

    const addRes = await db.collection('users').add({
      data: newUser
    })

    console.log('用户创建成功:', addRes._id || addRes.id)

    // 返回用户信息（不包含密码）
    const { password: _, openid: __, _openid: ___, ...returnUserInfo } = newUser

    return {
      success: true,
      message: '注册成功',
      userInfo: {
        ...returnUserInfo,
        _id: addRes._id || addRes.id
      }
    }
  } catch (error) {
    console.error('注册失败:', error)
    return {
      success: false,
      message: error.message || '注册失败，请稍后重试'
    }
  }
}
