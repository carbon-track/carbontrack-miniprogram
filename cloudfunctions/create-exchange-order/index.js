// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { productId, quantity = 1, contactName, contactPhone, address } = event
  
  // 验证必填字段
  if (!productId) {
    return {
      success: false,
      error: '商品ID不能为空'
    }
  }
  
  if (quantity <= 0) {
    return {
      success: false,
      error: '数量必须大于0'
    }
  }
  
  try {
    const now = new Date()
    
    // 查询商品信息
    const productResult = await db.collection('products')
      .doc(productId)
      .get()
    
    if (!productResult.data) {
      return {
        success: false,
        error: '商品不存在'
      }
    }
    
    const product = productResult.data
    
    // 检查商品状态
    if (product.status !== 'active') {
      return {
        success: false,
        error: '商品已下架'
      }
    }
    
    // 检查库存
    if (product.stock < quantity) {
      return {
        success: false,
        error: '库存不足'
      }
    }
    
    const totalPoints = product.price * quantity
    
    // 检查用户积分余额
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
    
    if (currentBalance < totalPoints) {
      return {
        success: false,
        error: '积分余额不足'
      }
    }
    
    // 创建兑换订单
    const orderResult = await db.collection('exchange_orders').add({
      data: {
        userId: wxContext.OPENID,
        productId,
        productName: product.name,
        productImage: product.image,
        quantity: Number(quantity),
        pointsPrice: product.price,
        totalPoints,
        status: 'pending',
        contactName,
        contactPhone,
        address,
        createdAt: now,
        updatedAt: now
      }
    })
    
    // 扣除用户积分
    const newBalance = currentBalance - totalPoints
    await db.collection('users')
      .where({ _openid: wxContext.OPENID })
      .update({
        data: {
          points: newBalance,
          updatedAt: now
        }
      })
    
    // 记录交易
    await db.collection('transactions').add({
      data: {
        userId: wxContext.OPENID,
        type: 'spend',
        amount: totalPoints,
        balance: newBalance,
        description: `兑换商品: ${product.name} x${quantity}`,
        referenceType: 'exchange',
        referenceId: orderResult._id,
        createdAt: now
      }
    })
    
    // 减少商品库存
    await db.collection('products')
      .doc(productId)
      .update({
        data: {
          stock: _.inc(-quantity),
          sold: _.inc(quantity),
          updatedAt: now
        }
      })
    
    return {
      success: true,
      data: {
        orderId: orderResult._id,
        balance: newBalance,
        message: '兑换成功'
      }
    }
  } catch (error) {
    console.error('创建兑换订单失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
