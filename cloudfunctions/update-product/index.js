// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { productId, name, description, price, category, image, stock, sort, status } = event
  
  if (!productId) {
    return {
      success: false,
      error: '商品ID不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 构建更新数据
    const updateData = { updatedAt: now }
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number(price)
    if (category !== undefined) updateData.category = category
    if (image !== undefined) updateData.image = image
    if (stock !== undefined) updateData.stock = Number(stock)
    if (sort !== undefined) updateData.sort = Number(sort)
    if (status !== undefined) updateData.status = status
    
    // 更新商品
    const result = await db.collection('products')
      .doc(productId)
      .update({
        data: updateData
      })
    
    return {
      success: true,
      message: '商品更新成功'
    }
  } catch (error) {
    console.error('更新商品失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
