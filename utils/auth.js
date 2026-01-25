/**
 * 认证工具
 * 处理用户登录、注册和会话管理
 * 已完全迁移到 CloudBase
 */

const app = getApp();
const { emailLogin, wxLogin: cloudWxLogin, register: cloudRegister } = require('./cloud-api.js');

/**
 * 用户登录（邮箱）
 * @param {string} email - 用户邮箱
 * @param {string} password - 用户密码
 * @returns {Promise<Object>} 登录结果
 */
const login = async (email, password) => {
  try {
    const result = await emailLogin(email, password);

    if (result.success) {
      // 保存用户信息
      wx.setStorageSync('userInfo', result.userInfo);

      // 更新全局状态
      app.globalData.isLogin = true;
      app.globalData.userInfo = result.userInfo;
    }

    return result;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

/**
 * 用户注册
 * @param {string} email - 用户邮箱
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} verificationCode - 验证码
 * @returns {Promise<Object>} 注册结果
 */
const register = async (email, username, password, verificationCode) => {
  try {
    const result = await cloudRegister(email, username, password, verificationCode);

    if (result.success) {
      // 保存用户信息
      wx.setStorageSync('userInfo', result.userInfo);

      // 更新全局状态
      app.globalData.isLogin = true;
      app.globalData.userInfo = result.userInfo;
    }

    return result;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

/**
 * 用户登出
 */
const logout = () => {
  // 清除本地存储（CloudBase 不需要 token）
  wx.removeStorageSync('userInfo');

  // 更新全局状态
  app.globalData.isLogin = false;
  app.globalData.userInfo = null;

  // 跳转到登录页
  wx.redirectTo({
    url: '/pages/login/login'
  });
};

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息或null
 */
const getCurrentUser = () => {
  return app.globalData.userInfo || wx.getStorageSync('userInfo') || null;
};

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
const isLoggedIn = () => {
  return app.globalData.isLogin || !!wx.getStorageSync('userInfo');
};

/**
 * 更新用户信息
 * @param {Object} userInfo - 新的用户信息
 */
const updateUserInfo = (userInfo) => {
  // 合并新的用户信息
  const currentUser = getCurrentUser() || {};
  const updatedUser = { ...currentUser, ...userInfo };

  // 更新存储和全局状态
  wx.setStorageSync('userInfo', updatedUser);
  app.globalData.userInfo = updatedUser;

  return updatedUser;
};

/**
 * 跳转到登录页（如果未登录）
 * @param {string} redirectUrl - 登录成功后重定向的URL
 * @returns {boolean} 是否已登录
 */
const requireAuth = async (redirectUrl) => {
  if (!isLoggedIn()) {
    wx.redirectTo({
      url: `/pages/login/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
    });
    return false;
  }

  // 验证云端用户是否存在
  try {
    const { verifyUser } = require('./cloud-api.js');
    const result = await verifyUser();

    if (!result.success || !result.isValid) {
      // 用户不存在，清除本地数据并跳转登录页
      wx.removeStorageSync('userInfo');
      app.globalData.isLogin = false;
      app.globalData.userInfo = null;

      wx.redirectTo({
        url: `/pages/login/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
      });
      return false;
    }

    // 更新本地用户信息
    if (result.userInfo) {
      wx.setStorageSync('userInfo', result.userInfo);
      app.globalData.userInfo = result.userInfo;
    }

    return true;
  } catch (error) {
    console.error('验证用户失败:', error);
    // 验证失败，允许继续使用本地缓存数据
    return true;
  }
};

/**
 * 微信一键登录
 * @returns {Promise<Object>} 登录结果
 */
const wxLogin = async (userInfo = {}, code = '') => {
  try {
    const result = await cloudWxLogin(userInfo, code);

    if (result.success) {
      // 保存用户信息
      wx.setStorageSync('userInfo', result.userInfo);

      // 更新全局状态
      app.globalData.isLogin = true;
      app.globalData.userInfo = result.userInfo;
    }

    return result;
  } catch (error) {
    console.error('微信登录失败:', error);
    throw error;
  }
};

/**
 * 获取用户授权信息（可选功能）
 * @returns {Promise<Object>} 用户信息
 */
const getUserProfile = async () => {
  try {
    // 首先尝试使用 getUserProfile（已弃用但向后兼容）
    if (wx.getUserProfile) {
      const { userInfo } = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: resolve,
          fail: reject
        });
      });
      return userInfo;
    } else {
      // 如果 getUserProfile 不存在，返回空对象，让用户后续在个人中心完善
      return {
        nickName: '',
        avatarUrl: ''
      };
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 不抛出错误，允许静默失败
    return {
      nickName: '',
      avatarUrl: ''
    };
  }
};

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
};
