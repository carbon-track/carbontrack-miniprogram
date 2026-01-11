/**
 * 碳足迹计算工具
 * 根据用户的环保活动计算碳减排量
 */

/**
 * 活动类型常量及对应的碳排放系数
 * 单位：kg CO2e
 */
const ACTIVITY_TYPES = {
  '购物时自带袋子 / Bring your own bag when shopping': { 
    name: '购物时自带袋子', 
    factor: 0.0190,
    unit: '次',
    icon: 'shopping-bag'
  },
  '早睡觉一小时 / Sleep an hour earlier': { 
    name: '早睡觉一小时', 
    factor: 0.0950,
    unit: '次',
    icon: 'moon'
  },
  '刷牙时关掉水龙头 / Turn off the tap while brushing teeth': { 
    name: '刷牙时关掉水龙头', 
    factor: 0.0090,
    unit: '次',
    icon: 'faucet'
  },
  '不使用一次性餐具 / Avoid disposable tableware': { 
    name: '不使用一次性餐具', 
    factor: 0.0260,
    unit: '次',
    icon: 'cutlery'
  },
  '种植一棵树 / Plant a tree': { 
    name: '种植一棵树', 
    factor: 10.0000,
    unit: '棵',
    icon: 'tree'
  },
  '少使用一次性杯子 / Use fewer disposable cups': { 
    name: '少使用一次性杯子', 
    factor: 0.0050,
    unit: '次',
    icon: 'mug'
  },
  '使用公共交通代替私家车 / Use public transport instead of private car': { 
    name: '使用公共交通代替私家车', 
    factor: 0.2150,
    unit: '次',
    icon: 'bus'
  },
  '步行或骑行代替短途出行 / Walk or cycle instead of short trips': { 
    name: '步行或骑行代替短途出行', 
    factor: 0.1500,
    unit: '公里',
    icon: 'walking'
  },
  '光盘行动 / Clean plate campaign': { 
    name: '光盘行动', 
    factor: 0.0800,
    unit: '次',
    icon: 'plate'
  },
  '使用可充电电池 / Use rechargeable batteries': { 
    name: '使用可充电电池', 
    factor: 0.0120,
    unit: '节',
    icon: 'battery'
  },
  '垃圾分类回收 / Waste sorting and recycling': { 
    name: '垃圾分类回收', 
    factor: 0.0150,
    unit: '次',
    icon: 'recycle'
  },
  '少开一天空调 / Reduce air conditioner usage': { 
    name: '少开一天空调', 
    factor: 2.5000,
    unit: '天',
    icon: 'air-conditioner'
  },
  '使用节能灯泡 / Use energy-saving light bulbs': { 
    name: '使用节能灯泡', 
    factor: 0.0500,
    unit: '个',
    icon: 'lightbulb'
  },
  '减少肉类消费 / Reduce meat consumption': { 
    name: '减少肉类消费', 
    factor: 0.3500,
    unit: '次',
    icon: 'carrot'
  },
  '打印时双面打印 / Print on both sides': { 
    name: '打印时双面打印', 
    factor: 0.0030,
    unit: '张',
    icon: 'printer'
  },
  '少用电梯爬楼梯 / Take stairs instead of elevator': { 
    name: '少用电梯爬楼梯', 
    factor: 0.0100,
    unit: '次',
    icon: 'stairs'
  },
  '使用电子发票代替纸质发票 / Use e-invoices instead of paper invoices': { 
    name: '使用电子发票代替纸质发票', 
    factor: 0.0020,
    unit: '次',
    icon: 'receipt'
  },
  '及时关闭不使用的电器 / Turn off unused appliances': { 
    name: '及时关闭不使用的电器', 
    factor: 0.0200,
    unit: '次',
    icon: 'power'
  },
  '减少淋浴时间 / Reduce shower time': { 
    name: '减少淋浴时间', 
    factor: 0.0350,
    unit: '次',
    icon: 'shower'
  },
  '购买本地食材 / Buy local food': { 
    name: '购买本地食材', 
    factor: 0.1200,
    unit: '次',
    icon: 'basket'
  },
  '使用再生纸制品 / Use recycled paper products': { 
    name: '使用再生纸制品', 
    factor: 0.0040,
    unit: '件',
    icon: 'paper'
  },
  '修复损坏物品代替丢弃 / Repair instead of discard': { 
    name: '修复损坏物品代替丢弃', 
    factor: 0.1500,
    unit: '件',
    icon: 'wrench'
  },
  '使用手帕代替纸巾 / Use handkerchief instead of tissues': { 
    name: '使用手帕代替纸巾', 
    factor: 0.0015,
    unit: '次',
    icon: 'handkerchief'
  },
  '减少网购频率 / Reduce online shopping frequency': { 
    name: '减少网购频率', 
    factor: 0.2000,
    unit: '次',
    icon: 'shopping-cart'
  },
  '自带水杯代替瓶装水 / Bring your own water bottle': { 
    name: '自带水杯代替瓶装水', 
    factor: 0.0080,
    unit: '次',
    icon: 'water-bottle'
  },
  '使用环保购物袋 / Use eco-friendly shopping bags': { 
    name: '使用环保购物袋', 
    factor: 0.0200,
    unit: '次',
    icon: 'eco-bag'
  },
  '参与社区环保活动 / Participate in community environmental activities': { 
    name: '参与社区环保活动', 
    factor: 0.5000,
    unit: '次',
    icon: 'community'
  },
  '减少一次性塑料使用 / Reduce single-use plastic': { 
    name: '减少一次性塑料使用', 
    factor: 0.0300,
    unit: '次',
    icon: 'plastic-free'
  },
  '使用太阳能产品 / Use solar-powered products': { 
    name: '使用太阳能产品', 
    factor: 0.0450,
    unit: '次',
    icon: 'solar'
  },
  '种植室内植物 / Plant indoor plants': { 
    name: '种植室内植物', 
    factor: 0.1000,
    unit: '盆',
    icon: 'potted-plant'
  },
  '旧衣物回收再利用 / Recycle old clothes': { 
    name: '旧衣物回收再利用', 
    factor: 0.0700,
    unit: '件',
    icon: 'tshirt'
  },
  '使用天然清洁用品 / Use natural cleaning products': { 
    name: '使用天然清洁用品', 
    factor: 0.0180,
    unit: '次',
    icon: 'cleaning'
  },
  '参与碳补偿项目 / Participate in carbon offset projects': { 
    name: '参与碳补偿项目', 
    factor: 1.0000,
    unit: '次',
    icon: 'carbon-offset'
  },
  '使用环保交通工具 / Use eco-friendly transportation': { 
    name: '使用环保交通工具', 
    factor: 0.1800,
    unit: '公里',
    icon: 'bike'
  },
  '减少电器待机能耗 / Reduce appliance standby energy': { 
    name: '减少电器待机能耗', 
    factor: 0.0060,
    unit: '次',
    icon: 'standby'
  },
  '购买二手商品 / Buy second-hand goods': { 
    name: '购买二手商品', 
    factor: 0.3000,
    unit: '件',
    icon: 'second-hand'
  },
  '减少化妆品使用 / Reduce cosmetic use': { 
    name: '减少化妆品使用', 
    factor: 0.0050,
    unit: '次',
    icon: 'cosmetics'
  }
};

/**
 * 计算碳减排量
 * @param {string} activityType - 活动类型
 * @param {number} amount - 活动数量
 * @returns {number} 碳减排量（kg）
 */
const calculateCarbonSavings = (activityType, amount) => {
  // 输入验证
  if (!activityType || typeof amount !== 'number' || amount <= 0) {
    throw new Error('无效的输入参数');
  }
  
  // 获取活动信息
  const activity = ACTIVITY_TYPES[activityType];
  if (!activity) {
    throw new Error('未知的活动类型');
  }
  
  // 计算碳减排量
  const carbonSavings = activity.factor * amount;
  
  // 返回两位小数的结果
  return parseFloat(carbonSavings.toFixed(4));
};

/**
 * 计算积分（基于碳减排量）
 * @param {number} carbonSavings - 碳减排量（kg）
 * @returns {number} 获得的积分
 */
const calculatePoints = (carbonSavings) => {
  // 简单的积分换算规则：1kg CO2e = 10积分
  return Math.round(carbonSavings * 10);
};

/**
 * 获取所有活动类型
 * @returns {Array} 活动类型数组
 */
const getAllActivityTypes = () => {
  return Object.entries(ACTIVITY_TYPES).map(([key, value]) => ({
    id: key,
    name: value.name,
    unit: value.unit,
    icon: value.icon
  }));
};

/**
 * 获取活动类型详情
 * @param {string} activityId - 活动ID
 * @returns {Object|null} 活动详情对象
 */
const getActivityTypeById = (activityId) => {
  const activity = ACTIVITY_TYPES[activityId];
  if (!activity) return null;
  
  return {
    id: activityId,
    name: activity.name,
    factor: activity.factor,
    unit: activity.unit,
    icon: activity.icon
  };
};

/**
 * 根据关键字搜索活动
 * @param {string} keyword - 搜索关键字
 * @returns {Array} 匹配的活动数组
 */
const searchActivities = (keyword) => {
  if (!keyword) return getAllActivityTypes();
  
  const lowerKeyword = keyword.toLowerCase();
  const result = [];
  
  for (const [key, activity] of Object.entries(ACTIVITY_TYPES)) {
    if (activity.name.toLowerCase().includes(lowerKeyword)) {
      result.push({
        id: key,
        name: activity.name,
        unit: activity.unit,
        icon: activity.icon
      });
    }
  }
  
  return result;
};

module.exports = {
  ACTIVITY_TYPES,
  calculateCarbonSavings,
  calculatePoints,
  getAllActivityTypes,
  getActivityTypeById,
  searchActivities
};