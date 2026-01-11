// 云函数入口文件 - 迁移碳足迹记录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 将旧的 userId 迁移到新用户
 */
exports.main = async (event, context) => {
  const { oldUserId, newUserId } = event

  try {
    // 先查询要更新的记录
    const recordsRes = await db.collection('carbon_records')
      .where({ userId: oldUserId })
      .get()

    const records = recordsRes.data

    // 逐条更新（避免批量更新限制）
    for (const record of records) {
      await db.collection('carbon_records').doc(record._id).update({
        data: { userId: newUserId }
      })
    }

    return {
      success: true,
      message: `成功迁移 ${records.length} 条记录`,
      count: records.length
    }
  } catch (error) {
    console.error('迁移记录失败:', error)
    return {
      success: false,
      message: error.message || '迁移失败'
    }
  }
}
