// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 查询用户设置
    const result = await db.collection('user_settings')
      .where({ userId: wxContext.OPENID })
      .get()
    
    if (result.data.length === 0) {
      // 如果用户没有设置，返回默认设置
      return {
        success: true,
        data: {
          notificationEnabled: true,
          dailyReminder: true,
          reminderTime: '09:00',
          theme: 'light',
          language: 'zh-CN'
        }
      }
    }
    
    return {
      success: true,
      data: result.data[0].settings
    }
  } catch (error) {
    console.error('获取用户设置失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
