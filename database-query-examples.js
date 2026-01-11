// CloudBase 数据库查询示例 - users 表
// 使用方法：在云开发控制台 -> 数据库 -> 高级代码编辑器 中运行

const db = cloud.database()
const _ = db.command

// ============================================
// 示例 1: 基础查询 - 积分大于 100 的用户
// ============================================
db.collection('users')
  .where({
    points: _.gt(100)
  })
  .field({
    nickName: true,
    points: true,
    avatarUrl: true
  })
  .orderBy('points', 'desc')
  .skip(0)
  .limit(10)
  .get()

// ============================================
// 示例 2: 查询积分大于等于 50 的用户，只返回昵称和积分
// ============================================
db.collection('users')
  .where({
    points: _.gte(50)
  })
  .field({
    nickName: true,
    points: true
  })
  .orderBy('points', 'desc')
  .limit(20)
  .get()

// ============================================
// 示例 3: 查询减碳量大于 10kg 的用户
// ============================================
db.collection('users')
  .where({
    totalCarbonSaved: _.gt(10)
  })
  .field({
    nickName: true,
    totalCarbonSaved: true,
    points: true
  })
  .orderBy('totalCarbonSaved', 'desc')
  .limit(15)
  .get()

// ============================================
// 示例 4: 查询记录次数大于等于 10 的用户
// ============================================
db.collection('users')
  .where({
    totalCarbonRecords: _.gte(10)
  })
  .field({
    nickName: true,
    totalCarbonRecords: true,
    points: true
  })
  .orderBy('totalCarbonRecords', 'desc')
  .skip(0)
  .limit(10)
  .get()

// ============================================
// 示例 5: 组合条件 - 积分大于 100 且减碳量大于 5
// ============================================
db.collection('users')
  .where({
    points: _.gt(100),
    totalCarbonSaved: _.gt(5)
  })
  .field({
    nickName: true,
    points: true,
    totalCarbonSaved: true
  })
  .orderBy('points', 'desc')
  .limit(20)
  .get()

// ============================================
// 示例 6: 模糊搜索昵称
// ============================================
db.collection('users')
  .where({
    nickName: db.RegExp({
      regexp: '环保',
      options: 'i'
    })
  })
  .field({
    nickName: true,
    points: true
  })
  .limit(10)
  .get()

// ============================================
// 示例 7: 范围查询 - 积分在 100 到 500 之间
// ============================================
db.collection('users')
  .where({
    points: _.and(_.gte(100), _.lte(500))
  })
  .field({
    nickName: true,
    points: true
  })
  .orderBy('points', 'desc')
  .limit(20)
  .get()

// ============================================
// 示例 8: 按创建时间排序，获取最新注册的用户
// ============================================
db.collection('users')
  .field({
    nickName: true,
    createdAt: true,
    points: true
  })
  .orderBy('createdAt', 'desc')
  .skip(0)
  .limit(10)
  .get()

// ============================================
// 示例 9: 查询有头像的用户
// ============================================
db.collection('users')
  .where({
    avatarUrl: _.neq('')
  })
  .field({
    nickName: true,
    avatarUrl: true,
    points: true
  })
  .orderBy('points', 'desc')
  .limit(20)
  .get()

// ============================================
// 示例 10: 分页查询 - 第2页，每页10条
// ============================================
db.collection('users')
  .field({
    nickName: true,
    points: true,
    totalCarbonRecords: true
  })
  .orderBy('points', 'desc')
  .skip(10)  // 跳过前10条
  .limit(10)  // 返回10条
  .get()

// ============================================
// 示例 11: 复合条件 - 积分排行榜前20名，排除匿名用户
// ============================================
db.collection('users')
  .where({
    points: _.gt(0),
    nickName: _.neq('')
  })
  .field({
    nickName: true,
    avatarUrl: true,
    points: true,
    totalCarbonSaved: true
  })
  .orderBy('points', 'desc')
  .limit(20)
  .get()

// ============================================
// 示例 12: 查询连续登录天数大于等于7的用户
// ============================================
db.collection('users')
  .where({
    consecutiveLoginDays: _.gte(7)
  })
  .field({
    nickName: true,
    consecutiveLoginDays: true,
    points: true
  })
  .orderBy('consecutiveLoginDays', 'desc')
  .limit(15)
  .get()

// ============================================
// 示例 13: 查询累计获得积分大于1000的用户
// ============================================
db.collection('users')
  .where({
    totalPointsEarned: _.gt(1000)
  })
  .field({
    nickName: true,
    totalPointsEarned: true,
    points: true
  })
  .orderBy('totalPointsEarned', 'desc')
  .limit(20)
  .get()

// ============================================
// 示例 14: 查询兑换次数大于等于3的用户
// ============================================
db.collection('users')
  .where({
    totalExchanges: _.gte(3)
  })
  .field({
    nickName: true,
    totalExchanges: true,
    points: true
  })
  .orderBy('totalExchanges', 'desc')
  .limit(15)
  .get()

// ============================================
// 示例 15: 查询有成就的用户（achievements数组不为空）
// ============================================
db.collection('users')
  .where({
    achievements: _.exists(true)
  })
  .field({
    nickName: true,
    achievements: true,
    points: true
  })
  .orderBy('points', 'desc')
  .limit(20)
  .get()

// ============================================
// 示例 16: 查询指定时间段内注册的用户
// ============================================
db.collection('users')
  .where({
    createdAt: _.and(
      _.gte(new Date('2024-01-01')),
      _.lte(new Date('2024-12-31'))
    )
  })
  .field({
    nickName: true,
    createdAt: true,
    points: true
  })
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get()

// ============================================
// 示例 17: 统计查询 - 查询总用户数
// ============================================
db.collection('users')
  .count()

// ============================================
// 示例 18: 统计查询 - 积分大于100的用户数量
// ============================================
db.collection('users')
  .where({
    points: _.gt(100)
  })
  .count()

// ============================================
// 示例 19: 查询减碳排行榜（减碳量前10名）
// ============================================
db.collection('users')
  .field({
    nickName: true,
    avatarUrl: true,
    totalCarbonSaved: true,
    totalCarbonRecords: true
  })
  .orderBy('totalCarbonSaved', 'desc')
  .limit(10)
  .get()

// ============================================
// 示例 20: 查询最活跃用户（记录次数前10名）
// ============================================
db.collection('users')
  .field({
    nickName: true,
    avatarUrl: true,
    totalCarbonRecords: true,
    points: true
  })
  .orderBy('totalCarbonRecords', 'desc')
  .limit(10)
  .get()
