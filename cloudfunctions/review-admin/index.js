const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 审核操作类型
const REVIEW_ACTION = {
  LIST: 'list',           // 查询待审核列表
  REVIEW: 'review',       // 审核操作
  HISTORY: 'history'      // 查询审核记录
}

// 审核状态
const REVIEW_STATUS = {
  PENDING: 'pending',     // 待审核
  APPROVED: 'approved',   // 已通过
  REJECTED: 'rejected'    // 已拒绝
}

exports.main = async (event, context) => {
  const { action, ...params } = event
  const wxContext = cloud.getWXContext()

  try {
    console.log(`[Review Admin] 操作: ${action}`)

    // 权限验证：仅管理员可访问
    const isAdmin = await checkAdminPermission(wxContext.OPENID)
    if (!isAdmin) {
      return {
        success: false,
        error: '无权限访问审核管理功能'
      }
    }

    // 根据操作类型分发
    switch (action) {
      case REVIEW_ACTION.LIST:
        return await getPendingList(params)
      case REVIEW_ACTION.REVIEW:
        return await processReview(params)
      case REVIEW_ACTION.HISTORY:
        return await getReviewHistory(params)
      default:
        return {
          success: false,
          error: '未知的操作类型'
        }
    }

  } catch (error) {
    console.error('[Review Admin] 操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 权限验证
 */
async function checkAdminPermission(openid) {
  try {
    // 从环境变量获取管理员OpenID列表
    const adminOpenIds = process.env.ADMIN_OPENIDS
      ? process.env.ADMIN_OPENIDS.split(',')
      : []

    // 如果没有配置管理员，默认当前用户为管理员（首次设置）
    if (adminOpenIds.length === 0) {
      console.warn('[Review Admin] 未配置管理员列表，当前用户将被视为管理员')
      return true
    }

    return adminOpenIds.includes(openid)
  } catch (error) {
    console.error('[Review Admin] 权限验证失败:', error)
    return false
  }
}

/**
 * 获取待审核列表
 */
async function getPendingList(params) {
  try {
    const { page = 1, pageSize = 20, contentType, source } = params
    const skip = (page - 1) * pageSize

    // 构建查询条件
    const query = { status: REVIEW_STATUS.PENDING }
    if (contentType) {
      query.contentType = contentType
    }
    if (source) {
      query.source = source
    }

    // 查询待审核内容
    const result = await db.collection('content_review_pending')
      .where(query)
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取总数
    const countResult = await db.collection('content_review_pending')
      .where(query)
      .count()

    return {
      success: true,
      data: {
        list: result.data,
        total: countResult.total,
        page,
        pageSize,
        hasMore: skip + result.data.length < countResult.total
      }
    }
  } catch (error) {
    console.error('[Review Admin] 获取待审核列表失败:', error)
    throw error
  }
}

/**
 * 处理审核操作
 */
async function processReview(params) {
  try {
    const { reviewId, decision, reason = '' } = params

    // 参数验证
    if (!reviewId || !decision) {
      return {
        success: false,
        error: '缺少必要参数: reviewId 和 decision'
      }
    }

    if (![REVIEW_STATUS.APPROVED, REVIEW_STATUS.REJECTED].includes(decision)) {
      return {
        success: false,
        error: 'decision 必须是 approved 或 rejected'
      }
    }

    // 获取审核记录
    const reviewRecord = await db.collection('content_review_pending').doc(reviewId).get()
    if (!reviewRecord.data) {
      return {
        success: false,
        error: '审核记录不存在'
      }
    }

    const record = reviewRecord.data

    // 如果已审核，返回错误
    if (record.status !== REVIEW_STATUS.PENDING) {
      return {
        success: false,
        error: '该内容已审核，请勿重复操作'
      }
    }

    // 更新审核记录
    const updateData = {
      status: decision,
      reviewTime: new Date(),
      reviewNote: reason
    }

    await db.collection('content_review_pending').doc(reviewId).update({
      data: updateData
    })

    // 根据审核结果处理原始内容
    if (decision === REVIEW_STATUS.APPROVED) {
      await approveContent(record)
    } else {
      await rejectContent(record)
    }

    // 通知用户
    await notifyUser(record.userId, decision, reason)

    return {
      success: true,
      data: {
        message: decision === REVIEW_STATUS.APPROVED ? '审核通过' : '审核已拒绝',
        reviewId,
        decision
      }
    }
  } catch (error) {
    console.error('[Review Admin] 审核操作失败:', error)
    throw error
  }
}

/**
 * 批准内容
 */
async function approveContent(record) {
  try {
    const { source, originalCollection, originalDocId } = record

    switch (source) {
      case 'feedback':
        // 将反馈标记为可见
        await db.collection('feedback').doc(originalDocId).update({
          data: {
            status: 'visible',
            reviewed: true,
            reviewedAt: new Date()
          }
        })
        break

      case 'profile':
        // 将待审核的用户资料转正
        const pendingProfile = await db.collection('profile_pending').doc(originalDocId).get()
        if (pendingProfile.data) {
          const { userId, nickName, bio } = pendingProfile.data
          await db.collection('users').doc(userId).update({
            data: {
              nickName,
              bio,
              updateTime: new Date()
            }
          })
          // 删除pending记录
          await db.collection('profile_pending').doc(originalDocId).remove()
        }
        break

      default:
        console.warn(`[Review Admin] 未知的内容来源: ${source}`)
    }

    console.log(`[Review Admin] 内容已批准: ${record.contentId}`)
  } catch (error) {
    console.error('[Review Admin] 批准内容失败:', error)
    throw error
  }
}

/**
 * 拒绝内容
 */
async function rejectContent(record) {
  try {
    const { source, originalCollection, originalDocId } = record

    // 删除pending内容
    if (originalCollection && originalDocId) {
      try {
        await db.collection(originalCollection).doc(originalDocId).remove()
      } catch (error) {
        console.warn(`[Review Admin] 删除pending内容失败: ${error.message}`)
      }
    }

    // 记录到安全日志
    await db.collection('security_log').add({
      data: {
        type: 'content_rejected',
        contentId: record.contentId,
        source: record.source,
        userId: record.userId,
        reason: record.reviewNote || '人工审核拒绝',
        createTime: new Date()
      }
    })

    console.log(`[Review Admin] 内容已拒绝: ${record.contentId}`)
  } catch (error) {
    console.error('[Review Admin] 拒绝内容失败:', error)
    throw error
  }
}

/**
 * 通知用户审核结果
 */
async function notifyUser(userId, decision, reason) {
  try {
    // 这里可以实现通知逻辑，例如：
    // 1. 发送模板消息
    // 2. 写入用户通知集合
    // 3. 触发云函数事件

    await db.collection('user_notifications').add({
      data: {
        userId,
        type: 'review_result',
        title: decision === REVIEW_STATUS.APPROVED ? '内容审核通过' : '内容审核未通过',
        content: reason || (decision === REVIEW_STATUS.APPROVED ? '您的内容已通过审核' : '您的内容未通过审核'),
        status: 'unread',
        createTime: new Date()
      }
    })

    console.log(`[Review Admin] 已通知用户: ${userId}`)
  } catch (error) {
    console.error('[Review Admin] 通知用户失败:', error)
    // 通知失败不影响主流程
  }
}

/**
 * 获取审核历史记录
 */
async function getReviewHistory(params) {
  try {
    const { page = 1, pageSize = 20, status, contentType, source } = params
    const skip = (page - 1) * pageSize

    // 构建查询条件
    const query = {}
    if (status && status !== 'all') {
      query.status = status
    }
    if (contentType) {
      query.contentType = contentType
    }
    if (source) {
      query.source = source
    }

    // 查询审核记录
    const result = await db.collection('content_review_pending')
      .where(query)
      .orderBy('reviewTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取总数
    const countResult = await db.collection('content_review_pending')
      .where(query)
      .count()

    return {
      success: true,
      data: {
        list: result.data,
        total: countResult.total,
        page,
        pageSize,
        hasMore: skip + result.data.length < countResult.total
      }
    }
  } catch (error) {
    console.error('[Review Admin] 获取审核历史失败:', error)
    throw error
  }
}
