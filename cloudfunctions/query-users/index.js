// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { 
    // 查询条件
    pointsGt = null,      // 积分大于
    pointsGte = null,     // 积分大于等于
    pointsLt = null,      // 积分小于
    pointsLte = null,     // 积分小于等于
    totalCarbonRecordsGt = null,  // 总记录次数大于
    totalCarbonRecordsGte = null, // 总记录次数大于等于
    totalCarbonSavedGt = null,    // 总减碳量大于
    totalCarbonSavedGte = null,   // 总减碳量大于等于
    nicknameContains = null,      // 昵称包含
    hasAvatar = null,             // 是否有头像
    
    // 字段选择（只返回指定字段）
    field = null,
    
    // 排序
    orderByField = 'points',  // 排序字段：points/totalCarbonRecords/totalCarbonSaved/createdAt
    orderDirection = 'desc',  // 排序方向：asc/desc
    
    // 分页
    skip = 0,
    limit = 20
  } = event
  
  try {
    // 构建查询条件
    let query = {}
    
    // 积分条件
    if (pointsGt !== null) query.points = _.gt(Number(pointsGt))
    if (pointsGte !== null) query.points = _.gte(Number(pointsGte))
    if (pointsLt !== null) query.points = _.lt(Number(pointsLt))
    if (pointsLte !== null) query.points = _.lte(Number(pointsLte))
    
    // 记录次数条件
    if (totalCarbonRecordsGt !== null) query.totalCarbonRecords = _.gt(Number(totalCarbonRecordsGt))
    if (totalCarbonRecordsGte !== null) query.totalCarbonRecords = _.gte(Number(totalCarbonRecordsGte))
    
    // 减碳量条件
    if (totalCarbonSavedGt !== null) query.totalCarbonSaved = _.gt(Number(totalCarbonSavedGt))
    if (totalCarbonSavedGte !== null) query.totalCarbonSaved = _.gte(Number(totalCarbonSavedGte))
    
    // 昵称模糊查询
    if (nicknameContains) {
      query.nickName = db.RegExp({
        regexp: nicknameContains,
        options: 'i'
      })
    }
    
    // 头像条件
    if (hasAvatar !== null) {
      if (hasAvatar) {
        query.avatarUrl = _.neq('')
      } else {
        query.avatarUrl = _.eq('')
      }
    }
    
    // 构建查询
    let dbQuery = db.collection('users')
    
    // 添加条件
    if (Object.keys(query).length > 0) {
      dbQuery = dbQuery.where(query)
    }
    
    // 选择字段
    if (field) {
      dbQuery = dbQuery.field(field)
    }
    
    // 排序
    if (orderByField) {
      dbQuery = dbQuery.orderBy(orderByField, orderDirection)
    }
    
    // 分页
    dbQuery = dbQuery.skip(skip).limit(limit)
    
    // 执行查询
    const result = await dbQuery.get()
    
    // 获取总数
    const countQuery = db.collection('users')
    if (Object.keys(query).length > 0) {
      countQuery.where(query)
    }
    const countResult = await countQuery.count()
    
    return {
      success: true,
      data: result.data,
      total: countResult.total,
      skip,
      limit,
      hasMore: (skip + limit) < countResult.total
    }
  } catch (error) {
    console.error('查询用户失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
