// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { orderId } = event
  
  if (!orderId) {
    return {
      success: false,
      error: '订单ID不能为空'
    }
  }
  
  try {
    // 查询订单详情
    const result = await db.collection('exchange_orders')
      .doc(orderId)
      .get()
    
    if (!result.data) {
      return {
        success: false,
        error: '订单不存在'
      }
    }
    
    // 验证订单归属
    if (result.data.userId !== wxContext.OPENID) {
      return {
        success: false,
        error: '无权访问该订单'
      }
    }
    
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取兑换订单详情失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
