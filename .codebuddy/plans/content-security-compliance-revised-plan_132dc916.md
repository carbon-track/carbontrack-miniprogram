---
name: content-security-compliance-revised-plan
overview: 为小程序接入完整的微信内容安全接口，实现三层处理机制：合规直接展示、违规直接拦截、疑似违规进入审核池并支持审批通过后展示
todos:
  - id: explore-existing-code
    content: 使用[subagent:code-explorer]分析现有submit-feedback和update-profile云函数实现
    status: completed
  - id: create-security-function
    content: 创建content-security统一安全检测云函数，集成imgSecCheck和msgSecCheck
    status: completed
    dependencies:
      - explore-existing-code
  - id: create-review-pending-db
    content: 使用[integration:tcb]创建content_review_pending数据库集合
    status: completed
    dependencies:
      - create-security-function
  - id: create-review-admin-function
    content: 创建review-admin审核管理云函数，实现审批接口
    status: completed
    dependencies:
      - create-review-pending-db
  - id: modify-feedback-function
    content: 修改submit-feedback云函数，调用content-security进行检测
    status: completed
    dependencies:
      - create-security-function
  - id: modify-profile-function
    content: 修改update-profile云函数，调用content-security进行检测
    status: completed
    dependencies:
      - create-security-function
  - id: update-frontend-feedback
    content: 更新feedback页面，适配pending审核中状态展示
    status: completed
    dependencies:
      - modify-feedback-function
  - id: update-frontend-profile
    content: 更新profile页面，适配pending审核中状态展示
    status: completed
    dependencies:
      - modify-profile-function
  - id: test-end-to-end
    content: 使用[integration:tcb]部署并测试完整三层审核流程
    status: completed
    dependencies:
      - update-frontend-feedback
      - update-frontend-profile
---

## 产品概述

为小程序接入微信内容安全接口，建立完整的三层内容审核机制，确保用户生成内容符合平台规范。

## 核心功能

- **合规内容处理**：通过安全检测的内容直接展示，记录完整审核日志
- **违规内容拦截**：明确违规内容直接拒绝，返回用户友好提示
- **疑似违规管理**：进入审核池，支持后台审批流程，通过后正常展示
- **多类型内容支持**：同时处理图片(imgSecCheck)和文本(msgSecCheck)检测
- **审核状态管理**：前端展示不同状态（已通过/已拒绝/审核中）的差异化提示

## 技术栈

- **平台**：微信小程序 + 微信云开发(CloudBase)
- **后端**：Node.js云函数
- **数据库**：CloudBase文档数据库
- **安全接口**：微信小程序内容安全API（imgSecCheck、msgSecCheck）

## 系统架构

### 整体架构模式

基于现有小程序架构，在云函数层统一接入微信安全检测API，通过分层处理机制实现内容审核。

### 模块划分

1. **安全检测服务层**

- 职责：统一管理微信AccessToken，调用imgSecCheck和msgSecCheck接口
- 关键技术：微信内容安全API、Token自动刷新
- 依赖：无

2. **内容审核引擎层**

- 职责：实现三层审核逻辑（合规/违规/疑似违规）
- 关键技术：异步处理、状态管理
- 依赖：安全检测服务层、数据库

3. **审核池管理模块**

- 职责：存储待审核内容，支持审批流程
- 关键技术：CloudBase数据库、云函数
- 依赖：内容审核引擎层

4. **前端适配层**

- 职责：展示不同审核状态的内容和提示
- 关键技术：小程序页面状态管理
- 依赖：审核池管理模块

### 数据流程

```mermaid
graph TD
    A[用户提交内容] --> B{调用安全检测接口}
    B -->|合规(风险值<0.8)| C[直接通过并展示]
    B -->|明确违规(风险值>0.95)| D[直接拦截并提示]
    B -->|疑似违规(0.8<=风险值<=0.95)| E[存入审核池]
    E --> F[前端显示"审核中"状态]
    F --> G{管理员审批}
    G -->|通过| H[内容展示]
    G -->|拒绝| I[保持隐藏]
    
    C --> J[记录审核日志]
    D --> J
    H --> J
    I --> J
```

## 实现细节

### 核心数据结构

**审核内容接口定义**

```typescript
interface ReviewContent {
  contentId: string;
  contentType: 'text' | 'image';
  content: string; // 文本内容或图片URL
  userId: string;
  submitTime: Date;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  riskScore: number; // 风险值 0-1
  reviewResult?: {
    decision: string;
    reviewer?: string;
    reviewTime?: Date;
    reason?: string;
  };
  source: 'feedback' | 'profile' | 'post';
}
```

### 关键实现方案

**1. 统一安全检测云函数**

```javascript
// cloudfunctions/content-security/index.js
exports.main = async (event, context) => {
  const { contentType, content, source } = event;
  
  // 1. 获取AccessToken
  const token = await getAccessToken();
  
  // 2. 调用微信检测接口
  let riskScore = 0;
  if (contentType === 'image') {
    riskScore = await checkImageSecurity(token, content);
  } else if (contentType === 'text') {
    riskScore = await checkTextSecurity(token, content);
  }
  
  // 3. 三层处理逻辑
  if (riskScore < 0.8) {
    // 合规：直接通过
    return { status: 'approved', riskScore };
  } else if (riskScore > 0.95) {
    // 明确违规：直接拒绝
    return { status: 'rejected', riskScore, reason: '内容包含违规信息' };
  } else {
    // 疑似违规：存入审核池
    const reviewId = await saveToPendingPool({
      contentType, content, riskScore, source
    });
    return { status: 'pending', riskScore, reviewId };
  }
};
```

**2. 审核池数据库设计**

```javascript
// 集合：content_review_pending
{
  _id: "review_xxx",
  content: "实际内容",
  contentType: "text|image",
  riskScore: 0.85,
  userId: "user_123",
  source: "feedback",
  status: "pending",
  submitTime: ISODate(),
  // 审批后填充
  reviewedBy: "admin_001",
  reviewTime: ISODate(),
  reviewDecision: "approved|rejected",
  reviewReason: "人工审核通过"
}
```

**3. 前端状态处理**

```javascript
// pages/feedback/feedback.js
submitFeedback() {
  const content = this.data.feedbackText;
  
  wx.cloud.callFunction({
    name: 'content-security',
    data: { contentType: 'text', content, source: 'feedback' }
  }).then(res => {
    const { status, riskScore, reason } = res.result;
    
    if (status === 'approved') {
      // 直接提交
      this.submitToDatabase(content);
    } else if (status === 'rejected') {
      // 显示违规提示
      wx.showModal({ title: '内容违规', content: reason });
    } else if (status === 'pending') {
      // 显示审核中状态
      this.setData({ showPendingStatus: true });
      // 存入本地，等待审核结果
      this.savePendingContent(res.result.reviewId, content);
    }
  });
}
```

## 目录结构

```
project-root/
├── cloudfunctions/
│   ├── content-security/          # 新增：统一安全检测云函数
│   │   ├── index.js
│   │   ├── config.js
│   │   └── package.json
│   ├── review-admin/              # 新增：审核管理云函数
│   │   ├── index.js
│   │   └── package.json
│   └── submit-feedback/           # 修改：集成安全检测
│       └── index.js
├── pages/
│   ├── feedback/
│   │   └── feedback.js            # 修改：适配三层审核机制
│   └── profile/
│       └── profile.js             # 修改：适配三层审核机制
└── utils/
    └── content-security.js        # 新增：前端审核状态管理工具
```

## 性能与安全

- **缓存优化**：AccessToken缓存2小时，避免频繁调用
- **异步处理**：审核池操作使用异步队列，不影响主流程
- **权限控制**：审核管理接口仅管理员可访问
- **日志记录**：所有审核操作记录完整日志，支持审计

## 可用Agent扩展

### 集成

- **tcb (CloudBase)**
- 用途：管理CloudBase云函数部署和数据库操作
- 预期成果：快速部署content-security和review-admin云函数，创建content_review_pending集合

### 子代理

- **code-explorer**
- 用途：探索现有submit-feedback和update-profile云函数的实现，确保无缝集成
- 预期成果：准确定位需要修改的代码位置，避免破坏现有功能