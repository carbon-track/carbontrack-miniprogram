// 初始化用户数据字段
// 运行方式：在 CloudBase 控制台 -> 云函数 -> 创建云函数 -> 粘贴此代码并部署运行

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    console.log('开始初始化用户数据字段...')
    
    // 获取所有用户
    const users = await db.collection('users').get()
    console.log(`找到 ${users.data.length} 个用户`)
    
    let updatedCount = 0
    
    // 遍历每个用户，添加缺失的字段
    for (const user of users.data) {
      const updateData = {}
      
      // 如果缺少 totalCarbon 字段，初始化为 0
      if (user.totalCarbon === undefined) {
        updateData.totalCarbon = 0
      }
      
      // 如果缺少 points 字段，初始化为 0
      if (user.points === undefined) {
        updateData.points = 0
      }
      
      // 如果有需要更新的字段
      if (Object.keys(updateData).length > 0) {
        await db.collection('users').doc(user._id).update({
          data: updateData
        })
        updatedCount++
        console.log(`✅ 更新用户 ${user._id}:`, updateData)
      }
    }
    
    console.log(`\n初始化完成！共更新 ${updatedCount} 个用户`)
    
    return {
      success: true,
      message: `成功初始化 ${updatedCount} 个用户的字段`,
      totalUsers: users.data.length,
      updatedCount: updatedCount
    }
  } catch (error) {
    console.error('初始化失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 使用说明：
// 1. 在 CloudBase 控制台创建云函数，命名为 "init-user-fields"
// 2. 将上述代码粘贴到云函数中
// 3. 部署并运行一次
// 4. 运行后删除或禁用该函数（只需运行一次）
