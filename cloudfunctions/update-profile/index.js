// 云函数入口文件 - 更新用户资料
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 更新用户资料
 */
exports.main = async (event, context) => {
  const { nickName, avatarUrl, school, bio, studentId } = event
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    // 查询用户
    const userRes = await db.collection('users').where({
      _openid: OPENID
    }).get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = userRes.data[0]

    // 构建更新数据
    const updateData = {
      updateTime: db.serverDate()
    }

    if (nickName) updateData.nickName = nickName
    if (avatarUrl) updateData.avatarUrl = avatarUrl
    if (school) updateData.school = school
    if (bio) updateData.bio = bio
    if (studentId) updateData.studentId = studentId

    // 更新用户信息
    await db.collection('users').doc(user._id).update({
      data: updateData
    })

    // 返回更新后的用户信息
    const updatedUser = {
      ...user,
      ...updateData
    }

    // 更新本地存储
    const { password, _openid, ...returnUser } = updatedUser

    return {
      success: true,
      message: '更新成功',
      userInfo: returnUser
    }
  } catch (error) {
    console.error('更新用户资料失败:', error)
    return {
      success: false,
      message: error.message || '更新失败'
    }
  }
}
