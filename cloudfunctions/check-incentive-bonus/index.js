const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 检查并发放激励奖励
 * 包括连续参与奖励、特殊时段双倍积分等
 */
exports.main = async (event, context) => {
  const { userId } = event;
  const wxContext = cloud.getWXContext();
  const openid = userId || wxContext.OPENID;

  try {
    // 使用传入日期或当前日期
    const now = event.currentDate ? new Date(event.currentDate) : new Date();
    if (isNaN(now.getTime())) {
      throw new Error('无效的日期格式');
    }
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 获取用户今天的碳记录
    const todayRecords = await db.collection('carbon_records')
      .where({
        userId: openid,
        createTime: _.gte(today)
      })
      .get();

    const hasTodayRecord = todayRecords.data.length > 0;

    // 计算连续打卡天数
    let consecutiveDays = 0;
    if (hasTodayRecord) {
      consecutiveDays = await calculateConsecutiveDays(openid, now);
    }

    // 检查特殊时段双倍积分
    const specialBonus = await checkSpecialBonus(now, todayRecords.data);

    // 计算连续打卡奖励
    const streakBonus = calculateStreakBonus(consecutiveDays);

    // 如果今天有记录且符合奖励条件，发放奖励
    let totalBonusPoints = 0;
    let bonusDetails = [];

    if (hasTodayRecord) {
      // 发放连续打卡奖励
      if (streakBonus > 0) {
        totalBonusPoints += streakBonus;
        bonusDetails.push({
          type: 'streak',
          description: `连续打卡${consecutiveDays}天奖励`,
          points: streakBonus
        });
      }

      // 如果是特殊时段，记录双倍积分（注意：双倍积分在记录时已经计算，这里只发放额外奖励）
      if (specialBonus.isSpecial) {
        bonusDetails.push({
          type: 'special',
          description: specialBonus.description,
          multiplier: 2
        });
      }
    }

    return {
      success: true,
      data: {
        consecutiveDays,
        hasTodayRecord,
        specialBonus,
        streakBonus,
        totalBonusPoints,
        bonusDetails
      }
    };

  } catch (error) {
    console.error('检查激励奖励失败:', error);
    return {
      success: false,
      message: '检查激励奖励失败',
      error: error.message
    };
  }
};

/**
 * 计算连续打卡天数
 */
async function calculateConsecutiveDays(openid, now) {
  let consecutiveDays = 0;
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 从昨天开始往前查，直到找到断点
  for (let i = 1; i <= 365; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - i);
    
    const nextDay = new Date(checkDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const records = await db.collection('carbon_records')
      .where({
        userId: openid,
        createTime: _.gte(checkDate).lt(nextDay)
      })
      .limit(1)
      .get();
    
    if (records.data.length > 0) {
      consecutiveDays++;
    } else {
      break;
    }
  }
  
  // 加上今天
  const todayRecords = await db.collection('carbon_records')
    .where({
      userId: openid,
      createTime: _.gte(currentDate)
    })
    .limit(1)
    .get();
    
  if (todayRecords.data.length > 0) {
    consecutiveDays++;
  }
  
  return consecutiveDays;
}

/**
 * 计算连续打卡奖励
 */
function calculateStreakBonus(consecutiveDays) {
  if (consecutiveDays >= 30) return 150;
  if (consecutiveDays >= 15) return 70;
  if (consecutiveDays >= 7) return 30;
  if (consecutiveDays >= 3) return 10;
  return 0;
}

/**
 * 检查特殊时段双倍积分
 */
async function checkSpecialBonus(now, todayRecords) {
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const dayOfWeek = now.getDay(); // 0=周日, 3=周三

  // 地球日 - 4月22日
  if (month === 4 && date === 22) {
    return { isSpecial: true, description: '🌍 地球日双倍积分' };
  }
  
  // 世界环境日 - 6月5日
  if (month === 6 && date === 5) {
    return { isSpecial: true, description: '🌱 世界环境日双倍积分' };
  }
  
  // 无车日 - 9月22日
  if (month === 9 && date === 22) {
    return { isSpecial: true, description: '🚴 无车日双倍积分' };
  }
  
  // 每周三绿色出行日
  if (dayOfWeek === 3) {
    // 检查今天是否有绿色出行记录
    const hasGreenTravel = todayRecords.some(record => 
      record.activityType && (
        record.activityType.includes('步行') ||
        record.activityType.includes('骑行') ||
        record.activityType.includes('公共交通') ||
        record.activityType.includes('绿色出行')
      )
    );
    
    if (hasGreenTravel) {
      return { isSpecial: true, description: '💚 绿色出行日双倍积分' };
    }
  }

  return { isSpecial: false };
}