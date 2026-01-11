// Update CloudBase functions to Node.js 16 runtime
// Run this in browser console after logging into CloudBase console

const functionsToUpdate = [
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

// CloudBase Web SDK API call to update function runtime
async function updateFunctionRuntime(functionName) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'tcb-admin',
      data: {
        action: 'updateFunctionConfig',
        envId: 'pangou-8g51newcf37c99d1',
        functionName: functionName,
        config: {
          runtime: 'Nodejs16.13'
        }
      }
    });
    
    console.log(`✅ Updated ${functionName} to Node.js 16.13`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update ${functionName}:`, error);
    return false;
  }
}

// Batch update all functions
async function batchUpdateRuntimes() {
  console.log('Starting batch update of function runtimes to Node.js 16.13...');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const funcName of functionsToUpdate) {
    const success = await updateFunctionRuntime(funcName);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n========================================`);
  console.log(`Update Complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

// Run the batch update
// Uncomment the line below to run:
// batchUpdateRuntimes();
