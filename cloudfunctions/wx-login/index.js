// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 微信一键登录
 */
exports.main = async (event, context) => {
  const { userInfo, code } = event
  const wxContext = cloud.getWXContext()

  try {
    let openid = wxContext.OPENID
    let unionid = wxContext.UNIONID || ''
    if (code) {
      try {
        const res = await cloud.openapi.auth.code2Session({
          js_code: code,
          grant_type: 'authorization_code'
        })
        if (res && res.openid) {
          openid = res.openid
        }
        if (res && res.unionid) {
          unionid = res.unionid
        }
      } catch (e) {}
    }

    // 查询用户是否已存在
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()

    let userInfoData = {}
    let isNewUser = false

    if (userRes.data.length === 0) {
      // 新用户，创建用户记录
      isNewUser = true
      const createTime = db.serverDate()

      userInfoData = {
        _openid: openid,
        nickName: userInfo.nickName || '微信用户',
        avatarUrl: userInfo.avatarUrl || '',
        unionId: unionid || '',
        createTime,
        updateTime: createTime,
        totalCarbon: 0,
        points: 0,
        level: 1,
        isLogin: true,
        lastLoginTime: createTime
      }

      await db.collection('users').add({
        data: userInfoData
      })
    } else {
      // 已有用户，更新登录时间和用户信息
      userInfoData = userRes.data[0]
      await db.collection('users').doc(userInfoData._id).update({
        data: {
          nickName: userInfo.nickName || userInfoData.nickName,
          avatarUrl: userInfo.avatarUrl || userInfoData.avatarUrl,
          unionId: unionid || userInfoData.unionId || '',
          lastLoginTime: db.serverDate(),
          isLogin: true
        }
      })
    }

    // 返回用户信息（不包含 _openid）
    const { _openid, ...returnUserInfo } = userInfoData

    return {
      success: true,
      message: isNewUser ? '注册成功' : '登录成功',
      userInfo: returnUserInfo,
      isNewUser
    }
  } catch (error) {
    console.error('微信登录失败:', error)
    return {
      success: false,
      message: error.message || '登录失败，请稍后重试'
    }
  }
}
