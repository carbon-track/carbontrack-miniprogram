# CloudBase 部署指南

本文档指导你如何将 CarbonTrack 小程序连接到腾讯云 CloudBase。

## 前置条件

- 已注册微信小程序
- 已有腾讯云账号

## 步骤 1: 开通云开发

1. 打开微信开发者工具
2. 点击工具栏的「云开发」按钮
3. 如果是第一次使用，点击「开通」
4. 选择基础版或专业版（基础版免费额度足够）
5. 创建环境，记住环境 ID（如：`carbontrack-xxx`）

## 步骤 2: 配置项目

### 2.1 修改 app.js

打开 `app.js`，找到 `wx.cloud.init()` 部分，替换为你的环境 ID：

```javascript
wx.cloud.init({
  env: 'carbontrack-xxx', // 替换为你的云环境 ID
  traceUser: true
});
```

### 2.2 修改 utils/auth.js

同样修改 `utils/auth.js` 中的环境 ID：

```javascript
wx.cloud.init({
  env: 'carbontrack-xxx', // 替换为你的云环境 ID
  traceUser: true
});
```

## 步骤 3: 创建数据库集合

1. 在微信开发者工具中，点击「云开发」
2. 进入「数据库」
3. 点击「添加集合」
4. 创建 `users` 集合（用于存储用户信息）

集合安全规则设置为：
```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

详细字段结构请参考 `cloudbase-database.md`。

## 步骤 4: 部署云函数

### 4.1 安装依赖

在项目根目录运行：

```bash
# 安装云函数依赖
cd cloudfunctions/wx-login
npm install

cd ../email-login
npm install

cd ../register
npm install

cd ../get-user-info
npm install
```

### 4.2 上传云函数

在微信开发者工具中：

1. 右键点击 `cloudfunctions/wx-login` 文件夹
2. 选择「上传并部署：云端安装依赖」
3. 等待上传完成
4. 对其他三个云函数重复此步骤：
   - `email-login`
   - `register`
   - `get-user-info`

## 步骤 5: 配置 project.config.json

确保 `project.config.json` 中包含云函数根目录配置：

```json
{
  "cloudfunctionRoot": "cloudfunctions/",
  "cloudbaseRoot": "./",
  // ... 其他配置
}
```

## 步骤 6: 测试登录功能

### 测试微信登录

1. 在登录页面点击「微信一键登录」
2. 如果是首次登录，会自动创建用户
3. 登录成功后会跳转到首页

### 测试邮箱登录

1. 可以先通过云开发数据库直接创建一个测试用户
2. 使用该邮箱和密码进行登录测试

## 常见问题

### 1. 云开发初始化失败

**原因**: 环境 ID 不正确或云开发未开通

**解决**:
- 检查环境 ID 是否正确
- 确认云开发已成功开通

### 2. 云函数调用失败

**原因**: 云函数未上传或上传失败

**解决**:
- 检查云函数是否已上传
- 查看云函数日志排查错误

### 3. 数据库操作失败

**原因**: 集合不存在或权限不足

**解决**:
- 确认数据库集合已创建
- 检查安全规则设置

### 4. getUserProfile 报错

**原因**: 微信已弃用 getUserProfile 接口

**解决**:
- 使用 `<button open-type="getUserInfo">` 组件
- 或不需要头像昵称，直接登录

## 项目结构

```
carbon-track-miniapp/
├── cloudfunctions/        # 云函数目录
│   ├── wx-login/         # 微信登录
│   ├── email-login/      # 邮箱登录
│   ├── register/         # 用户注册
│   └── get-user-info/    # 获取用户信息
├── cloudbase-config.json # CloudBase 配置
└── cloudbase-database.md # 数据库结构文档
```

## 下一步

部署完成后，你可以：

1. 扩展云数据库集合（碳足迹记录、活动记录等）
2. 添加更多云函数（计算碳足迹、排行榜等）
3. 集成其他云服务（存储、CDN 等）

## 参考资料

- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [云函数文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions.html)
- [云数据库文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)
