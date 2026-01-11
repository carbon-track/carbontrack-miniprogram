# 积分商城系统 - 开发文档

## 系统概述

本系统为 CarbonTrack 小程序添加了完整的积分商城功能，包括商品兑换、积分钱包、成就系统、活动任务、消息通知、公告系统和用户反馈等功能。

---

## 数据库表结构

### 1. products 表（商品表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| name | String | 商品名称 |
| description | String | 商品描述 |
| price | Number | 积分价格 |
| category | String | 商品分类（daily/certificate/plant/clothing） |
| image | String | 商品图片URL |
| stock | Number | 库存数量 |
| sold | Number | 已售数量 |
| sort | Number | 排序权重 |
| status | String | 状态（active/inactive） |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

---

### 2. transactions 表（交易记录表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| userId | String | 用户ID |
| type | String | 交易类型（earn/spend） |
| amount | Number | 交易金额 |
| balance | Number | 交易后余额 |
| description | String | 交易描述 |
| referenceType | String | 关联类型（exchange/achievement/activity/refund等） |
| referenceId | String | 关联ID |
| createdAt | Date | 创建时间 |

---

### 3. exchange_orders 表（兑换订单表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| userId | String | 用户ID |
| productId | String | 商品ID |
| productName | String | 商品名称（快照） |
| productImage | String | 商品图片（快照） |
| quantity | Number | 兑换数量 |
| pointsPrice | Number | 单品积分价格 |
| totalPoints | Number | 总积分 |
| status | String | 订单状态（pending/processing/completed/cancelled/rejected） |
| contactName | String | 联系人姓名 |
| contactPhone | String | 联系电话 |
| address | String | 收货地址 |
| remark | String | 备注 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |
| processedAt | Date | 处理时间 |

---

### 4. achievements 表（成就表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| name | String | 成就名称 |
| description | String | 成就描述 |
| category | String | 分类（carbon/login/points等） |
| points | Number | 奖励积分 |
| icon | String | 图标URL |
| condition | Object | 解锁条件（{type, value}） |
| sort | Number | 排序权重 |
| status | String | 状态（active/inactive） |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

**条件类型（condition.type）:**
- `total_records`: 总记录次数
- `total_carbon`: 总减碳量
- `consecutive_days`: 连续登录天数
- `total_exchanges`: 总兑换次数
- `total_points`: 总获得积分
- `balance`: 当前积分余额

---

### 5. activities 表（活动表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| name | String | 活动名称 |
| description | String | 活动描述 |
| type | String | 活动类型（daily/weekly/points/social） |
| targetValue | Number | 目标值 |
| rewardPoints | Number | 奖励积分 |
| startDate | Date | 开始时间 |
| endDate | Date | 结束时间 |
| image | String | 活动图片 |
| sort | Number | 排序权重 |
| status | String | 状态（active/inactive） |
| participants | Number | 参与人数 |
| completions | Number | 完成人数 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

---

### 6. messages 表（消息表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| userId | String | 用户ID |
| type | String | 消息类型（achievement/activity/feedback/system） |
| title | String | 消息标题 |
| content | String | 消息内容 |
| read | Boolean | 是否已读 |
| readAt | Date | 阅读时间 |
| createdAt | Date | 创建时间 |

---

### 7. announcements 表（公告表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| title | String | 公告标题 |
| content | String | 公告内容 |
| type | String | 公告类型（update/event/maintenance） |
| isTop | Boolean | 是否置顶 |
| status | String | 状态（published/draft/archived） |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

---

### 8. feedback 表（反馈表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| userId | String | 用户ID |
| type | String | 反馈类型（bug/suggestion/other） |
| content | String | 反馈内容 |
| images | Array | 图片URL数组 |
| status | String | 状态（pending/replied/closed） |
| reply | String | 回复内容 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |
| repliedAt | Date | 回复时间 |

---

### 9. user_settings 表（用户设置表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| userId | String | 用户ID |
| settings | Object | 设置对象 |
| - notificationEnabled | Boolean | 消息通知开关 |
| - dailyReminder | Boolean | 每日提醒开关 |
| - reminderTime | String | 提醒时间（HH:mm） |
| - theme | String | 主题（light/dark） |
| - language | String | 语言（zh-CN/en-US） |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

---

## 云函数列表

### P0 - 核心功能

#### 商品管理
- `get-products` - 获取商品列表
- `get-product-detail` - 获取商品详情
- `create-product` - 创建商品（管理员）
- `update-product` - 更新商品（管理员）

#### 积分钱包
- `get-balance` - 获取用户积分余额
- `get-transactions` - 获取交易记录列表
- `add-transaction` - 添加交易记录（系统调用）

#### 兑换功能
- `create-exchange-order` - 创建兑换订单
- `get-exchange-orders` - 获取兑换订单列表
- `get-exchange-order-detail` - 获取兑换订单详情
- `update-exchange-order` - 更新兑换订单状态（管理员）

---

### P1 - 增强功能

#### 成就系统
- `get-achievements` - 获取成就列表
- `check-achievements` - 检查并解锁成就
- `create-achievement` - 创建成就（管理员）

#### 活动系统
- `get-activities` - 获取活动列表
- `join-activity` - 参与活动
- `update-activity-progress` - 更新活动进度
- `claim-activity-reward` - 领取活动奖励
- `create-activity` - 创建活动（管理员）

#### 消息系统
- `get-messages` - 获取消息列表
- `mark-message-read` - 标记消息为已读
- `send-message` - 发送消息（系统/管理员）
- `delete-message` - 删除消息

---

### P2 - 可选功能

#### 公告系统
- `get-announcements` - 获取公告列表
- `get-announcement-detail` - 获取公告详情
- `create-announcement` - 创建公告（管理员）
- `update-announcement` - 更新公告（管理员）

#### 反馈系统
- `submit-feedback` - 提交用户反馈
- `get-feedback-list` - 获取反馈列表（管理员）
- `reply-feedback` - 回复反馈（管理员）

#### 用户设置
- `get-user-settings` - 获取用户设置
- `update-user-settings` - 更新用户设置

---

### 辅助功能

- `insert-store-data` - 初始化积分商城数据（商品、成就、活动）

---

## 云函数调用示例

### 获取商品列表
```javascript
wx.cloud.callFunction({
  name: 'get-products',
  data: {
    category: 'all',  // 可选: all/daily/certificate/plant/clothing
    status: 'active'  // 可选
  }
}).then(res => {
  console.log(res.result.data)
})
```

### 获取积分余额
```javascript
wx.cloud.callFunction({
  name: 'get-balance'
}).then(res => {
  console.log('当前积分:', res.result.data.balance)
})
```

### 创建兑换订单
```javascript
wx.cloud.callFunction({
  name: 'create-exchange-order',
  data: {
    productId: '商品ID',
    quantity: 1,
    contactName: '张三',
    contactPhone: '13800138000',
    address: '北京市朝阳区xxx'
  }
}).then(res => {
  console.log('兑换成功')
})
```

### 检查成就
```javascript
wx.cloud.callFunction({
  name: 'check-achievements',
  data: {
    triggerType: 'carbon_record'  // carbon_record/login/exchange/points
  }
}).then(res => {
  console.log('解锁的成就:', res.result.data.unlocked)
})
```

### 获取活动列表
```javascript
wx.cloud.callFunction({
  name: 'get-activities',
  data: {
    status: 'active'
  }
}).then(res => {
  console.log(res.result.data)
})
```

### 参与活动
```javascript
wx.cloud.callFunction({
  name: 'join-activity',
  data: {
    activityId: '活动ID'
  }
}).then(res => {
  console.log('参与成功')
})
```

### 领取活动奖励
```javascript
wx.cloud.callFunction({
  name: 'claim-activity-reward',
  data: {
    activityId: '活动ID'
  }
}).then(res => {
  console.log('奖励领取成功，获得积分:', res.result.data.rewardPoints)
})
```

### 获取消息列表
```javascript
wx.cloud.callFunction({
  name: 'get-messages',
  data: {
    type: 'all',  // 可选: all/achievement/activity/feedback/system
    page: 1,
    limit: 20
  }
}).then(res => {
  console.log('消息:', res.result.data)
  console.log('未读数:', res.result.unread)
})
```

### 标记消息已读
```javascript
wx.cloud.callFunction({
  name: 'mark-message-read',
  data: {
    messageId: '消息ID',  // 或使用 markAll: true
    markAll: false
  }
})
```

---

## 数据初始化

首次使用前，需要初始化数据：

```javascript
wx.cloud.callFunction({
  name: 'insert-store-data'
}).then(res => {
  console.log('初始化结果:', res.result)
})
```

这将创建：
- 6个商品（环保购物袋、餐具套装、碳减排证书、环保水杯、种子礼包、环保T恤）
- 8个成就（记录类、登录类、积分类）
- 4个活动（每日打卡、减碳挑战、积分达人、分享达人）

---

## users 表扩展字段

需要在现有的 `users` 表中添加以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| points | Number | 当前积分余额 |
| totalPointsEarned | Number | 累计获得积分 |
| achievements | Array | 已解锁的成就ID数组 |
| activityProgress | Object | 活动进度对象 {activityId: {completed, currentProgress, joinedAt}} |
| consecutiveLoginDays | Number | 连续登录天数 |
| totalExchanges | Number | 总兑换次数 |

---

## 业务流程说明

### 兑换商品流程
1. 用户选择商品，确认兑换
2. `create-exchange-order` 校验商品状态、库存、用户积分
3. 扣除积分，创建订单，记录交易，减少库存
4. 管理员通过 `update-exchange-order` 处理订单
5. 若取消/拒绝，自动退还积分、恢复库存

### 成就解锁流程
1. 用户完成特定行为（记录碳足迹、登录等）
2. 调用 `check-achievements` 传入触发类型
3. 系统检查满足的成就条件
4. 自动解锁成就，奖励积分，发送通知

### 活动奖励流程
1. 用户通过 `join-activity` 参与活动
2. 完成相关任务，调用 `update-activity-progress` 更新进度
3. 达成目标后，通过 `claim-activity-reward` 领取奖励
4. 自动奖励积分，发送通知，更新活动统计数据

---

## 注意事项

1. **权限控制**：管理功能（创建/更新商品、成就、活动）需要单独的权限验证
2. **事务处理**：兑换订单涉及多个表操作，需要考虑数据一致性
3. **库存控制**：高并发时需要考虑库存超卖问题
4. **消息通知**：解锁成就、完成活动后会自动发送消息通知
5. **积分安全**：所有积分变动都有交易记录，支持追溯

---

## 开发建议

1. **前端展示**：在积分商城页面、钱包页面、成就页面、活动页面调用对应云函数
2. **定时任务**：可考虑使用定时器自动检查成就、更新活动进度
3. **数据备份**：定期备份订单、交易等重要数据
4. **监控告警**：监控兑换失败、积分异常等情况
