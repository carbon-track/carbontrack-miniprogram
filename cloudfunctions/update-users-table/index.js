// 云函数入口文件 - 更新用户表结构
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 更新用户表结构，添加必要的排行榜字段
 */
exports.main = async (event, context) => {
  try {
    console.log('开始更新用户表结构...')

    const { addTestUsers = false, testUserCount = 50 } = event

    // 获取所有用户
    const usersRes = await db.collection('users')
      .field({
        _id: true,
        nickName: true,
        username: true,
        avatarUrl: true,
        totalCarbon: true,
        points: true,
        school: true,
        level: true
      })
      .get()

    console.log(`共找到 ${usersRes.data.length} 个用户`)

    const updateResults = {
      totalUsers: usersRes.data.length,
      updated: 0,
      addedFields: 0,
      createdTestUsers: 0,
      errors: []
    }

    // 为现有用户添加缺失的字段
    for (const user of usersRes.data) {
      try {
        const updateData = {}
        let needsUpdate = false

        // 检查并添加必要字段
        if (typeof user.totalCarbon !== 'number') {
          updateData.totalCarbon = user.totalCarbon || 0
          needsUpdate = true
          updateResults.addedFields++
        }

        if (typeof user.points !== 'number') {
          updateData.points = user.points || 0
          needsUpdate = true
          updateResults.addedFields++
        }

        if (!user.school) {
          updateData.school = user.school || ''
          needsUpdate = true
          updateResults.addedFields++
        }

        if (typeof user.level !== 'number') {
          updateData.level = user.level || 1
          needsUpdate = true
          updateResults.addedFields++
        }

        // 确保有 username 字段（兼容 nickName）
        if (!user.username && user.nickName) {
          updateData.username = user.nickName
          needsUpdate = true
          updateResults.addedFields++
        }

        if (needsUpdate) {
          await db.collection('users').doc(user._id).update({
            data: updateData
          })
          updateResults.updated++
          console.log(`更新用户 ${user.nickName || user._id}:`, updateData)
        }
      } catch (updateError) {
        updateResults.errors.push({
          userId: user._id,
          error: updateError.message
        })
        console.error(`更新用户 ${user._id} 失败:`, updateError)
      }
    }

    // 如果需要，添加测试用户
    if (addTestUsers) {
      console.log(`开始创建 ${testUserCount} 个测试用户...`)
      const testUsersCreated = await createTestUsers(testUserCount)
      updateResults.createdTestUsers = testUsersCreated
    }

    return {
      success: true,
      message: '用户表结构更新完成',
      results: updateResults,
      tableStructure: {
        name: 'users',
        requiredFields: [
          { name: 'totalCarbon', type: 'number', defaultValue: 0, description: '累计减碳量（kg）' },
          { name: 'points', type: 'number', defaultValue: 0, description: '积分' },
          { name: 'school', type: 'string', defaultValue: '', description: '学校名称' },
          { name: 'level', type: 'number', defaultValue: 1, description: '用户等级' },
          { name: 'username', type: 'string', description: '用户名（兼容 nickName）' }
        ],
        recommendedIndexes: [
          { keys: ['totalCarbon'], direction: 'desc', description: '排行榜排序索引' },
          { keys: ['school', 'totalCarbon'], description: '校内榜查询索引' },
          { keys: ['_openid'], description: '用户身份索引' }
        ]
      }
    }
  } catch (error) {
    console.error('更新用户表结构失败:', error)
    return {
      success: false,
      message: error.message || '更新用户表结构失败',
      code: 'UPDATE_TABLE_FAILED'
    }
  }
}

/**
 * 创建测试用户数据
 */
async function createTestUsers(count) {
  const schools = [
    '北京大学', '清华大学', '复旦大学', '上海交通大学',
    '浙江大学', '南京大学', '武汉大学', '中山大学',
    '环保科技大学', '绿色能源学院', '生态工程学院', '可持续发展大学'
  ]

  const usernames = [
    '绿色先锋', '低碳达人', '环保卫士', '自然爱好者',
    '地球守护者', '节能小能手', '生态平衡者', '环保志愿者',
    '绿色生活家', '可持续发展者', '清洁地球人', '绿植养护师',
    '环保创新者', '低碳出行者', '资源回收师', '环保教师',
    '生态摄影师', '环保设计师', '绿色科学家', '碳中和倡导者'
  ]

  const avatars = [
    '🌱', '💡', '🌍', '🌸', '🌳', '⚡', '♻️', '🎯',
    '🏡', '🌊', '🚮', '🌿', '💚', '🚲', '📦', '👩‍🏫',
    '📸', '🎨', '🔬', '🌱'
  ]

  let createdCount = 0
  const batchSize = 10

  for (let i = 0; i < Math.min(count, 100); i += batchSize) {
    const batchUsers = []
    const batchCount = Math.min(batchSize, count - i)

    for (let j = 0; j < batchCount; j++) {
      const userIndex = i + j
      const totalCarbon = Math.floor(Math.random() * 1000) + 100 // 100-1100 kg
      const points = Math.floor(totalCarbon * 10) // 按比例计算积分
      const level = Math.min(10, Math.floor(points / 100) + 1) // 积分/100 + 1

      batchUsers.push({
        _openid: `test-openid-${Date.now()}-${userIndex}`,
        nickName: `${usernames[userIndex % usernames.length]}${userIndex + 1}`,
        username: `${usernames[userIndex % usernames.length]}${userIndex + 1}`,
        avatarUrl: '',
        avatarEmoji: avatars[userIndex % avatars.length],
        totalCarbon: totalCarbon,
        points: points,
        level: level,
        school: schools[userIndex % schools.length],
        bio: `这是测试用户${userIndex + 1}的简介`,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        lastLoginTime: db.serverDate(),
        isLogin: true
      })
    }

    // 批量插入
    try {
      for (const user of batchUsers) {
        await db.collection('users').add({ data: user })
        createdCount++
      }
      console.log(`已创建 ${createdCount} 个测试用户`)
    } catch (batchError) {
      console.error(`批量插入测试用户失败:`, batchError)
      // 继续尝试单个插入
      for (const user of batchUsers) {
        try {
          await db.collection('users').add({ data: user })
          createdCount++
        } catch (singleError) {
          console.error(`创建测试用户失败 (${user.nickName}):`, singleError)
        }
      }
    }
  }

  return createdCount
}
