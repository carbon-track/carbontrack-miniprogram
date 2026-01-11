// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { name, description, type, targetValue, rewardPoints, startDate, endDate, image, sort = 0 } = event
  
  // 验证必填字段
  if (!name || !type || !targetValue || !rewardPoints) {
    return {
      success: false,
      error: '活动名称、类型、目标和奖励积分不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 创建活动
    const result = await db.collection('activities').add({
      data: {
        name,
        description: description || '',
        type,
        targetValue: Number(targetValue),
        rewardPoints: Number(rewardPoints),
        startDate: startDate ? new Date(startDate) : now,
        endDate: endDate ? new Date(endDate) : null,
        image: image || '',
        sort: Number(sort),
        status: 'active',
        participants: 0,
        completions: 0,
        createdAt: now,
        updatedAt: now
      }
    })
    
    return {
      success: true,
      data: {
        id: result._id,
        message: '活动创建成功'
      }
    }
  } catch (error) {
    console.error('创建活动失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
