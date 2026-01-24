// 云函数：修复剩余缺失 amount 和 unit 的记录
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    // 更新"自带杯/餐具"的记录
    const update1 = await db.collection('carbon_records')
      .where({
        activityType: '自带杯/餐具',
        amount: _.exists(false)
      })
      .update({
        data: {
          amount: 23.08,
          unit: '次'
        }
      });

    // 更新"使用环保袋"的记录
    const update2 = await db.collection('carbon_records')
      .where({
        activityType: '使用环保袋',
        amount: _.exists(false)
      })
      .update({
        data: {
          amount: 3.16,
          unit: '次'
        }
      });

    return {
      success: true,
      message: '修复完成',
      result: {
        '自带杯/餐具': update1.stats.updated,
        '使用环保袋': update2.stats.updated
      }
    };
  } catch (error) {
    console.error('修复失败:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};
