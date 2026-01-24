// 云函数入口文件 - 保存碳足迹记录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 保存碳足迹记录
 */
exports.main = async (event, context) => {
  const { activityType, activityDetail, carbonValue, points, date, description, imageUrl } = event
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    // 查询用户信息（同时兼容 openid 和 _openid 字段）
    const userRes = await db.collection('users').where(
      _.or([
        { _openid: OPENID },
        { openid: OPENID }
      ])
    ).get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = userRes.data[0]

    // 添加碳足迹记录
    const recordData = {
      userId: user._id,
      openid: OPENID,
      activityType,
      activityDetail,
      carbonValue: parseFloat(carbonValue) || 0,
      points: parseInt(points) || 0,
      date,
      description,
      imageUrl: imageUrl || '', // 确保imageUrl字段存在
      createTime: db.serverDate()
    }

    console.log('保存记录数据:', JSON.stringify(recordData)) // 添加日志

    const addRes = await db.collection('carbon_records').add({
      data: recordData
    })

    // 更新用户统计数据
    const newTotalCarbon = (user.totalCarbon || 0) + (parseFloat(carbonValue) || 0)
    const newPoints = (user.points || 0) + (parseInt(points) || 0)

    await db.collection('users').doc(user._id).update({
      data: {
        totalCarbon: newTotalCarbon,
        points: newPoints,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      message: '记录保存成功',
      recordId: addRes._id,
      totalCarbon: newTotalCarbon,
      points: newPoints
    }
  } catch (error) {
    console.error('保存碳足迹记录失败:', error)
    return {
      success: false,
      message: error.message || '保存失败，请稍后重试'
    }
  }
}
