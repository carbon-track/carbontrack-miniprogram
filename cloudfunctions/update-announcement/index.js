// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { announcementId, title, content, type, isTop, status } = event
  
  if (!announcementId) {
    return {
      success: false,
      error: '公告ID不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 构建更新数据
    const updateData = { updatedAt: now }
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (type !== undefined) updateData.type = type
    if (isTop !== undefined) updateData.isTop = Boolean(isTop)
    if (status !== undefined) updateData.status = status
    
    // 更新公告
    await db.collection('announcements')
      .doc(announcementId)
      .update({
        data: updateData
      })
    
    return {
      success: true,
      message: '公告更新成功'
    }
  } catch (error) {
    console.error('更新公告失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
