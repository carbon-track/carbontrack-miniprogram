const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 批量创建数据库表结构
 * P0: products（商品）、transactions（交易记录）、exchange_orders（兑换订单）
 * P1: achievements（成就）、user_achievements（用户成就）、activities（活动）、messages（消息）
 * P2: announcements（公告）、feedback（反馈）、user_settings（设置）
 */
exports.main = async (event, context) => {
  const { createTestData = false } = event;

  try {
    const results = [];

    // ============ P0 级别表 ============

    // 1. products - 商品表
    await db.collection('products').add({
      data: {
        name: 'system_init',
        points: 0,
        stock: 0,
        category: 'init',
        image: '',
        description: 'System initialization record',
        status: 'inactive',
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    });
    results.push({ table: 'products', status: 'created' });

    // 2. transactions - 交易记录表
    await db.collection('transactions').add({
      data: {
        user_openid: 'system_init',
        type: 'earn',
        points: 0,
        source: 'system',
        description: 'System initialization record',
        balance_after: 0,
        created_at: db.serverDate()
      }
    });
    results.push({ table: 'transactions', status: 'created' });

    // 3. exchange_orders - 兑换订单表
    await db.collection('exchange_orders').add({
      data: {
        user_openid: 'system_init',
        product_id: 'system_init',
        product_name: '初始化记录',
        points: 0,
        status: 'cancelled',
        shipping_info: {},
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    });
    results.push({ table: 'exchange_orders', status: 'created' });

    // ============ P1 级别表 ============

    // 4. achievements - 成就表
    const achievementData = [
      {
        id: 'first_record',
        name: '初次记录',
        description: '首次记录碳足迹',
        icon: '🌱',
        points: 10,
        condition: { type: 'carbon_records_count', value: 1 }
      },
      {
        id: 'carbon_saver_10',
        name: '低碳达人',
        description: '累计减少10kg碳排放',
        icon: '🌍',
        points: 50,
        condition: { type: 'total_carbon_saved', value: 10 }
      },
      {
        id: 'streak_7',
        name: '连续打卡7天',
        description: '连续7天记录碳足迹',
        icon: '🔥',
        points: 100,
        condition: { type: 'continuous_days', value: 7 }
      },
      {
        id: 'exchanger_5',
        name: '兑换新手',
        description: '首次兑换商品',
        icon: '🎁',
        points: 20,
        condition: { type: 'exchange_count', value: 1 }
      },
      {
        id: 'top_10',
        name: '排行榜前十',
        description: '进入排行榜前十',
        icon: '🏆',
        points: 200,
        condition: { type: 'rank_position', value: 10 }
      },
      {
        id: 'carbon_master_100',
        name: '碳中和大师',
        description: '累计减少100kg碳排放',
        icon: '🌳',
        points: 500,
        condition: { type: 'total_carbon_saved', value: 100 }
      },
      {
        id: 'system_init',
        name: '系统初始化',
        description: '系统初始化记录',
        icon: '⚙️',
        points: 0,
        condition: { type: 'always' }
      }
    ];

    for (const achievement of achievementData) {
      await db.collection('achievements').add({
        data: {
          ...achievement,
          created_at: db.serverDate(),
          updated_at: db.serverDate()
        }
      });
    }
    results.push({ table: 'achievements', count: achievementData.length, status: 'created' });

    // 5. user_achievements - 用户成就表
    await db.collection('user_achievements').add({
      data: {
        user_openid: 'system_init',
        achievement_id: 'system_init',
        achieved_at: db.serverDate()
      }
    });
    results.push({ table: 'user_achievements', status: 'created' });

    // 6. activities - 活动表
    const activityData = [
      {
        id: 'planting_season',
        title: '春日植树季',
        description: '参与植树活动，记录绿色足迹',
        image: '',
        start_time: new Date('2026-03-01'),
        end_time: new Date('2026-04-30'),
        points_bonus: 2,
        status: 'upcoming',
        rules: '活动期间记录碳足迹可获得双倍积分',
        carbonFactor: 0
      },
      {
        id: 'earth_day',
        title: '地球日挑战',
        description: '地球日特别活动，共同守护蓝色星球',
        image: '',
        start_time: new Date('2026-04-01'),
        end_time: new Date('2026-04-30'),
        points_bonus: 3,
        status: 'upcoming',
        rules: '连续7天记录可获得额外奖励',
        carbonFactor: 0
      },
      {
        id: 'system_init',
        title: '系统初始化',
        description: '系统初始化记录',
        image: '',
        start_time: new Date('2024-01-01'),
        end_time: new Date('2024-12-31'),
        points_bonus: 1,
        status: 'ended',
        rules: '系统初始化活动',
        carbonFactor: 0
      }
    ];

    for (const activity of activityData) {
      await db.collection('activities').add({
        data: {
          ...activity,
          created_at: db.serverDate(),
          updated_at: db.serverDate()
        }
      });
    }
    results.push({ table: 'activities', count: activityData.length, status: 'created' });

    // 7. messages - 消息表
    const messageData = [
      {
        type: 'system',
        title: '欢迎来到CarbonTrack',
        content: '感谢您使用CarbonTrack，让我们一起为地球减碳！',
        is_read: false,
        created_at: db.serverDate()
      },
      {
        type: 'system',
        title: '新功能上线',
        content: '积分商城已上线，快来兑换精美礼品吧！',
        is_read: false,
        created_at: db.serverDate()
      },
      {
        type: 'activity',
        title: '春日植树季即将开始',
        content: '参与春日植树活动，双倍积分等你来拿！',
        is_read: false,
        created_at: db.serverDate()
      }
    ];

    for (const message of messageData) {
      await db.collection('messages').add({
        data: message
      });
    }
    results.push({ table: 'messages', count: messageData.length, status: 'created' });

    // ============ P2 级别表 ============

    // 8. announcements - 公告表
    const announcementData = [
      {
        title: 'CarbonTrack 正式上线',
        content: '感谢您的支持，CarbonTrack 正式上线！',
        priority: 'high',
        is_published: true,
        published_at: db.serverDate(),
        created_at: db.serverDate()
      },
      {
        title: '积分商城使用说明',
        content: '通过记录碳足迹获得积分，在商城兑换心仪商品。',
        priority: 'normal',
        is_published: true,
        published_at: db.serverDate(),
        created_at: db.serverDate()
      }
    ];

    for (const announcement of announcementData) {
      await db.collection('announcements').add({
        data: announcement
      });
    }
    results.push({ table: 'announcements', count: announcementData.length, status: 'created' });

    // 9. feedback - 反馈表
    await db.collection('feedback').add({
      data: {
        user_openid: 'system_init',
        type: 'suggestion',
        content: 'System initialization record',
        status: 'processed',
        reply: '',
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    });
    results.push({ table: 'feedback', status: 'created' });

    // 10. user_settings - 用户设置表
    await db.collection('user_settings').add({
      data: {
        user_openid: 'system_init',
        notification_enabled: true,
        activity_notification: true,
        system_notification: true,
        language: 'zh-CN',
        theme: 'auto',
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    });
    results.push({ table: 'user_settings', status: 'created' });

    // ============ 可选：创建测试数据 ============
    if (createTestData) {
      // 创建测试商品
      const productsData = [
        { name: '环保购物袋', points: 100, stock: 50, category: 'daily', image: '', description: '可重复使用的环保购物袋', status: 'active' },
        { name: '植物种子包', points: 200, stock: 30, category: 'planting', image: '', description: '包含多种植物种子，开启绿色生活', status: 'active' },
        { name: '竹制餐具套装', points: 300, stock: 20, category: 'daily', image: '', description: '天然竹制餐具，环保健康', status: 'active' },
        { name: '环保水杯', points: 150, stock: 40, category: 'daily', image: '', description: 'BPA Free环保水杯', status: 'active' },
        { name: '太阳能充电宝', points: 1000, stock: 10, category: 'tech', image: '', description: '太阳能充电宝，绿色能源', status: 'active' },
        { name: '有机蔬菜券', points: 500, stock: 25, category: 'food', image: '', description: '价值50元的有机蔬菜兑换券', status: 'active' },
        { name: '碳中和证书', points: 2000, stock: 100, category: 'certificate', image: '', description: '个人碳中和荣誉证书', status: 'active' },
        { name: '树苗种植基金', points: 800, stock: 50, category: 'planting', image: '', description: '捐赠用于植树造林', status: 'active' }
      ];

      for (const product of productsData) {
        await db.collection('products').add({
          data: {
            ...product,
            created_at: db.serverDate(),
            updated_at: db.serverDate()
          }
        });
      }
      results.push({ table: 'products', count: productsData.length, status: 'test_data_added' });
    }

    return {
      success: true,
      message: '数据库表创建成功',
      results: results,
      total: results.length
    };

  } catch (error) {
    console.error('创建数据库表失败:', error);
    return {
      success: false,
      message: '创建数据库表失败',
      error: error.message
    };
  }
};
