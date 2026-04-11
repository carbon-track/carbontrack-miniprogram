/**
 * 网站 API（OpenAPI /api/v1）HTTP 封装
 */

function getBaseUrl() {
  try {
    const app = getApp()
    const g = app && app.globalData
    return (g && (g.apiBaseUrl || g.baseUrl)) || ''
  } catch (e) {
    return ''
  }
}

function pickErrorMessage(data, statusCode) {
  if (!data || typeof data !== 'object') return `请求失败 (${statusCode})`
  return (
    data.message ||
    data.error ||
    data.detail ||
    (data.errors && JSON.stringify(data.errors)) ||
    `请求失败 (${statusCode})`
  )
}

function isAuthPublicPath(url) {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/send-verification-code')
  )
}

/**
 * @param {string} url - 绝对地址或以 / 开头的路径（相对 apiBaseUrl）
 * @param {object} options
 * @param {boolean} [options.skipAuth] - 不附加 Bearer
 * @param {boolean} [options.silent] - 失败时不自动 toast
 * @param {object} [options.headers] - 额外请求头
 */
const request = (url, options = {}) => {
  const base = getBaseUrl()
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`

  const token = options.skipAuth ? '' : wx.getStorageSync('token')

  const headers = {
    'Content-Type': 'application/json',
    'X-Client': 'miniprogram',
    ...options.headers
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    if (!base && !url.startsWith('http')) {
      const err = new Error('未配置 apiBaseUrl')
      if (!options.silent) {
        wx.showToast({ title: err.message, icon: 'none' })
      }
      reject(err)
      return
    }

    wx.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      success: (res) => {
        const ok = res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204
        if (ok) {
          resolve(res.statusCode === 204 ? { success: true } : res.data)
          return
        }

        if (res.statusCode === 401 && !isAuthPublicPath(fullUrl)) {
          wx.removeStorageSync('token')
          try {
            const app = getApp()
            if (app && app.globalData) {
              app.globalData.isLogin = false
              app.globalData.userInfo = null
            }
          } catch (e) {}
          wx.removeStorageSync('userInfo')
          if (!options.silent) {
            wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none',
              duration: 2000,
              success: () => {
                setTimeout(() => {
                  wx.navigateTo({ url: '/pages/login/login' })
                }, 2000)
              }
            })
          }
          reject(new Error('登录已过期'))
          return
        }

        const msg = pickErrorMessage(res.data, res.statusCode)
        if (!options.silent) {
          wx.showToast({ title: msg.length > 48 ? '请求失败' : msg, icon: 'none', duration: 2000 })
        }
        reject(new Error(msg))
      },
      fail: (error) => {
        if (!options.silent) {
          wx.showToast({ title: '网络连接失败，请稍后重试', icon: 'none', duration: 2000 })
        }
        reject(error)
      },
      complete: () => {
        if (options.complete) options.complete()
      }
    })
  })
}

/**
 * multipart 上传（如 /api/v1/files/upload）
 */
const uploadFile = (url, filePath, name = 'file', formData = {}, options = {}) => {
  const base = getBaseUrl()
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`
  const token = wx.getStorageSync('token')

  const header = {
    'X-Client': 'miniprogram',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.header || {})
  }

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(data)
            return
          }
          const msg = pickErrorMessage(data, res.statusCode)
          if (!options.silent) {
            wx.showToast({ title: msg.length > 48 ? '上传失败' : msg, icon: 'none' })
          }
          reject(new Error(msg))
        } catch (e) {
          if (!options.silent) {
            wx.showToast({ title: '上传返回格式错误', icon: 'none' })
          }
          reject(new Error('上传返回格式错误'))
        }
      },
      fail: (error) => {
        if (!options.silent) {
          wx.showToast({ title: '文件上传失败', icon: 'none' })
        }
        reject(error)
      }
    })
  })
}

const api = {
  get: (url, data = {}, options = {}) => request(url, { ...options, method: 'GET', data }),
  post: (url, data = {}, options = {}) => request(url, { ...options, method: 'POST', data }),
  put: (url, data = {}, options = {}) => request(url, { ...options, method: 'PUT', data }),
  delete: (url, data = {}, options = {}) => request(url, { ...options, method: 'DELETE', data }),
  upload: uploadFile
}

module.exports = {
  request,
  getBaseUrl,
  ...api
}
