const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 更新碳核算规则（管理员用）
 */
exports.main = async (event, context) => {
  const { id, data } = event;
  const wxContext = cloud.getWXContext();

  try {
    // 验证参数
    if (!id || !data) {
      return {
        success: false,
        message: '参数错误：id 和 data 不能为空'
      };
    }

    // 更新数据
    const updateData = {
      ...data,
      updated_at: db.serverDate()
    };

    const result = await db.collection('carbon_rules').doc(id).update({
      data: updateData
    });

    if (result.stats.updated === 0) {
      return {
        success: false,
        message: '更新失败：规则不存在'
      };
    }

    return {
      success: true,
      message: '碳核算规则更新成功'
    };

  } catch (error) {
    console.error('更新碳核算规则失败:', error);
    return {
      success: false,
      message: '更新碳核算规则失败',
      error: error.message
    };
  }
};
