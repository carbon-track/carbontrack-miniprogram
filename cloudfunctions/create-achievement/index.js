// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { name, description, category, points, icon, condition, sort = 0 } = event
  
  // 验证必填字段
  if (!name || !category || !points || !condition) {
    return {
      success: false,
      error: '成就名称、分类、积分和条件不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 创建成就
    const result = await db.collection('achievements').add({
      data: {
        name,
        description: description || '',
        category,
        points: Number(points),
        icon: icon || '',
        condition,
        sort: Number(sort),
        status: 'active',
        createdAt: now,
        updatedAt: now
      }
    })
    
    return {
      success: true,
      data: {
        id: result._id,
        message: '成就创建成功'
      }
    }
  } catch (error) {
    console.error('创建成就失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
