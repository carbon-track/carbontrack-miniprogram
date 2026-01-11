/**
 * CloudBase API 封装
 * 统一管理 CloudBase 云函数调用
 */

const app = getApp()

/**
 * 调用云函数
 * @param {string} name - 云函数名称
 * @param {object} data - 传递给云函数的数据
 * @returns {Promise<object>} 云函数返回结果
 */
const callCloudFunction = async (name, data = {}) => {
  try {
    const response = await wx.cloud.callFunction({
      name,
      data
    })
    return response.result
  } catch (error) {
    console.error(`云函数调用失败 [${name}]:`, error)
    throw error
  }
}

// ==================== 认证相关 ====================

/**
 * 邮箱登录
 */
const emailLogin = async (email, password) => {
  return await callCloudFunction('email-login', { email, password })
}

/**
 * 微信登录
 */
const wxLogin = async (userInfo = {}, code = '') => {
  return await callCloudFunction('wx-login', { userInfo, code })
}

/**
 * 用户注册
 */
const register = async (email, username, password, verificationCode) => {
  return await callCloudFunction('register', {
    email,
    username,
    password,
    verificationCode
  })
}

/**
 * 获取用户信息
 */
const getUserInfo = async () => {
  return await callCloudFunction('get-user-info')
}

/**
 * 验证用户是否存在
 */
const verifyUser = async () => {
  return await callCloudFunction('verify-user')
}

// ==================== 碳足迹相关 ====================

/**
 * 保存碳足迹记录
 */
const saveCarbonRecord = async (data) => {
  return await callCloudFunction('save-carbon-record', data)
}

/**
 * 获取碳足迹记录列表
 */
const getCarbonRecords = async (params) => {
  return await callCloudFunction('get-carbon-records', params)
}

// ==================== 排行榜相关 ====================

/**
 * 获取排行榜
 */
const getRank = async (params) => {
  return await callCloudFunction('get-rank', params)
}

// ==================== 用户数据相关 ====================

/**
 * 更新用户资料
 */
const updateProfile = async (data) => {
  return await callCloudFunction('update-profile', data)
}

/**
 * 获取用户统计数据
 */
const getUserStats = async () => {
  return await callCloudFunction('get-user-stats')
}

// ==================== 活动相关 ====================

/**
 * 获取活动列表
 */
const getActivities = async (status = 'active') => {
  return await callCloudFunction('get-activities', { status })
}

/**
 * 获取成就列表
 */
const getAchievements = async () => {
  return await callCloudFunction('get-achievements')
}

/**
 * 获取交易记录
 */
const getTransactions = async (params) => {
  return await callCloudFunction('get-transactions', params)
}

/**
 * 获取公告列表
 */
const getAnnouncements = async () => {
  return await callCloudFunction('get-announcements')
}

/**
 * 获取学校列表
 */
const getSchools = async () => {
  return await callCloudFunction('get-schools')
}

/**
 * 获取FAQ列表
 */
const getFaq = async () => {
  return await callCloudFunction('get-faq')
}

/**
 * 获取余额
 */
const getBalance = async () => {
  return await callCloudFunction('get-balance')
}

// ==================== 积分商城相关 ====================

/**
 * 获取商品列表
 */
const getProducts = async (params = {}) => {
  return await callCloudFunction('get-products', params)
}

/**
 * 创建兑换订单
 */
const createExchangeOrder = async (data) => {
  return await callCloudFunction('create-exchange-order', data)
}

// ==================== 碳核算规则相关 ====================

/**
 * 获取碳核算规则列表
 */
const getCarbonRules = async (params = {}) => {
  return await callCloudFunction('get-carbon-rules', params)
}

// ==================== 激励奖励相关 ====================

/**
 * 检查激励奖励（连续奖励、特殊时段双倍）
 */
const checkIncentiveBonus = async (params = {}) => {
  return await callCloudFunction('check-incentive-bonus', params)
}

module.exports = {
  callCloudFunction,
  emailLogin,
  wxLogin,
  register,
  getUserInfo,
  saveCarbonRecord,
  getCarbonRecords,
  getRank,
  updateProfile,
  getUserStats,
  verifyUser,
  getActivities,
  getAchievements,
  getTransactions,
  getAnnouncements,
  getSchools,
  getFaq,
  getBalance,
  getProducts,
  createExchangeOrder,
  getCarbonRules,
  checkIncentiveBonus
}
