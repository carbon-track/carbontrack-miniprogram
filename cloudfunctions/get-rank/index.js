// 云函数入口文件 - 获取排行榜
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

/**
 * 获取排行榜数据
 */
exports.main = async (event, context) => {
  const { type = 'global', page = 1, limit = 20 } = event
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    let userRank = null

    // 获取当前用户排名
    const currentUserRes = await db.collection('users').where({
      _openid: OPENID
    }).get()

    if (currentUserRes.data.length > 0) {
      const currentUser = currentUserRes.data[0]

      // 计算用户排名
      const rankCountRes = await db.collection('users')
        .where({
          totalCarbon: _.gt(currentUser.totalCarbon || 0)
        })
        .count()

      // 兼容数据库中的 nickName 字段，统一输出为 username
      const username = currentUser.username || currentUser.nickName || '当前用户'
      
      userRank = {
        userId: currentUser._id,
        username: username,
        avatarUrl: currentUser.avatarUrl,
        carbonSaved: currentUser.totalCarbon || 0,
        points: currentUser.points || 0,
        rank: rankCountRes.total + 1
      }
    }

    // 构建查询条件
    let whereCondition = {}

    // 根据类型添加条件
    if (type === 'school' && currentUserRes.data.length > 0) {
      // 校内榜 - 假设用户有 school 字段
      // 如果没有 school 字段，可以使用其他方式（如用户标签）
      // 这里暂时返回全球榜作为示例
    }
    // friend 好友榜 - 需要好友关系表，这里先返回全球榜

    // 获取排行榜数据
    const rankListRes = await db.collection('users')
      .field({
        _id: true,
        nickName: true,
        username: true,
        avatarUrl: true,
        totalCarbon: true,
        points: true
      })
      .orderBy('totalCarbon', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()

    // 添加排名，统一使用 username 和 carbonSaved 字段
    const rankList = rankListRes.data.map((user, index) => {
      // 兼容数据库中的 nickName 字段，统一输出为 username
      const username = user.username || user.nickName || '用户'
      return {
        _id: user._id,
        username: username,
        avatarUrl: user.avatarUrl,
        carbonSaved: user.totalCarbon || 0,
        points: user.points || 0,
        rank: (page - 1) * limit + index + 1
      }
    })

    // 获取总数
    const totalCountRes = await db.collection('users').count()

    return {
      success: true,
      rankList,
      userRank,
      total: totalCountRes.total,
      page,
      limit,
      hasMore: page * limit < totalCountRes.total
    }
  } catch (error) {
    console.error('获取排行榜失败:', error)
    return {
      success: false,
      message: error.message || '获取排行榜失败'
    }
  }
}
