# CloudBase 连接成功

## 环境信息

- **环境 ID**: `cloud1-2g7gae83d717c5c3`
- **环境别名**: `cloud1`
- **地域**: `ap-shanghai`
- **状态**: ✅ 正常运行
- **数据库**: 已启用
- **云存储**: 已启用
- **云函数**: 已启用

## 已部署资源

### 云函数（9个）

| 函数名 | 状态 | 说明 |
|--------|------|------|
| wx-login | ✅ Active | 微信一键登录 |
| email-login | ✅ Active | 邮箱登录 |
| register | ✅ Active | 用户注册 |
| get-user-info | ✅ Active | 获取用户信息 |
| save-carbon-record | ✅ Active | 保存碳足迹记录 |
| get-carbon-records | ✅ Active | 获取碳足迹记录列表 |
| get-rank | ✅ Active | 获取排行榜 |
| update-profile | ✅ Active | 更新用户资料 |
| get-user-stats | ✅ Active | 获取用户统计数据 |

### 数据库集合（2个）

| 集合名 | 权限规则 | 说明 |
|--------|----------|------|
| users | 仅创建者可读写 | 用户信息表 |
| carbon_records | 仅创建者可读写 | 碳足迹记录表 |

权限规则：
```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

## 项目配置

### app.js
```javascript
wx.cloud.init({
  env: 'cloud1-2g7gae83d717c5c3',
  traceUser: true
});
```

### cloudbase-config.json
```json
{
  "envId": "cloud1-2g7gae83d717c5c3",
  "functionRoot": "./cloudfunctions/",
  "version": "2.0"
}
```

## 控制台访问

- **云开发控制台**: https://tcb.cloud.tencent.com/dev?envId=cloud1-2g7gae83d717c5c3
- **数据库**: https://tcb.cloud.tencent.com/dev?envId=cloud1-2g7gae83d717c5c3#/db/doc
- **云函数**: https://tcb.cloud.tencent.com/dev?envId=cloud1-2g7gae83d717c5c3#/scf
- **云存储**: https://tcb.cloud.tencent.com/dev?envId=cloud1-2g7gae83d717c5c3#/storage

## 下一步操作

1. ✅ 在微信开发者工具中打开项目
2. ✅ 确保 `project.config.json` 中的 `appid` 已配置
3. ✅ 编译并运行项目
4. ✅ 测试微信登录功能
5. ✅ 测试碳足迹记录功能

## 注意事项

- 云函数已全部部署，状态为 `Active`
- 数据库集合已创建，权限已配置为仅创建者可读写
- 首次运行会自动在数据库中创建字段
- 云存储已启用，可用于上传头像等图片文件
- 所有云函数运行时为 `Nodejs16.13`

## 故障排查

### 云函数调用失败
1. 检查网络连接
2. 确认云环境 ID 正确
3. 查看云函数日志

### 数据库写入失败
1. 检查权限规则配置
2. 确认用户已登录（有 openid）
3. 查看数据库集合是否存在

### 云存储上传失败
1. 检查云存储是否启用
2. 确认文件大小不超过限制
3. 检查域名白名单配置

## 更新时间

- 2026-01-08 22:54:00 - 初始连接完成
