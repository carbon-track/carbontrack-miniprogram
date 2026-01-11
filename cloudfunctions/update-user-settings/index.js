// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { notificationEnabled, dailyReminder, reminderTime, theme, language } = event
  
  try {
    const now = new Date()
    
    // 构建设置对象
    const settings = {}
    if (notificationEnabled !== undefined) settings.notificationEnabled = Boolean(notificationEnabled)
    if (dailyReminder !== undefined) settings.dailyReminder = Boolean(dailyReminder)
    if (reminderTime !== undefined) settings.reminderTime = reminderTime
    if (theme !== undefined) settings.theme = theme
    if (language !== undefined) settings.language = language
    
    // 查询用户设置
    const result = await db.collection('user_settings')
      .where({ userId: wxContext.OPENID })
      .get()
    
    if (result.data.length === 0) {
      // 创建新设置
      await db.collection('user_settings').add({
        data: {
          userId: wxContext.OPENID,
          settings,
          createdAt: now,
          updatedAt: now
        }
      })
    } else {
      // 更新现有设置
      await db.collection('user_settings')
        .doc(result.data[0]._id)
        .update({
          data: {
            settings,
            updatedAt: now
          }
        })
    }
    
    return {
      success: true,
      message: '设置更新成功'
    }
  } catch (error) {
    console.error('更新用户设置失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
