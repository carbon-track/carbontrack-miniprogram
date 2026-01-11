// 云函数入口文件 - 批量插入测试数据
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 批量插入测试数据
 */
exports.main = async (event, context) => {
  const { userType = 'all', count = 100 } = event
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    console.log('开始批量插入测试数据:', { userType, count })

    const results = {
      users: [],
      carbonRecords: []
    }

    // 1. 插入测试用户数据
    if (userType === 'users' || userType === 'all') {
      const users = []
      for (let i = 0; i < Math.min(count, 100); i++) {
        const createTime = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // 过去一年内随机时间
        const totalCarbon = Math.floor(Math.random() * 10000) + 100 // 100-10100 kg CO2
        const points = Math.floor(totalCarbon / 10) // 碳减排 1kg = 10 积分
        const level = points >= 1000 ? 5 : points >= 500 ? 4 : points >= 200 ? 3 : points >= 100 ? 2 : 1

        users.push({
          _openid: `test-user-${Date.now()}-${i}`,
          nickName: `测试用户${i + 1}`,
          avatarUrl: '',
          email: `test${i + 1}@example.com`,
          totalCarbon,
          points,
          level,
          school: i % 5 === 0 ? '清华大学' : i % 5 === 1 ? '北京大学' : i % 5 === 2 ? '复旦大学' : i % 5 === 3 ? '上海交通大学' : '浙江大学',
          bio: `这是测试用户${i + 1}的简介`,
          createTime: db.serverDate(createTime),
          updateTime: db.serverDate(createTime),
          lastLoginTime: db.serverDate(),
          isLogin: true
        })
      }

      // 批量插入用户
      for (const user of users) {
        const addRes = await db.collection('users').add({ data: user })
        results.users.push({
          id: addRes._id || addRes.id,
          nickName: user.nickName,
          totalCarbon: user.totalCarbon,
          points: user.points
        })
      }

      console.log(`插入 ${users.length} 条用户数据`)
    }

    // 2. 插入碳足迹记录数据
    if (userType === 'records' || userType === 'all') {
      const carbonRecords = []
      const activityTypes = ['transport', 'energy', 'diet', 'shopping', 'waste']
      const activities = {
        transport: ['地铁', '公交', '私家车', '共享单车', '步行'],
        energy: ['空调', '电灯', '电脑', '冰箱', '洗衣机'],
        diet: ['素食', '荤食', '外卖', '堂食', '自制'],
        shopping: ['网购', '实体店', '二手', '新品', '日用品'],
        waste: ['垃圾分类', '回收', '堆肥', '减少使用', '重复使用']
      }

      for (let i = 0; i < Math.min(count * 5, 500); i++) {
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
        const activity = activities[type][Math.floor(Math.random() * activities[type].length)]
        const createTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 过去30天内随机时间
        const carbonSaved = Math.floor(Math.random() * 50) + 1 // 1-51 kg CO2

        carbonRecords.push({
          _openid: `test-user-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          activityType: type,
          activity,
          carbonSaved,
          points: carbonSaved * 10,
          description: `${activity}碳减排${carbonSaved}kg`,
          createTime: db.serverDate(createTime),
          updateTime: db.serverDate(createTime)
        })
      }

      // 批量插入碳足迹记录
      for (const record of carbonRecords) {
        const addRes = await db.collection('carbon_records').add({ data: record })
        results.carbonRecords.push({
          id: addRes._id || addRes.id,
          activityType: record.activityType,
          activity: record.activity,
          carbonSaved: record.carbonSaved
        })
      }

      console.log(`插入 ${carbonRecords.length} 条碳足迹记录数据`)
    }

    return {
      success: true,
      message: '测试数据插入成功',
      data: {
        usersCount: results.users.length,
        recordsCount: results.carbonRecords.length,
        data: results
      },
      executionTime: new Date().toISOString()
    }
  } catch (error) {
    console.error('批量插入测试数据失败:', error)
    return {
      success: false,
      message: error.message || '插入测试数据失败',
      error: error.toString(),
      executionTime: new Date().toISOString()
    }
  }
}
