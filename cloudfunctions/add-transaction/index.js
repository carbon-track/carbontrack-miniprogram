// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { type, amount, description, referenceType = null, referenceId = null } = event
  
  // 验证必填字段
  if (!type || !amount || amount <= 0) {
    return {
      success: false,
      error: '交易类型和金额不能为空，金额必须大于0'
    }
  }
  
  try {
    const now = new Date()
    
    // 获取当前用户积分余额
    const userResult = await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .get()
    
    if (userResult.data.length === 0) {
      return {
        success: false,
        error: '用户不存在'
      }
    }
    
    const user = userResult.data[0]
    const currentBalance = user.points || 0
    
    // 计算余额变化
    let newBalance
    if (type === 'earn') {
      newBalance = currentBalance + Number(amount)
    } else if (type === 'spend') {
      if (currentBalance < Number(amount)) {
        return {
          success: false,
          error: '积分余额不足'
        }
      }
      newBalance = currentBalance - Number(amount)
    } else {
      return {
        success: false,
        error: '交易类型错误，必须是 earn 或 spend'
      }
    }
    
    // 创建交易记录
    const transactionResult = await db.collection('transactions').add({
      data: {
        userId: wxContext.OPENID,
        type,
        amount: Number(amount),
        balance: newBalance,
        description: description || '',
        referenceType,
        referenceId,
        createdAt: now
      }
    })
    
    // 更新用户积分余额
    await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .update({
        data: {
          points: newBalance,
          updatedAt: now
        }
      })
    
    return {
      success: true,
      data: {
        transactionId: transactionResult._id,
        balance: newBalance,
        message: '交易记录添加成功'
      }
    }
  } catch (error) {
    console.error('添加交易记录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
