// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { type, content, images = [] } = event
  
  // 验证必填字段
  if (!type || !content) {
    return {
      success: false,
      error: '类型和内容不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 调用内容安全检测
    console.log('[Submit Feedback] 开始内容安全检测...')
    const securityResult = await cloud.callFunction({
      name: 'content-security',
      data: {
        contentType: 'text',
        content: content,
        source: 'feedback'
      }
    })
    
    const detection = securityResult.result
    console.log('[Submit Feedback] 检测结果:', detection)
    
    // 根据检测结果进行三层处理
    if (detection.status === 'approved') {
      // ✅ 合规：直接写入并展示
      console.log('[Submit Feedback] 内容合规，直接提交')
      const result = await db.collection('feedback').add({
        data: {
          userId: wxContext.OPENID,
          type,
          content,
          images,
          status: 'visible',  // 直接可见
          reply: '',
          securityChecked: true,  // 标记已检测
          riskScore: detection.riskScore || 0.1,
          createdAt: now,
          updatedAt: now
        }
      })
      
      return {
        success: true,
        data: {
          id: result._id,
          message: '反馈提交成功',
          reviewStatus: 'approved'
        }
      }
      
    } else if (detection.status === 'rejected') {
      // ❌ 明确违规：直接拒绝
      console.log('[Submit Feedback] 内容违规，拒绝提交')
      
      // 记录到安全日志
      await db.collection('security_log').add({
        data: {
          type: 'feedback_rejected',
          userId: wxContext.OPENID,
          content: content,
          reason: detection.errmsg || '内容包含违规信息',
          riskScore: detection.riskScore || 1.0,
          createTime: now
        }
      })
      
      return {
        success: false,
        error: detection.errmsg || '内容包含违规信息，请修改后重试'
      }
      
    } else {
      // ⚠️ 疑似违规：写入审核池
      console.log('[Submit Feedback] 内容疑似违规，进入审核池')
      
      // 1. 写入pending集合（临时存储）
      const pendingResult = await db.collection('feedback_pending').add({
        data: {
          userId: wxContext.OPENID,
          type,
          content,
          images,
          status: 'pending',
          reply: '',
          securityChecked: true,
          riskScore: detection.riskScore || 0.85,
          securityResult: detection,
          createdAt: now,
          updatedAt: now
        }
      })
      
      // 2. 写入审核池
      await db.collection('content_review_pending').add({
        data: {
          contentId: pendingResult._id,
          contentType: 'text',
          content: content,
          source: 'feedback',
          originalCollection: 'feedback_pending',
          originalDocId: pendingResult._id,
          userId: wxContext.OPENID,
          status: 'pending',
          securityResult: detection,
          riskScore: detection.riskScore || 0.85,
          createTime: now,
          updateTime: now
        }
      })
      
      return {
        success: true,
        data: {
          id: pendingResult._id,
          message: '反馈已提交，等待审核',
          reviewStatus: 'pending'
        }
      }
    }
    
  } catch (error) {
    console.error('[Submit Feedback] 提交失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
