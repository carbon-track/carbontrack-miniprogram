// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { title, content, type, isTop = false } = event
  
  // 验证必填字段
  if (!title || !content || !type) {
    return {
      success: false,
      error: '标题、内容和类型不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 创建公告
    const result = await db.collection('announcements').add({
      data: {
        title,
        content,
        type,
        isTop: Boolean(isTop),
        status: 'published',
        createdAt: now,
        updatedAt: now
      }
    })
    
    return {
      success: true,
      data: {
        id: result._id,
        message: '公告创建成功'
      }
    }
  } catch (error) {
    console.error('创建公告失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
