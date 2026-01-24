// 云函数：修复历史记录的 amount 和 unit 字段
// 根据 carbonValue 和 activityType 反向计算 amount

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 活动类型及对应的碳排放系数
const ACTIVITY_TYPES = {
  '购物时自带袋子': { factor: 0.0190, unit: '次' },
  '早睡觉一小时': { factor: 0.0950, unit: '次' },
  '刷牙时关掉水龙头': { factor: 0.0090, unit: '次' },
  '不使用一次性餐具': { factor: 0.0260, unit: '次' },
  '种植一棵树': { factor: 10.0000, unit: '棵' },
  '少使用一次性杯子': { factor: 0.0050, unit: '次' },
  '使用公共交通代替私家车': { factor: 0.2150, unit: '次' },
  '步行或骑行代替短途出行': { factor: 0.1500, unit: '公里' },
  '光盘行动': { factor: 0.0800, unit: '次' },
  '使用可充电电池': { factor: 0.0120, unit: '节' },
  '垃圾分类回收': { factor: 0.0150, unit: '次' },
  '少开一天空调': { factor: 2.5000, unit: '天' },
  '使用节能灯泡': { factor: 0.0500, unit: '个' },
  '减少肉类消费': { factor: 0.3500, unit: '次' },
  '打印时双面打印': { factor: 0.0030, unit: '张' },
  '节约用电': { factor: 0.5, unit: '次' },
  '节约用水': { factor: 0.01, unit: '次' },
  '骑行': { factor: 0.084, unit: '公里' },
  '步行': { factor: 0.15, unit: '公里' },
  '公共交通': { factor: 0.215, unit: '次' },
  '减少一次性用品': { factor: 0.026, unit: '次' },
  '自带杯/餐具': { factor: 0.026, unit: '次' },
  '使用环保袋': { factor: 0.019, unit: '次' }
};

exports.main = async (event, context) => {
  try {
    // 获取所有没有 amount 和 unit 字段的记录
    const { data: records } = await db.collection('carbon_records')
      .where({
        amount: _.exists(false)
      })
      .get();

    console.log(`找到 ${records.length} 条需要修复的记录`);

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const record of records) {
      try {
        const activityType = record.activityType;
        const carbonValue = record.carbonValue;

        // 获取该活动的系数和单位
        const activity = ACTIVITY_TYPES[activityType];

        if (!activity) {
          console.error(`未找到活动类型: ${activityType}`);
          errors.push({
            id: record._id,
            reason: `未找到活动类型: ${activityType}`
          });
          failCount++;
          continue;
        }

        // 反向计算 amount
        const amount = carbonValue / activity.factor;
        const roundedAmount = Math.round(amount * 100) / 100; // 保留两位小数

        // 更新记录
        await db.collection('carbon_records').doc(record._id).update({
          data: {
            amount: roundedAmount,
            unit: activity.unit
          }
        });

        console.log(`修复记录 ${record._id}: amount=${roundedAmount}, unit=${activity.unit}`);
        successCount++;
      } catch (error) {
        console.error(`修复记录 ${record._id} 失败:`, error);
        errors.push({
          id: record._id,
          reason: error.message
        });
        failCount++;
      }
    }

    return {
      success: true,
      message: `修复完成：成功 ${successCount} 条，失败 ${failCount} 条`,
      total: records.length,
      successCount,
      failCount,
      errors: errors.slice(0, 10) // 只返回前 10 个错误
    };
  } catch (error) {
    console.error('批量修复失败:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};
