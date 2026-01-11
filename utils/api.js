/**
 * API请求封装工具
 * 统一处理API请求，添加错误处理和认证信息
 */

const app = getApp();

/**
 * 封装wx.request
 * @param {string} url - 请求路径
 * @param {object} options - 请求选项
 * @returns {Promise} 请求Promise
 */
const request = (url, options = {}) => {
  // 确保URL正确
  const fullUrl = url.startsWith('http') ? url : `${app.globalData.baseUrl}${url}`;
  
  // 获取token
  const token = wx.getStorageSync('token');
  
  // 设置默认请求头
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // 添加认证token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token过期或无效，清除token并跳转到登录页
          wx.removeStorageSync('token');
          app.globalData.isLogin = false;
          app.globalData.userInfo = null;
          
          // 提示用户重新登录
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000,
            success: () => {
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/login/login'
                });
              }, 2000);
            }
          });
          
          reject(new Error('登录已过期'));
        } else {
          // 其他错误
          const errorMessage = res.data?.message || `请求失败 (${res.statusCode})`;
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000
          });
          reject(new Error(errorMessage));
        }
      },
      fail: (error) => {
        // 网络请求失败
        wx.showToast({
          title: '网络连接失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        reject(error);
      },
      complete: () => {
        // 可以在这里处理请求完成后的逻辑，比如隐藏加载动画等
        if (options.complete) {
          options.complete();
        }
      }
    });
  });
};

/**
 * 上传文件
 * @param {string} url - 上传接口
 * @param {string} filePath - 文件路径
 * @param {string} name - 文件参数名
 * @param {object} formData - 其他表单数据
 * @returns {Promise} 上传Promise
 */
const uploadFile = (url, filePath, name = 'file', formData = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${app.globalData.baseUrl}${url}`;
  const token = wx.getStorageSync('token');
  
  const header = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            const errorMessage = data?.message || `上传失败 (${res.statusCode})`;
            wx.showToast({
              title: errorMessage,
              icon: 'none',
              duration: 2000
            });
            reject(new Error(errorMessage));
          }
        } catch (e) {
          wx.showToast({
            title: '上传失败，返回数据格式错误',
            icon: 'none',
            duration: 2000
          });
          reject(new Error('返回数据格式错误'));
        }
      },
      fail: (error) => {
        wx.showToast({
          title: '文件上传失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        reject(error);
      }
    });
  });
};

/**
 * 封装常用请求方法
 */
const api = {
  // GET请求
  get: (url, data = {}, options = {}) => {
    return request(url, { ...options, method: 'GET', data });
  },
  
  // POST请求
  post: (url, data = {}, options = {}) => {
    return request(url, { ...options, method: 'POST', data });
  },
  
  // PUT请求
  put: (url, data = {}, options = {}) => {
    return request(url, { ...options, method: 'PUT', data });
  },
  
  // DELETE请求
  delete: (url, data = {}, options = {}) => {
    return request(url, { ...options, method: 'DELETE', data });
  },
  
  // 上传文件
  upload: uploadFile
};

module.exports = {
  request,
  ...api
};