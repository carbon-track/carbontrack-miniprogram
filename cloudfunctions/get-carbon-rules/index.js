const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 获取碳核算规则列表
 * 用于前端计算碳排放量，支持动态配置
 */
exports.main = async (event, context) => {
  const { category, status = 'active' } = event;

  try {
    let query = db.collection('carbon_rules')
      .where({
        status: status
      })
      .orderBy('sort', 'asc');

    // 如果指定了分类，添加分类筛选
    if (category) {
      query = query.where({
        status: status,
        category: category
      });
    }

    const result = await query.get();

    return {
      success: true,
      data: result.data,
      total: result.data.length
    };

  } catch (error) {
    console.error('获取碳核算规则失败:', error);
    return {
      success: false,
      message: '获取碳核算规则失败',
      error: error.message
    };
  }
};
