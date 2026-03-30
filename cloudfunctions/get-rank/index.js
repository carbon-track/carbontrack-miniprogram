// 云函数入口文件 - 获取排行榜
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 获取排行榜数据
 */
exports.main = async (event, context) => {
  const { type = 'global', page = 1, limit = 20 } = event
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    // 获取当前用户信息
    const currentUserRes = await db.collection('users').where({
      _openid: OPENID
    }).get()

    const currentUser = currentUserRes.data.length > 0 ? currentUserRes.data[0] : null
    
    let userRank = null
    let rankList = []
    let totalCount = 0
    let whereCondition = {}

    // 根据榜单类型构建查询条件
    if (type === 'global') {
      // 全球榜：所有用户
      whereCondition = {}
      
      // 计算当前用户排名（全球榜）
      if (currentUser) {
        const higherCountRes = await db.collection('users')
          .where({
            totalCarbon: _.gt(currentUser.totalCarbon || 0)
          })
          .count()
        
        const username = currentUser.username || currentUser.nickName || '当前用户'
        const roundedCarbonSaved = Math.round((currentUser.totalCarbon || 0) * 100) / 100
        userRank = {
          userId: currentUser._id,
          username: username,
          avatarUrl: currentUser.avatarUrl,
          carbonSaved: roundedCarbonSaved,
          points: currentUser.points || 0,
          rank: higherCountRes.total + 1
        }
      }

    } else if (type === 'school') {
      // 校内榜：同一学校的用户
      if (!currentUser || !currentUser.school) {
        // 未登录或没有设置学校的用户，显示空榜单
        return {
          success: true,
          rankList: [],
          userRank: null,
          total: 0,
          page,
          limit,
          hasMore: false,
          message: '请先设置学校信息查看校内榜'
        }
      }
      
      whereCondition = {
        school: currentUser.school
      }
      
      // 计算当前用户校内排名
      if (currentUser) {
        const higherCountRes = await db.collection('users')
          .where({
            school: currentUser.school,
            totalCarbon: _.gt(currentUser.totalCarbon || 0)
          })
          .count()
        
        const username = currentUser.username || currentUser.nickName || '当前用户'
        const roundedCarbonSaved = Math.round((currentUser.totalCarbon || 0) * 100) / 100
        userRank = {
          userId: currentUser._id,
          username: username,
          avatarUrl: currentUser.avatarUrl,
          carbonSaved: roundedCarbonSaved,
          points: currentUser.points || 0,
          rank: higherCountRes.total + 1,
          school: currentUser.school
        }
      }

    } else if (type === 'friend') {
      // 好友榜：好友关系表中的用户
      if (!currentUser) {
        return {
          success: false,
          message: '请先登录查看好友榜',
          code: 'NO_LOGIN'
        }
      }
      
      // 获取好友列表
      const friendsRes = await db.collection('friends')
        .where(_.or([
          { userOpenId: OPENID },
          { friendOpenId: OPENID }
        ]))
        .get()
      
      if (friendsRes.data.length === 0) {
        return {
          success: true,
          rankList: [],
          userRank: null,
          total: 0,
          page,
          limit,
          hasMore: false,
          message: '暂无好友数据'
        }
      }
      
      // 提取好友openid列表
      const friendOpenIds = friendsRes.data.map(friend => 
        friend.userOpenId === OPENID ? friend.friendOpenId : friend.userOpenId
      )
      
      // 添加当前用户自己（用于排名计算）
      const allOpenIds = [...friendOpenIds, OPENID]
      
      whereCondition = {
        _openid: _.in(allOpenIds)
      }
      
      // 计算当前用户好友排名
      if (currentUser) {
        const higherCountRes = await db.collection('users')
          .where({
            _openid: _.in(allOpenIds),
            totalCarbon: _.gt(currentUser.totalCarbon || 0)
          })
          .count()
        
        const username = currentUser.username || currentUser.nickName || '当前用户'
        const roundedCarbonSaved = Math.round((currentUser.totalCarbon || 0) * 100) / 100
        userRank = {
          userId: currentUser._id,
          username: username,
          avatarUrl: currentUser.avatarUrl,
          carbonSaved: roundedCarbonSaved,
          points: currentUser.points || 0,
          rank: higherCountRes.total + 1,
          friendCount: friendOpenIds.length
        }
      }
    } else {
      return {
        success: false,
        message: '不支持的榜单类型',
        code: 'INVALID_TYPE'
      }
    }

    // 获取排行榜数据
    const rankListRes = await db.collection('users')
      .where(whereCondition)
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
      .orderBy('totalCarbon', 'desc')
      .orderBy('_id', 'asc') // 添加二级排序，确保相同carbon值时的稳定排序
      .skip((page - 1) * limit)
      .limit(limit)
      .get()

    // 添加排名
    rankList = rankListRes.data.map((user, index) => {
      const username = user.username || user.nickName || '用户'
      const roundedCarbonSaved = Math.round((user.totalCarbon || 0) * 100) / 100
      return {
        _id: user._id,
        username: username,
        avatarUrl: user.avatarUrl,
        carbonSaved: roundedCarbonSaved,
        points: user.points || 0,
        rank: (page - 1) * limit + index + 1,
        school: user.school || '',
        level: user.level || 1
      }
    })

    // 获取总数
    const totalCountRes = await db.collection('users')
      .where(whereCondition)
      .count()
    
    totalCount = totalCountRes.total

    return {
      success: true,
      rankList,
      userRank,
      total: totalCount,
      page,
      limit,
      hasMore: page * limit < totalCount
    }
  } catch (error) {
    console.error('获取排行榜失败:', error)
    return {
      success: false,
      message: error.message || '获取排行榜失败',
      code: 'SERVER_ERROR'
    }
  }
}
