# 内容安全接口测试指南

## 部署前准备

### 1. 安装依赖
在每个云函数目录下执行：
```bash
cd cloudfunctions/content-security && npm install
cd cloudfunctions/review-admin && npm install
```

### 2. 配置环境变量
在 CloudBase 控制台为以下云函数配置环境变量：

**get-wx-access-token 云函数：**
- `WX_APPID`: 你的小程序appId
- `WX_APPSECRET`: 你的小程序appSecret

**review-admin 云函数：**
- `ADMIN_OPENIDS`: 管理员openid列表（逗号分隔）
  - 例如：`openid1,openid2,openid3`

## 云函数部署

使用 CloudBase CLI 或控制台部署以下云函数：

```bash
# 部署所有相关云函数
tcb fn deploy content-security
tcb fn deploy review-admin
tcb fn deploy submit-feedback
tcb fn deploy update-profile
```

## 测试场景

### 测试1：合规内容（直接通过）

**测试反馈提交：**
```javascript
// 输入正常内容
feedbackContent = "这个小程序很好用，界面设计很清晰"

// 期望结果：
// - 直接写入 feedback 集合
// - status: 'visible'
// - 提示："反馈提交成功"
```

**测试资料修改：**
```javascript
// 输入正常昵称和简介
nickName = "环保小达人"
bio = "热爱环保，从我做起"

// 期望结果：
// - 直接更新 users 集合
// - 提示："保存成功"
```

### 测试2：明确违规内容（直接拦截）

**测试反馈提交：**
```javascript
// 输入违规内容（包含引流信息）
feedbackContent = "加微信xxx，有优惠，快来购买"

// 期望结果：
// - 写入 security_log 集合
// - 返回错误："内容包含违规信息，请修改后重试"
// - 不写入 feedback 集合
```

**测试资料修改：**
```javascript
// 输入违规昵称
nickName = "加我微信购买产品xxx"

// 期望结果：
// - 写入 security_log 集合
// - 返回错误："资料包含违规信息，请修改后重试"
// - 不更新 users 集合
```

### 测试3：疑似违规内容（进入审核池）

**测试反馈提交：**
```javascript
// 输入边缘内容
feedbackContent = "这个产品真的太好了，强烈推荐给大家使用，效果非常好"

// 期望结果：
// - 写入 feedback_pending 集合
// - 写入 content_review_pending 集合
// - status: 'pending'
// - 提示："反馈已提交，等待审核"
```

**测试资料修改：**
```javascript
// 输入疑似违规昵称
nickName = "超级无敌好的产品推荐官"
bio = "专业推荐各种优质产品，欢迎大家咨询"

// 期望结果：
// - 写入 profile_pending 集合
// - 写入 content_review_pending 集合
// - 提示："资料修改已提交审核，审核通过后自动更新"
```

## 审核管理测试

### 测试4：审核列表查询

调用 review-admin 云函数：
```javascript
wx.cloud.callFunction({
  name: 'review-admin',
  data: {
    action: 'list',
    page: 1,
    pageSize: 20
  }
})

// 期望结果：
// - 返回待审核内容列表
// - 包含疑似违规的反馈和资料修改
// - 每个记录包含 contentId, content, riskScore 等信息
```

### 测试5：审核通过操作

调用 review-admin 云函数：
```javascript
wx.cloud.callFunction({
  name: 'review-admin',
  data: {
    action: 'review',
    reviewId: '审核记录ID',
    decision: 'approved',
    reason: '内容合规'
  }
})

// 期望结果：
// - 更新 content_review_pending 状态为 approved
// - 将 pending 内容转正：
//   - feedback: 状态更新为 visible
//   - profile: 更新 users 集合并删除 pending 记录
// - 写入 user_notifications 通知用户
```

### 测试6：审核拒绝操作

调用 review-admin 云函数：
```javascript
wx.cloud.callFunction({
  name: 'review-admin',
  data: {
    action: 'review',
    reviewId: '审核记录ID',
    decision: 'rejected',
    reason: '包含广告推广信息'
  }
})

// 期望结果：
// - 更新 content_review_pending 状态为 rejected
// - 删除对应的 pending 内容
// - 写入 security_log 记录
// - 写入 user_notifications 通知用户
```

## 数据库验证

### 验证集合结构

**content_review_pending 集合应包含：**
```json
{
  "_id": "自动ID",
  "contentId": "原始内容ID",
  "contentType": "text|image",
  "content": "文本内容或图片URL",
  "source": "feedback|profile|calculate",
  "userId": "用户openid",
  "status": "pending|approved|rejected",
  "securityResult": {},
  "riskScore": 0.85,
  "createTime": "2026-01-25T10:00:00.000Z",
  "updateTime": "2026-01-25T10:00:00.000Z"
}
```

**feedback_pending 集合应包含：**
```json
{
  "userId": "用户openid",
  "type": "question",
  "content": "反馈内容",
  "status": "pending",
  "securityChecked": true,
  "riskScore": 0.85,
  "createdAt": "2026-01-25T10:00:00.000Z"
}
```

**profile_pending 集合应包含：**
```json
{
  "userId": "用户openid",
  "updateData": {},
  "securityCheckResults": [],
  "createdAt": "2026-01-25T10:00:00.000Z",
  "status": "pending"
}
```

### 验证索引

确保以下索引已创建：
- `content_review_pending`:
  - `status` 索引
  - `createTime` 索引
  - `userId` 索引

## 前端测试

### 测试7：反馈提交UI

1. 输入正常内容，点击提交
   - 期望：显示"反馈提交成功"

2. 输入违规内容，点击提交
   - 期望：显示"内容包含违规信息，请修改后重试"

3. 输入疑似违规内容，点击提交
   - 期望：显示"反馈已提交，等待审核"的Modal

### 测试8：资料修改UI

1. 修改昵称为正常内容，点击保存
   - 期望：显示"保存成功"

2. 修改昵称为违规内容，点击保存
   - 期望：显示"资料包含违规信息，请修改后重试"

3. 修改昵称为疑似违规内容，点击保存
   - 期望：显示"资料修改已提交审核"的Modal

## 日志检查

### security_log 集合应记录：
- 所有被拒绝的内容
- 拦截原因和时间
- 用户ID和内容类型

### 审核日志应包含：
- 每条内容的AI检测结果
- 人工审核记录
- 审核时间和审核人

## 性能测试

1. **检测响应时间**：单次内容检测应 < 2秒
2. **并发测试**：模拟10个用户同时提交，系统应正常处理
3. **审核列表加载**：待审核列表加载时间应 < 1秒

## 安全检查清单

- ✅ AccessToken 正确缓存（7200秒有效期）
- ✅ 敏感词检测覆盖所有用户输入
- ✅ 审核池权限控制（仅管理员可访问）
- ✅ 用户通知机制正常
- ✅ 日志记录完整
- ✅ 错误处理完善

## 测试完成标准

所有测试场景通过，且：
1. 合规内容100%直接展示
2. 违规内容100%被拦截
3. 疑似违规内容100%进入审核池
4. 审核通过/拒绝操作100%生效
5. 用户通知100%送达
6. 日志记录100%完整
