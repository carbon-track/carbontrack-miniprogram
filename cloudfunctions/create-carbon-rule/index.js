const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 创建碳核算规则（管理员用）
 */
exports.main = async (event, context) => {
  const { 
    name, 
    category, 
    unit, 
    carbonFactor, 
    description = '',
    status = 'active',
    sort = 100
  } = event;

  try {
    // 验证必填参数
    if (!name || !category || !unit || carbonFactor === undefined) {
      return {
        success: false,
        message: '参数错误：name, category, unit, carbonFactor 为必填项'
      };
    }

    // 验证 carbonFactor 数值
    if (typeof carbonFactor !== 'number' || isNaN(carbonFactor)) {
      return {
        success: false,
        message: '参数错误：carbonFactor 必须是有效的数字'
      };
    }

    const data = {
      name,
      category,
      unit,
      carbonFactor,
      description,
      status,
      sort,
      created_at: db.serverDate(),
      updated_at: db.serverDate()
    };

    const result = await db.collection('carbon_rules').add({
      data
    });

    return {
      success: true,
      message: '碳核算规则创建成功',
      data: {
        id: result._id,
        ...data
      }
    };

  } catch (error) {
    console.error('创建碳核算规则失败:', error);
    return {
      success: false,
      message: '创建碳核算规则失败',
      error: error.message
    };
  }
};
