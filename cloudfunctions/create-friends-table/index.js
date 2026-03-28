// 云函数入口文件 - 创建好友关系表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 创建好友关系表结构
 */
exports.main = async (event, context) => {
  try {
    console.log('开始创建好友关系表...')

    // 检查是否已存在 friends 表
    const checkRes = await db.collection('friends').count()
    console.log('当前 friends 表记录数:', checkRes.total)

    // 如果表已存在，可以选择清除或跳过
    const { clearExisting = false } = event

    if (clearExisting && checkRes.total > 0) {
      console.log('清除现有数据...')
      // 批量删除所有记录
      const batchSize = 100
      let totalDeleted = 0
      let hasMore = true
      
      while (hasMore) {
        const recordsRes = await db.collection('friends')
          .limit(batchSize)
          .get()
        
        if (recordsRes.data.length === 0) {
          hasMore = false
          break
        }
        
        // 批量删除
        const deletePromises = recordsRes.data.map(record => 
          db.collection('friends').doc(record._id).remove()
        )
        
        await Promise.all(deletePromises)
        totalDeleted += recordsRes.data.length
        console.log(`已删除 ${totalDeleted} 条记录`)
      }
    }

    // 创建示例好友关系数据
    const friendData = [
      {
        userOpenId: 'test-user-1',
        friendOpenId: 'test-user-2',
        status: 'accepted', // pending, accepted, blocked
        friendSince: db.serverDate(new Date('2024-01-15')),
        notes: '测试好友关系1',
        createdAt: db.serverDate()
      },
      {
        userOpenId: 'test-user-1',
        friendOpenId: 'test-user-3',
        status: 'accepted',
        friendSince: db.serverDate(new Date('2024-02-20')),
        notes: '测试好友关系2',
        createdAt: db.serverDate()
      },
      {
        userOpenId: 'test-user-2',
        friendOpenId: 'test-user-3',
        status: 'accepted',
        friendSince: db.serverDate(new Date('2024-03-10')),
        notes: '测试好友关系3',
        createdAt: db.serverDate()
      },
      {
        userOpenId: 'test-user-4',
        friendOpenId: 'test-user-1',
        status: 'pending',
        friendSince: db.serverDate(),
        notes: '待处理的好友请求',
        createdAt: db.serverDate()
      },
      {
        userOpenId: 'test-user-5',
        friendOpenId: 'test-user-2',
        status: 'accepted',
        friendSince: db.serverDate(new Date('2024-04-05')),
        notes: '测试好友关系5',
        createdAt: db.serverDate()
      }
    ]

    // 批量插入示例数据
    const results = []
    for (const friend of friendData) {
      const addRes = await db.collection('friends').add({
        data: friend
      })
      results.push({
        id: addRes._id || addRes.id,
        userOpenId: friend.userOpenId,
        friendOpenId: friend.friendOpenId,
        status: friend.status
      })
    }

    console.log(`成功创建 ${results.length} 条好友关系记录`)

    // 创建索引（可选，提高查询性能）
    try {
      // 创建联合索引，便于双向好友关系查询
      await db.collection('friends').addIndex({
        name: 'user_friend_idx',
        unique: false,
        keys: [
          { name: 'userOpenId', direction: 'asc' },
          { name: 'friendOpenId', direction: 'asc' },
          { name: 'status', direction: 'asc' }
        ]
      })
      
      console.log('成功创建好友关系索引')
    } catch (indexError) {
      console.warn('创建索引失败（可能已存在）:', indexError.message)
    }

    return {
      success: true,
      message: `好友关系表已创建，共插入 ${results.length} 条记录`,
      data: results,
      tableInfo: {
        name: 'friends',
        fields: [
          { name: '_id', type: 'string', description: '主键' },
          { name: 'userOpenId', type: 'string', description: '发起方用户ID', required: true },
          { name: 'friendOpenId', type: 'string', description: '好友用户ID', required: true },
          { name: 'status', type: 'string', description: '关系状态: pending/accepted/blocked', required: true },
          { name: 'friendSince', type: 'date', description: '成为好友时间' },
          { name: 'notes', type: 'string', description: '备注信息' },
          { name: 'createdAt', type: 'date', description: '创建时间', required: true }
        ],
        indexes: [
          { 
            name: 'user_friend_idx', 
            keys: ['userOpenId', 'friendOpenId', 'status'],
            description: '好友关系查询索引' 
          }
        ]
      }
    }
  } catch (error) {
    console.error('创建好友关系表失败:', error)
    return {
      success: false,
      message: error.message || '创建好友关系表失败',
      code: 'CREATE_TABLE_FAILED'
    }
  }
}
