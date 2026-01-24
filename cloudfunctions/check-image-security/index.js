/* cloudfunctions/check-image-security/index.js */

const cloud = require('wx-server-sdk');
const axios = require('axios');
const FormData = require('form-data');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const { fileID } = event;
  const wxContext = cloud.getWXContext();
  
  try {
    // 从云存储下载文件
    console.log('开始下载文件:', fileID);
    const res = await cloud.downloadFile({
      fileID: fileID
    });
    
    const buffer = res.fileContent;
    console.log('文件下载成功，大小:', buffer.length);
    
    // 获取access_token
    console.log('获取access_token...');
    const tokenResult = await cloud.callFunction({
      name: 'get-wx-access-token',
      data: {}
    });
    
    if (!tokenResult.result || !tokenResult.result.access_token) {
      throw new Error('获取access_token失败: ' + JSON.stringify(tokenResult.result));
    }
    
    const accessToken = tokenResult.result.access_token;
    console.log('access_token获取成功');
    
    // 构建form-data
    const formData = new FormData();
    formData.append('media', buffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    });
    
    // 调用微信图片检测API
    console.log('调用微信图片检测API...');
    const checkResult = await axios.post(
      `https://api.weixin.qq.com/wxa/img_sec_check?access_token=${accessToken}`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 10000 // 10秒超时
      }
    );
    
    console.log('检测结果:', checkResult.data);
    
    return {
      errcode: checkResult.data.errcode,
      errmsg: checkResult.data.errmsg
    };
    
  } catch (error) {
    console.error('图片检测失败:', error);
    
    // API调用失败时，返回错误码，前端应拒绝发布
    return {
      errcode: -1,
      errmsg: '检测服务异常: ' + error.message
    };
  }
};