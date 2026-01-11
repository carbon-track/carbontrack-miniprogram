const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 初始化碳核算规则基础数据
 * 包含常见的环保活动类型及其碳核算系数
 */
exports.main = async (event, context) => {
  try {
    // 碳核算规则基础数据
    const carbonRules = [
      {
        name: '步行',
        category: 'transport',
        unit: '公里',
        carbonFactor: 0.15,
        description: '步行代替驾车，减少碳排放。每公里可减少约0.15kg CO2',
        status: 'active',
        sort: 10
      },
      {
        name: '骑行',
        category: 'transport',
        unit: '公里',
        carbonFactor: 0.21,
        description: '骑自行车代替驾车，每公里可减少约0.21kg CO2',
        status: 'active',
        sort: 20
      },
      {
        name: '公共交通',
        category: 'transport',
        unit: '公里',
        carbonFactor: 0.15,
        description: '乘坐公交地铁代替私家车，每公里可减少约0.15kg CO2',
        status: 'active',
        sort: 30
      },
      {
        name: '节约用水',
        category: 'energy',
        unit: '升',
        carbonFactor: 0.019,
        description: '节约用水，每升可减少约0.019kg CO2（考虑水处理能耗）',
        status: 'active',
        sort: 40
      },
      {
        name: '节约用电',
        category: 'energy',
        unit: '度',
        carbonFactor: 0.785,
        description: '节约用电，每度电可减少约0.785kg CO2',
        status: 'active',
        sort: 50
      },
      {
        name: '自带杯/餐具',
        category: 'consumption',
        unit: '次',
        carbonFactor: 0.05,
        description: '自带杯子或餐具代替一次性用品，每次可减少约0.05kg CO2。拒绝一次性，环保从我做起！',
        status: 'active',
        sort: 60,
        pointsFactor: 80
      },
      {
        name: '垃圾分类回收',
        category: 'recycle',
        unit: '次',
        carbonFactor: 0.12,
        description: '正确分类回收垃圾，每次可减少约0.12kg CO2',
        status: 'active',
        sort: 70
      },
      {
        name: '使用环保袋',
        category: 'consumption',
        unit: '次',
        carbonFactor: 0.03,
        description: '使用环保购物袋代替塑料袋，每次可减少约0.03kg CO2。小行动大改变，积少成多！',
        status: 'active',
        sort: 80,
        pointsFactor: 100
      },
      {
        name: '使用环保袋',
        category: 'consumption',
        unit: '次',
        carbonFactor: 0.03,
        description: '使用环保购物袋代替塑料袋，每次可减少约0.03kg CO2。小行动大改变，积少成多！',
        status: 'active',
        sort: 80,
        pointsFactor: 100
      },
      {
        name: '植树造林',
        category: 'carbon_sink',
        unit: '棵',
        carbonFactor: 22.0,
        description: '每棵树每年可吸收约22kg CO2',
        status: 'active',
        sort: 90
      },
      {
        name: '光盘行动',
        category: 'food',
        unit: '餐',
        carbonFactor: 0.15,
        description: '减少食物浪费，每餐可减少约0.15kg CO2（考虑食物生产、运输等环节）',
        status: 'active',
        sort: 100
      },
      {
        name: '绿色出行',
        category: 'transport',
        unit: '次',
        carbonFactor: 0.5,
        description: '选择步行、骑行或公共交通代替私家车出行，每次可减少约0.5kg CO2',
        status: 'active',
        sort: 110
      }
    ];

    // 检查是否已存在数据
    const existingRules = await db.collection('carbon_rules').where({
      status: 'active'
    }).get();

    if (existingRules.data.length > 0) {
      // 如果已有数据，询问是否覆盖
      const { overwrite = false } = event;
      
      if (!overwrite) {
        return {
          success: true,
          message: '碳核算规则已存在，跳过初始化',
          existingCount: existingRules.data.length,
          tip: '如需覆盖，请调用此函数并传入 overwrite: true'
        };
      }
      
      // 删除旧数据（如果overwrite=true）
      const deletePromises = existingRules.data.map(rule => 
        db.collection('carbon_rules').doc(rule._id).remove()
      );
      await Promise.all(deletePromises);
    }

    // 批量插入新数据
    const batchSize = 100; // 每次批量插入的数量
    const insertPromises = [];

    for (let i = 0; i < carbonRules.length; i += batchSize) {
      const batch = carbonRules.slice(i, i + batchSize);
      const batchPromise = Promise.all(
        batch.map(rule => 
          db.collection('carbon_rules').add({
            data: {
              ...rule,
              created_at: db.serverDate(),
              updated_at: db.serverDate()
            }
          })
        )
      );
      insertPromises.push(batchPromise);
    }

    await Promise.all(insertPromises);

    return {
      success: true,
      message: '碳核算规则初始化成功',
      total: carbonRules.length,
      rules: carbonRules
    };

  } catch (error) {
    console.error('初始化碳核算规则失败:', error);
    return {
      success: false,
      message: '初始化碳核算规则失败',
      error: error.message
    };
  }
};
