# CloudBase 迁移完成总结

## ✅ 已完成的工作

### 1. 云函数创建（8个）

#### 认证相关
- `wx-login` - 微信一键登录
- `email-login` - 邮箱密码登录
- `register` - 用户注册
- `get-user-info` - 获取用户信息

#### 碳足迹相关
- `save-carbon-record` - 保存碳足迹记录
- `get-carbon-records` - 获取碳足迹记录列表

#### 排行榜相关
- `get-rank` - 获取排行榜数据

#### 用户数据相关
- `update-profile` - 更新用户资料
- `get-user-stats` - 获取用户统计数据

### 2. API 封装

创建了 `utils/cloud-api.js` 文件，统一管理 CloudBase 云函数调用。

### 3. 前端页面适配

已迁移到 CloudBase 的页面：
- ✅ `pages/login/login.js` - 登录页面
- ✅ `pages/calculate/calculate.js` - 碳足迹计算页面
- ✅ `pages/rank/rank.js` - 排行榜页面
- ✅ `pages/center/center.js` - 用户中心页面
- ✅ `pages/profile/profile.js` - 用户资料页面

### 4. PHP 代码清理

已移除以下 PHP 相关代码：
- ❌ `/login.php` 接口调用
- ❌ `/register.php` 接口调用
- ❌ `/send-verification-code.php` 接口调用
- ❌ `/wx-login.php` 接口调用
- ❌ `baseUrl: 'http://localhost:8000'` 配置
- ❌ Token 验证逻辑

### 5. 配置文件更新

- ✅ `app.js` - 移除 baseUrl，启用 CloudBase
- ✅ `utils/auth.js` - 完全迁移到 CloudBase
- ✅ `cloudbase-config.json` - CloudBase 配置文件

## 📋 接下来需要做的

### 1. 替换环境 ID

在以下文件中替换 `'your-env-id'` 为你的实际云环境 ID：

**app.js (第 16 行)**
```javascript
wx.cloud.init({
  env: 'carbontrack-xxx', // 替换这里
  traceUser: true
});
```

**utils/auth.js (第 14 行)**
```javascript
wx.cloud.init({
  env: 'carbontrack-xxx', // 替换这里
  traceUser: true
});
```

### 2. 创建数据库集合

在云开发控制台创建以下集合：

1. **users** - 用户表
   - 字段：_id, openid, email, nickName, avatarUrl, password, totalCarbon, points, level, createTime, updateTime, lastLoginTime, isLogin

2. **carbon_records** - 碳足迹记录表
   - 字段：_id, userId, openid, activityType, activityDetail, carbonValue, points, date, description, imageUrl, createTime

### 3. 上传云函数

右键以下文件夹，选择「上传并部署：云端安装依赖」：

```
cloudfunctions/
├── wx-login/
├── email-login/
├── register/
├── get-user-info/
├── save-carbon-record/
├── get-carbon-records/
├── get-rank/
├── update-profile/
└── get-user-stats/
```

### 4. 测试功能

- [ ] 微信一键登录
- [ ] 邮箱登录
- [ ] 用户注册
- [ ] 碳足迹计算和保存
- [ ] 排行榜查看
- [ ] 用户资料编辑
- [ ] 头像上传

## 🎯 新架构

```
┌─────────────────────────────────────┐
│         微信小程序前端              │
│  (login, calculate, rank, etc.)   │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
   CloudBase    PHP后端
   (已迁移)     (已废弃)
        │
   ┌────┴────────────────┐
   │  所有业务功能      │
   └────────────────────┘
```

## 📊 数据库结构

### users 集合

```json
{
  "_id": "user_001",
  "openid": "o1234567890abcdef",
  "email": "user@example.com",
  "nickName": "张三",
  "avatarUrl": "cloud://xxx.jpg",
  "password": "password123",
  "totalCarbon": 120.5,
  "points": 500,
  "level": 2,
  "createTime": {"$date": "2024-01-01T00:00:00.000Z"},
  "updateTime": {"$date": "2024-01-01T00:00:00.000Z"},
  "lastLoginTime": {"$date": "2024-01-01T00:00:00.000Z"},
  "isLogin": true
}
```

### carbon_records 集合

```json
{
  "_id": "record_001",
  "userId": "user_001",
  "openid": "o1234567890abcdef",
  "activityType": "步行",
  "activityDetail": "🚶 步行",
  "carbonValue": 5.5,
  "points": 55,
  "date": "2024-01-01",
  "description": "步行上班",
  "imageUrl": "cloud://xxx.jpg",
  "createTime": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

## 🔐 安全规则

### users 集合安全规则

```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

### carbon_records 集合安全规则

```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

## 📖 相关文档

- `cloudbase-setup-guide.md` - 详细部署指南
- `cloudbase-quick-start.md` - 快速开始指南
- `cloudbase-database.md` - 数据库结构文档
- `cloudbase-config.json` - CloudBase 配置文件

## 💡 常见问题

### Q: 如何查看云函数日志？

A: 在微信开发者工具中，点击「云开发」→「云函数」→ 选择云函数 →「日志」

### Q: 如何测试云函数？

A: 可以在微信开发者工具的云函数页面直接测试，传入参数查看返回结果

### Q: 如何调试数据库操作？

A: 在云开发控制台的「数据库」页面可以查看和修改数据

### Q: 环境变量如何配置？

A: 在云开发控制台的「云函数」→「配置」→「环境变量」中配置

## 🚀 后续优化建议

1. **添加云存储规则**：设置文件上传权限和访问规则
2. **实现发送验证码功能**：集成邮件服务或短信服务
3. **添加好友系统**：创建好友关系表
4. **实现积分商城**：创建商品和订单表
5. **添加数据统计**：创建统计分析云函数
6. **实现活动系统**：创建活动记录和成就系统
