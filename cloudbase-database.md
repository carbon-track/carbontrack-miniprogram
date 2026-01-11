# CloudBase 数据库集合结构

## 1. users 集合（用户表）

用于存储用户基本信息。

### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 用户唯一标识 |
| openid | string | 微信登录必填 | 微信用户 openid |
| email | string | 邮箱登录必填 | 用户邮箱 |
| nickName | string | 是 | 用户昵称 |
| avatarUrl | string | 否 | 用户头像 URL |
| password | string | 邮箱登录必填 | 密码（明文存储，生产环境应加密） |
| totalCarbon | number | 是 | 总碳减排量，默认 0 |
| points | number | 是 | 积分，默认 0 |
| level | number | 是 | 用户等级，默认 1 |
| createTime | date | 是 | 创建时间 |
| updateTime | date | 是 | 更新时间 |
| lastLoginTime | date | 是 | 最后登录时间 |
| isLogin | boolean | 是 | 登录状态 |

### 示例文档

```json
{
  "_id": "user_001",
  "openid": "o1234567890abcdef",
  "email": "user@example.com",
  "nickName": "张三",
  "avatarUrl": "https://example.com/avatar.jpg",
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

## 2. carbon_records 集合（碳足迹记录）

用于存储用户的碳足迹计算记录。

### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 记录唯一标识 |
| userId | string | 是 | 用户 ID |
| activityType | string | 是 | 活动类型（transport, food, energy, etc.） |
| activityDetail | string | 是 | 活动详情 |
| carbonValue | number | 是 | 碳排放量/减排量 |
| createTime | date | 是 | 记录创建时间 |

## 3. verification_codes 集合（验证码）

用于存储邮箱验证码。

### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 验证码唯一标识 |
| email | string | 是 | 邮箱地址 |
| code | string | 是 | 验证码 |
| createTime | date | 是 | 创建时间 |
| expireTime | date | 是 | 过期时间 |
| used | boolean | 是 | 是否已使用 |

## 安全规则

### users 集合

```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

## 创建集合步骤

1. 打开微信开发者工具
2. 点击「云开发」按钮
3. 进入「数据库」
4. 点击「添加集合」
5. 创建 `users` 集合
6. 按照上述字段结构添加字段（可选，也可自动创建）
