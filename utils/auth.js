/**
 * 认证：网站 JWT + 邮箱注册登录；微信登录仍走云函数桥接。
 */

const app = getApp()
const {
  emailLogin,
  wxLogin: cloudWxLogin,
  register: apiRegister
} = require('./cloud-api.js')
const { post } = require('./api.js')

const login = async (email, password) => {
  try {
    const result = await emailLogin(email, password)

    if (result.success && result.userInfo) {
      wx.setStorageSync('userInfo', result.userInfo)
      app.globalData.isLogin = true
      app.globalData.userInfo = result.userInfo
    }

    return result
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

/**
 * register(payload对象) 或 register(email, username, password, verificationCode?, extra?)
 */
const register = async (email, username, password, verificationCode, extra) => {
  try {
    let payload
    if (email && typeof email === 'object') {
      payload = email
    } else {
      const ex = extra || {}
      payload = {
        email,
        username,
        password,
        confirmPassword: ex.confirmPassword || password,
        schoolId: ex.schoolId,
        newSchoolName: ex.newSchoolName,
        countryCode: ex.countryCode || 'CN',
        stateCode: ex.stateCode || 'BJ',
        verificationCode
      }
    }

    const result = await apiRegister(payload)

    if (result.success && result.userInfo) {
      wx.setStorageSync('userInfo', result.userInfo)
      app.globalData.isLogin = true
      app.globalData.userInfo = result.userInfo
    }

    return result
  } catch (error) {
    console.error('注册失败:', error)
    throw error
  }
}

const logout = () => {
  post('/api/v1/auth/logout', {}, { silent: true }).catch(() => {})

  wx.removeStorageSync('userInfo')
  wx.removeStorageSync('token')

  app.globalData.isLogin = false
  app.globalData.userInfo = null

  wx.redirectTo({
    url: '/pages/login/login'
  })
}

const getCurrentUser = () => {
  return app.globalData.userInfo || wx.getStorageSync('userInfo') || null
}

const isLoggedIn = () => {
  return app.globalData.isLogin || !!wx.getStorageSync('userInfo')
}

const updateUserInfo = (userInfo) => {
  const currentUser = getCurrentUser() || {}
  const updatedUser = { ...currentUser, ...userInfo }

  wx.setStorageSync('userInfo', updatedUser)
  app.globalData.userInfo = updatedUser

  return updatedUser
}

const requireAuth = async (redirectUrl) => {
  if (!isLoggedIn()) {
    wx.redirectTo({
      url: `/pages/login/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
    })
    return false
  }

  const token = wx.getStorageSync('token')
  if (!token) {
    return true
  }

  try {
    const { verifyUser } = require('./cloud-api.js')
    const result = await verifyUser()

    if (!result.success || !result.isValid) {
      wx.removeStorageSync('userInfo')
      wx.removeStorageSync('token')
      app.globalData.isLogin = false
      app.globalData.userInfo = null

      wx.redirectTo({
        url: `/pages/login/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
      })
      return false
    }

    if (result.userInfo) {
      wx.setStorageSync('userInfo', result.userInfo)
      app.globalData.userInfo = result.userInfo
    }

    return true
  } catch (error) {
    console.error('验证用户失败:', error)
    return true
  }
}

const wxLogin = async (userInfo = {}, code = '') => {
  try {
    const result = await cloudWxLogin(userInfo, code)

    if (result.success) {
      wx.setStorageSync('userInfo', result.userInfo)

      app.globalData.isLogin = true
      app.globalData.userInfo = result.userInfo
    }

    return result
  } catch (error) {
    console.error('微信登录失败:', error)
    throw error
  }
}

const getUserProfile = async () => {
  try {
    if (wx.getUserProfile) {
      const { userInfo } = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: resolve,
          fail: reject
        })
      })
      return userInfo
    }
    return {
      nickName: '',
      avatarUrl: ''
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      nickName: '',
      avatarUrl: ''
    }
  }
}

module.exports = {
  login,
  register,
  logout,
  getCurrentUser,
  isLoggedIn,
  updateUserInfo,
  requireAuth,
  wxLogin,
  getUserProfile
}
