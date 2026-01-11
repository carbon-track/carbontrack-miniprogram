# CloudBase 认证机制说明

## 为什么不需要 Token？

### 传统后端 vs CloudBase

#### 传统后端（PHP/Node.js 等）

```
用户登录 → 后端验证 → 生成 Token → 返回给前端
         ↓
前端存储 Token → 每次请求携带 Token → 后端验证 Token
```

**需要配置**：
- Token 生成逻辑
- Token 存储位置
- Token 验证中间件
- Token 过期时间
- Token 刷新机制

#### CloudBase（微信云开发）

```
用户登录 → CloudBase 自动识别 OpenID → 自动身份验证
         ↓
云函数调用 → 自动获取调用者 OpenID → 自动权限管理
```

**无需配置**：
- ✅ 不需要 Token
- ✅ 不需要手动身份验证
- ✅ 不需要权限中间件
- ✅ OpenID 自动传递
- ✅ 自动权限管理

## CloudBase 认证机制

### 1. OpenID 是什么？

- **OpenID**：微信为每个用户在每个小程序中生成的唯一标识
- **唯一性**：同一用户在不同小程序中有不同的 OpenID
- **自动获取**：CloudBase 自动获取调用者的 OpenID

### 2. 云函数中的 OpenID

```javascript
// 云函数中自动获取
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  console.log('调用者 OpenID:', wxContext.OPENID)
  console.log('调用者 AppID:', wxContext.APPID)
  
  // 无需手动验证，CloudBase 自动完成
}
```

### 3. 数据库权限规则

```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

**含义**：
- `auth.openid`：当前调用者的 OpenID（自动获取）
- `doc._openid`：文档创建者的 OpenID
- 规则：只能读写自己创建的数据

### 4. 当前项目的实现

#### app.js
```javascript
App({
  onLaunch: function() {
    // 初始化 CloudBase（只需要环境 ID）
    wx.cloud.init({
      env: 'cloud1-2g7gae83d717c5c3',
      traceUser: true
    })
  }
})
```

#### 登录流程
```javascript
// 1. 用户登录（邮箱或微信）
const result = await wxLogin()

// 2. 保存用户信息到本地存储
wx.setStorageSync('userInfo', result.userInfo)

// 3. 云函数自动识别 OpenID，无需 Token
```

#### 数据库写入
```javascript
// 云函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 自动添加 _openid 字段
  await db.collection('users').add({
    data: {
      _openid: wxContext.OPENID, // 自动获取
      email: event.email,
      // ...其他字段
    }
  })
}
```

## 对比：传统后端 vs CloudBase

| 功能 | 传统后端 | CloudBase |
|------|---------|-----------|
| 用户标识 | Token | OpenID |
| 身份验证 | 手动验证 Token | 自动识别 OpenID |
| 权限管理 | 手写中间件 | 数据库权限规则 |
| 配置复杂度 | 高（需要配置 Token 相关） | 低（只需环境 ID） |
| 安全性 | 依赖实现质量 | 微信官方保障 |
| 代码量 | 多 | 少 |

## 当前项目配置

### 需要的配置

**唯一需要配置的是环境 ID**：

```javascript
// app.js
wx.cloud.init({
  env: 'cloud1-2g7gae83d717c5c3' // 只需配置这一项
})
```

```json
// cloudbase-config.json
{
  "envId": "cloud1-2g7gae83d717c5c3", // 只需配置这一项
  "functionRoot": "./cloudfunctions/",
  "version": "2.0"
}
```

### 不需要配置的

❌ Token 生成逻辑
❌ Token 存储位置
❌ Token 验证中间件
❌ Token 过期时间
❌ Token 刷新机制
❌ 自定义权限验证

## 总结

**CloudBase 的核心优势**：

1. **无需 Token**：使用 OpenID 自动识别用户
2. **自动权限管理**：通过数据库权限规则自动控制
3. **简化开发**：减少大量样板代码
4. **更安全**：微信官方提供的安全保障
5. **更简单**：只需配置环境 ID，其他全部自动

**当前项目已完全迁移到 CloudBase，不再使用 Token 机制！**
