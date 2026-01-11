// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { productId } = event
  
  if (!productId) {
    return {
      success: false,
      error: '商品ID不能为空'
    }
  }
  
  try {
    // 查询商品详情
    const result = await db.collection('products')
      .doc(productId)
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
