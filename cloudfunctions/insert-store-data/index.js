// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const results = {
    products: { success: false, message: '' },
    achievements: { success: false, message: '' },
    activities: { success: false, message: '' }
  }
  
  try {
    // 插入商品数据
    const products = [
      {
        name: '环保购物袋',
        description: '可重复使用的高质量环保购物袋，减少塑料袋使用',
        price: 100,
        category: 'daily',
        image: '',
        stock: 500,
        sold: 0,
        sort: 1,
        status: 'active'
      },
      {
        name: '便携式餐具套装',
        description: '包含筷、勺、叉的便携式不锈钢餐具套装',
        price: 150,
        category: 'daily',
        image: '',
        stock: 300,
        sold: 0,
        sort: 2,
        status: 'active'
      },
      {
        name: '碳减排证书',
        description: '官方认证的碳减排证书，记录您的环保贡献',
        price: 500,
        category: 'certificate',
        image: '',
        stock: 100,
        sold: 0,
        sort: 3,
        status: 'active'
      },
      {
        name: '环保水杯',
        description: 'BPA免费的保温水杯，容量500ml',
        price: 300,
        category: 'daily',
        image: '',
        stock: 200,
        sold: 0,
        sort: 4,
        status: 'active'
      },
      {
        name: '植物种子礼包',
        description: '包含多种环保植物种子，种植绿色希望',
        price: 200,
        category: 'plant',
        image: '',
        stock: 400,
        sold: 0,
        sort: 5,
        status: 'active'
      },
      {
        name: '环保T恤',
        description: '使用有机棉制成的环保T恤，舒适透气',
        price: 400,
        category: 'clothing',
        image: '',
        stock: 150,
        sold: 0,
        sort: 6,
        status: 'active'
      }
    ]
    
    for (const product of products) {
      await db.collection('products').add({
        data: {
          ...product,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }
    
    results.products.success = true
    results.products.message = '成功插入6个商品'
    
  } catch (error) {
    results.products.success = false
    results.products.message = error.message
  }
  
  try {
    // 插入成就数据
    const achievements = [
      {
        name: '初次记录',
        description: '完成第一次碳足迹记录',
        category: 'carbon',
        points: 10,
        icon: '',
        condition: { type: 'total_records', value: 1 },
        sort: 1,
        status: 'active'
      },
      {
        name: '环保新手',
        description: '累计记录10次碳足迹',
        category: 'carbon',
        points: 50,
        icon: '',
        condition: { type: 'total_records', value: 10 },
        sort: 2,
        status: 'active'
      },
      {
        name: '环保达人',
        description: '累计记录50次碳足迹',
        category: 'carbon',
        points: 200,
        icon: '',
        condition: { type: 'total_records', value: 50 },
        sort: 3,
        status: 'active'
      },
      {
        name: '减碳先锋',
        description: '累计减少10kg碳排放',
        category: 'carbon',
        points: 100,
        icon: '',
        condition: { type: 'total_carbon', value: 10 },
        sort: 4,
        status: 'active'
      },
      {
        name: '连续登录3天',
        description: '连续登录应用3天',
        category: 'login',
        points: 20,
        icon: '',
        condition: { type: 'consecutive_days', value: 3 },
        sort: 5,
        status: 'active'
      },
      {
        name: '连续登录7天',
        description: '连续登录应用7天',
        category: 'login',
        points: 50,
        icon: '',
        condition: { type: 'consecutive_days', value: 7 },
        sort: 6,
        status: 'active'
      },
      {
        name: '积分新手',
        description: '累计获得100积分',
        category: 'points',
        points: 30,
        icon: '',
        condition: { type: 'total_points', value: 100 },
        sort: 7,
        status: 'active'
      },
      {
        name: '积分达人',
        description: '累计获得1000积分',
        category: 'points',
        points: 100,
        icon: '',
        condition: { type: 'total_points', value: 1000 },
        sort: 8,
        status: 'active'
      }
    ]
    
    for (const achievement of achievements) {
      await db.collection('achievements').add({
        data: {
          ...achievement,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }
    
    results.achievements.success = true
    results.achievements.message = '成功插入8个成就'
    
  } catch (error) {
    results.achievements.success = false
    results.achievements.message = error.message
  }
  
  try {
    // 插入活动数据
    const activities = [
      {
        name: '每日打卡',
        description: '每天记录一次碳足迹',
        type: 'daily',
        targetValue: 1,
        rewardPoints: 5,
        image: '',
        sort: 1,
        status: 'active'
      },
      {
        name: '减碳挑战',
        description: '一周内累计减少5kg碳排放',
        type: 'weekly',
        targetValue: 5,
        rewardPoints: 50,
        image: '',
        sort: 2,
        status: 'active'
      },
      {
        name: '积分达人',
        description: '累计获得500积分',
        type: 'points',
        targetValue: 500,
        rewardPoints: 100,
        image: '',
        sort: 3,
        status: 'active'
      },
      {
        name: '分享达人',
        description: '分享应用给3位好友',
        type: 'social',
        targetValue: 3,
        rewardPoints: 30,
        image: '',
        sort: 4,
        status: 'active'
      }
    ]
    
    for (const activity of activities) {
      await db.collection('activities').add({
        data: {
          ...activity,
          participants: 0,
          completions: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }
    
    results.activities.success = true
    results.activities.message = '成功插入4个活动'
    
  } catch (error) {
    results.activities.success = false
    results.activities.message = error.message
  }
  
  return results
}
