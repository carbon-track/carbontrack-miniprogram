const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 检测结果分级
const SECURITY_LEVEL = {
  APPROVED: 'approved',    // 合规：直接展示
  REJECTED: 'rejected',    // 明确违规：直接拦截
  SUSPECTED: 'suspected'   // 疑似违规：进入审核池
}

// 风险阈值
const RISK_THRESHOLD = {
  APPROVED: 0.8,    // 风险值 < 0.8 为合规
  REJECTED: 0.95    // 风险值 > 0.95 为明确违规
}

exports.main = async (event, context) => {
  const { contentType, content, source = 'unknown' } = event
  const wxContext = cloud.getWXContext()

  try {
    console.log(`[Content Security] 开始检测 - 类型: ${contentType}, 来源: ${source}`)

    // 参数验证
    if (!contentType || !content) {
      throw new Error('缺少必要参数：contentType 和 content')
    }

    if (!['text', 'image'].includes(contentType)) {
      throw new Error('contentType 必须是 text 或 image')
    }

    // 获取 AccessToken
    const tokenResult = await cloud.callFunction({
      name: 'get-wx-access-token',
      data: {}
    })

    if (!tokenResult.result || !tokenResult.result.access_token) {
      throw new Error('获取 access_token 失败: ' + JSON.stringify(tokenResult.result))
    }

    const accessToken = tokenResult.result.access_token

    // 根据内容类型调用不同的检测接口
    let detectionResult
    if (contentType === 'text') {
      detectionResult = await checkTextSecurity(accessToken, content)
    } else if (contentType === 'image') {
      detectionResult = await checkImageSecurity(accessToken, content)
    }

    console.log(`[Content Security] 检测结果: ${JSON.stringify(detectionResult)}`)

    return {
      ...detectionResult,
      requestId: wxContext.requestId,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('[Content Security] 检测失败:', error)
    
    // 检测失败时，视为疑似违规（安全优先原则）
    return {
      status: SECURITY_LEVEL.SUSPECTED,
      errcode: -1,
      errmsg: `检测失败: ${error.message}`,
      riskScore: 0.9,
      requestId: wxContext.requestId,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 文本内容安全检测
 * @param {string} accessToken - 微信access_token
 * @param {string} text - 待检测文本
 * @returns {object} 检测结果
 */
async function checkTextSecurity(accessToken, text) {
  try {
    console.log(`[Text Check] 检测文本: ${text.substring(0, 50)}...`)

    const response = await axios.post(
      `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`,
      { content: text },
      { timeout: 5000 }
    )

    const result = response.data

    // 根据返回码判断结果
    if (result.errcode === 0) {
      // 合规
      return {
        status: SECURITY_LEVEL.APPROVED,
        errcode: 0,
        errmsg: 'ok',
        riskScore: 0.1,
        riskType: null
      }
    } else if (result.errcode === 87014) {
      // 明确违规
      return {
        status: SECURITY_LEVEL.REJECTED,
        errcode: 87014,
        errmsg: result.errmsg || '内容包含违规信息',
        riskScore: 1.0,
        riskType: 'forbidden'
      }
    } else {
      // 其他情况视为疑似违规
      return {
        status: SECURITY_LEVEL.SUSPECTED,
        errcode: result.errcode,
        errmsg: result.errmsg || '内容疑似违规',
        riskScore: 0.85,
        riskType: 'suspected'
      }
    }

  } catch (error) {
    console.error('[Text Check] 检测异常:', error)
    throw error
  }
}

/**
 * 图片内容安全检测
 * @param {string} accessToken - 微信access_token
 * @param {string} fileID - 云存储文件ID
 * @returns {object} 检测结果
 */
async function checkImageSecurity(accessToken, fileID) {
  try {
    console.log(`[Image Check] 检测图片: ${fileID}`)

    // 从云存储下载文件
    const downloadResult = await cloud.downloadFile({
      fileID: fileID
    })

    const buffer = downloadResult.fileContent

    // 构建 form-data
    const FormData = require('form-data')
    const formData = new FormData()
    formData.append('media', buffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    })

    // 调用微信图片检测接口
    const response = await axios.post(
      `https://api.weixin.qq.com/wxa/img_sec_check?access_token=${accessToken}`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 10000
      }
    )

    const result = response.data

    // 根据返回码判断结果
    if (result.errcode === 0) {
      // 合规
      return {
        status: SECURITY_LEVEL.APPROVED,
        errcode: 0,
        errmsg: 'ok',
        riskScore: 0.1,
        riskType: null
      }
    } else if (result.errcode === 87014) {
      // 明确违规
      return {
        status: SECURITY_LEVEL.REJECTED,
        errcode: 87014,
        errmsg: result.errmsg || '图片包含违规内容',
        riskScore: 1.0,
        riskType: 'forbidden'
      }
    } else {
      // 其他情况视为疑似违规
      return {
        status: SECURITY_LEVEL.SUSPECTED,
        errcode: result.errcode,
        errmsg: result.errmsg || '图片疑似违规',
        riskScore: 0.85,
        riskType: 'suspected'
      }
    }

  } catch (error) {
    console.error('[Image Check] 检测异常:', error)
    throw error
  }
}
