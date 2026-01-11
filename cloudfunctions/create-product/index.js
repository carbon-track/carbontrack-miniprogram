// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { name, description, price, category, image, stock, sort = 0 } = event
  
  // 验证必填字段
  if (!name || !price || !category) {
    return {
      success: false,
      error: '商品名称、价格和分类不能为空'
    }
  }
  
  try {
    const now = new Date()
    
    // 创建商品
    const result = await db.collection('products').add({
      data: {
        name,
        description: description || '',
        price: Number(price),
        category,
        image: image || '',
        stock: Number(stock) || 999,
        sold: 0,
        sort: Number(sort),
        status: 'active',
        createdAt: now,
        updatedAt: now,
        createdBy: wxContext.OPENID
      }
    })
    
    return {
      success: true,
      data: {
        id: result._id,
        message: '商品创建成功'
      }
    }
  } catch (error) {
    console.error('创建商品失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
