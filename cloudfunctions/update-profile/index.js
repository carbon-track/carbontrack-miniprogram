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
    const now = new Date()

    // 构建更新数据
    const updateData = {
      updateTime: db.serverDate()
    }

    if (nickName) updateData.nickName = nickName
    if (avatarUrl) updateData.avatarUrl = avatarUrl
    if (school) updateData.school = school
    if (bio) updateData.bio = bio
    if (studentId) updateData.studentId = studentId

    // 如果有昵称或简介，进行内容安全检测
    const fieldsToCheck = []
    if (nickName) fieldsToCheck.push({ field: 'nickName', value: nickName })
    if (bio) fieldsToCheck.push({ field: 'bio', value: bio })

    if (fieldsToCheck.length > 0) {
      console.log('[Update Profile] 开始内容安全检测...')
      
      // 检测所有需要检查的字段
      const checkResults = []
      for (const field of fieldsToCheck) {
        const securityResult = await cloud.callFunction({
          name: 'content-security',
          data: {
            contentType: 'text',
            content: field.value,
            source: 'profile'
          }
        })
        
        checkResults.push({
          field: field.field,
          result: securityResult.result
        })
      }

      console.log('[Update Profile] 检测结果:', checkResults)

      // 判断检测结果
      const hasRejected = checkResults.some(r => r.result.status === 'rejected')
      const hasSuspected = checkResults.some(r => r.result.status === 'suspected')

      if (hasRejected) {
        // ❌ 有明确违规字段：直接拒绝
        console.log('[Update Profile] 检测到违规内容，拒绝更新')
        
        // 记录到安全日志
        await db.collection('security_log').add({
          data: {
            type: 'profile_rejected',
            userId: OPENID,
            fields: checkResults.map(r => ({
              field: r.field,
              content: r.result.status === 'rejected' ? `字段 ${r.field} 包含违规内容` : '疑似违规'
            })),
            createTime: now
          }
        })
        
        return {
          success: false,
          message: '资料包含违规信息，请修改后重试'
        }
      }

      if (hasSuspected) {
        // ⚠️ 有疑似违规字段：进入审核池
        console.log('[Update Profile] 检测到疑似违规内容，进入审核池')
        
        // 1. 写入profile_pending集合
        const pendingData = {
          userId: OPENID,
          updateData: updateData,
          securityCheckResults: checkResults,
          createdAt: now,
          status: 'pending'
        }
        
        const pendingResult = await db.collection('profile_pending').add({
          data: pendingData
        })
        
        // 2. 写入审核池
        await db.collection('content_review_pending').add({
          data: {
            contentId: pendingResult._id,
            contentType: 'text',
            content: {
              nickName: updateData.nickName || user.nickName,
              bio: updateData.bio || user.bio
            },
            source: 'profile',
            originalCollection: 'profile_pending',
            originalDocId: pendingResult._id,
            userId: OPENID,
            status: 'pending',
            securityResult: {
              checkResults: checkResults,
              overallStatus: 'suspected',
              riskScore: Math.max(...checkResults.map(r => r.result.riskScore || 0.85))
            },
            createTime: now,
            updateTime: now
          }
        })
        
        return {
          success: true,
          message: '资料修改已提交审核，审核通过后自动更新',
          reviewStatus: 'pending',
          userInfo: user  // 返回原资料
        }
      }
    }

    // ✅ 全部合规：直接更新
    console.log('[Update Profile] 内容合规，直接更新')
    
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
      userInfo: returnUser,
      reviewStatus: 'approved'
    }
  } catch (error) {
    console.error('[Update Profile] 更新失败:', error)
    return {
      success: false,
      message: error.message || '更新失败'
    }
  }
}
