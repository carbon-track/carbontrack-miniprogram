// 批量更新所有云函数运行时到Node.js 16.13
// 部署此云函数后，在小程序中调用即可批量更新

const cloud = require('wx-server-sdk');
const { CloudBaseManager } = require('@cloudbase/manager-node');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 需要更新的云函数列表
const FUNCTIONS_TO_UPDATE = [
  'get-products', 'get-product-detail', 'create-product', 'update-product',
  'get-balance', 'get-transactions', 'add-transaction',
  'create-exchange-order', 'get-exchange-orders', 'get-exchange-order-detail', 'update-exchange-order',
  'get-achievements', 'check-achievements', 'create-achievement',
  'get-activities', 'join-activity', 'update-activity-progress', 'claim-activity-reward', 'create-activity',
  'get-messages', 'mark-message-read', 'send-message', 'delete-message',
  'get-announcements', 'get-announcement-detail', 'create-announcement', 'update-announcement',
  'submit-feedback', 'get-feedback-list', 'reply-feedback',
  'get-user-settings', 'update-user-settings',
  'create-test-store-data', 'insert-store-data', 'query-users'
];

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { envId = cloud.DYNAMIC_CURRENT_ENV } = event;
  
  // 只有管理员可以调用此函数
  const adminOpenIds = ['your_admin_openid']; // 替换为管理员openid
  if (!adminOpenIds.includes(wxContext.OPENID)) {
    return {
      success: false,
      error: 'Permission denied. Admin only.'
    };
  }
  
  try {
    // 初始化管理器
    const manager = new CloudBaseManager({
      secretId: process.env.TENCENTCLOUD_SECRETID,
      secretKey: process.env.TENCENTCLOUD_SECRETKEY,
      token: process.env.TENCENTCLOUD_SESSIONTOKEN,
      envId: envId
    });
    
    const results = {
      success: [],
      failed: [],
      total: FUNCTIONS_TO_UPDATE.length
    };
    
    // 批量更新每个函数
    for (const funcName of FUNCTIONS_TO_UPDATE) {
      try {
        await manager.commonService.call({
          Action: 'UpdateFunctionConfiguration',
          Version: '2020-02-17',
          Region: 'ap-shanghai', // 根据您的区域修改
          ServiceType: 'scf',
          data: {
            FunctionName: funcName,
            Namespace: envId,
            Runtime: 'Nodejs16.13'
          }
        });
        
        results.success.push(funcName);
        console.log(`✅ Updated ${funcName} to Node.js 16.13`);
      } catch (error) {
        results.failed.push({
          function: funcName,
          error: error.message
        });
        console.error(`❌ Failed to update ${funcName}:`, error.message);
      }
      
      // 避免触发频率限制
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return {
      success: true,
      data: {
        results,
        summary: {
          total: FUNCTIONS_TO_UPDATE.length,
          success: results.success.length,
          failed: results.failed.length
        }
      },
      message: `Updated ${results.success.length} functions to Node.js 16.13`
    };
  } catch (error) {
    console.error('Error updating function runtimes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 直接调用（仅用于测试）
// 部署后可以在云函数测试界面直接调用
exports.test = async (event, context) => {
  return await exports.main(event, context);
};
