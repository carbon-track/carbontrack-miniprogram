// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { announcementId } = event
  
  if (!announcementId) {
    return {
      success: false,
      error: '公告ID不能为空'
    }
  }
  
  try {
    // 查询公告详情
    const result = await db.collection('announcements')
      .doc(announcementId)
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
