/* cloudfunctions/get-wx-access-token/index.js */

const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 缓存access_token，避免频繁调用
let cachedToken = null;
let tokenExpireTime = 0;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  try {
    // 检查缓存是否有效（提前5分钟过期）
    if (cachedToken && Date.now() < tokenExpireTime) {
      console.log('使用缓存的access_token');
      return {
        access_token: cachedToken,
        fromCache: true,
        expireTime: tokenExpireTime
      };
    }
    
    // 从环境变量获取appId和appSecret
    const appId = process.env.WX_APPID;
    const appSecret = process.env.WX_APPSECRET;
    
    if (!appId || !appSecret) {
      throw new Error('未配置WX_APPID或WX_APPSECRET环境变量');
    }
    
    console.log('调用微信接口获取access_token...');
    
    // 调用微信接口获取access_token
    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`,
      { timeout: 5000 }
    );
    
    if (response.data.access_token) {
      // 缓存token（有效期7200秒，提前5分钟过期）
      cachedToken = response.data.access_token;
      tokenExpireTime = Date.now() + (7200 - 300) * 1000;
      
      console.log('access_token获取成功，有效期:', response.data.expires_in, '秒');
      
      return {
        access_token: cachedToken,
        fromCache: false,
        expireTime: tokenExpireTime
      };
    } else {
      throw new Error('获取access_token失败: ' + JSON.stringify(response.data));
    }
    
  } catch (error) {
    console.error('获取access_token失败:', error);
    
    return {
      errcode: -1,
      errmsg: '获取access_token失败: ' + error.message
    };
  }
};