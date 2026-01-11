// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { orderId, status, remark } = event
  
  if (!orderId || !status) {
    return {
      success: false,
      error: '订单ID和状态不能为空'
    }
  }
  
  const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'rejected']
  if (!validStatuses.includes(status)) {
    return {
      success: false,
      error: '无效的订单状态'
    }
  }
  
  try {
    const now = new Date()
    
    // 查询订单
    const orderResult = await db.collection('exchange_orders')
      .doc(orderId)
      .get()
    
    if (!orderResult.data) {
      return {
        success: false,
        error: '订单不存在'
      }
    }
    
    const order = orderResult.data
    
    // 如果是取消或拒绝订单，需要退还积分
    if (status === 'cancelled' || status === 'rejected') {
      if (order.status === 'cancelled' || order.status === 'rejected') {
        return {
          success: false,
          error: '订单已取消或拒绝，不能重复操作'
        }
      }
      
      // 退还积分
      await db.collection('users')
        .where({ _openid: order.userId })
        .update({
          data: {
            points: _.inc(order.totalPoints),
            updatedAt: now
          }
        })
      
      // 记录退款交易
      const userResult = await db.collection('users')
        .where({ _openid: order.userId })
        .field({ points: true })
        .get()
      
      const newBalance = userResult.data[0].points
      
      await db.collection('transactions').add({
        data: {
          userId: order.userId,
          type: 'earn',
          amount: order.totalPoints,
          balance: newBalance,
          description: `订单取消退款: ${order.productName} x${order.quantity}`,
          referenceType: 'refund',
          referenceId: orderId,
          createdAt: now
        }
      })
      
      // 恢复商品库存
      await db.collection('products')
        .doc(order.productId)
        .update({
          data: {
            stock: _.inc(order.quantity),
            sold: _.inc(-order.quantity),
            updatedAt: now
          }
        })
    }
    
    // 更新订单状态
    await db.collection('exchange_orders')
      .doc(orderId)
      .update({
        data: {
          status,
          remark: remark || '',
          updatedAt: now,
          processedAt: now
        }
      })
    
    return {
      success: true,
      message: '订单状态更新成功'
    }
  } catch (error) {
    console.error('更新兑换订单失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
