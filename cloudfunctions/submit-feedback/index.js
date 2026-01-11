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
    
    // 提交反馈
    const result = await db.collection('feedback').add({
      data: {
        userId: wxContext.OPENID,
        type,
        content,
        images,
        status: 'pending',
        reply: '',
        createdAt: now,
        updatedAt: now
      }
    })
    
    return {
      success: true,
      data: {
        id: result._id,
        message: '反馈提交成功'
      }
    }
  } catch (error) {
    console.error('提交反馈失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
