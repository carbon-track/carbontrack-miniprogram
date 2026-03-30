# 环境配置指南

## 重要安全提示

⚠️ **已提交到 GitHub 的敏感信息**：
1. 微信小程序 AppID: `wxa249dd9ff3bd50a2`
2. CloudBase 环境 ID: `pangou-8g51newcf37c99d1`

🔒 **这些信息相对安全**：
- AppID 是公开标识符
- 环境 ID 是公开标识符
- 真正的密钥（WX_APPSECRET）**未泄露**

## 配置步骤

### 第一步：创建配置文件

1. **复制配置文件模板**：
```bash
cp project.config.template.json project.config.json
cp cloudbaserc.template.json cloudbaserc.json
```

2. **填写你的配置**：
   - `project.config.json`: 替换 `YOUR_WECHAT_APPID_HERE` 为你的小程序 AppID
   - `cloudbaserc.json`: 替换 `YOUR_CLOUDBASE_ENV_ID_HERE` 为你的 CloudBase 环境 ID

### 第二步：配置 CloudBase 环境变量

在 CloudBase 控制台配置以下环境变量：

1. **get-wx-access-token 云函数**：
   - `WX_APPID`: 你的小程序 AppID
   - `WX_APPSECRET`: 你的小程序 AppSecret

2. **review-admin 云函数**（可选）：
   - `ADMIN_OPENIDS`: 管理员 OpenID 列表，逗号分隔

### 第三步：部署云函数

```bash
# 部署内容安全相关函数
deploy-content-security.ps1

# 部署排行榜相关函数  
deploy-rank-system.bat

# 部署其他函数
deploy-all-functions.ps1
```

## 安全建议

### 1. 如果担心泄露的环境 ID
- 可以在 CloudBase 控制台创建新环境
- 使用新的环境 ID
- 重新部署所有云函数

### 2. 如果担心泄露的 AppID
- 这是公开信息，所有用户都能看到
- 无需特别处理
- 确保 `WX_APPSECRET` 保密即可

### 3. 定期检查
- 定期轮换环境变量
- 监控异常访问
- 更新依赖包

## 故障排除

### 错误 -504003
问题：云函数调用链失败
原因：通常是环境变量未配置或云函数未部署
解决：
1. 检查 `get-wx-access-token` 云函数是否部署
2. 检查环境变量 `WX_APPID` 和 `WX_APPSECRET` 是否配置
3. 运行 `deploy-profile-fix.bat`

## 最佳实践

1. **永远不要提交**：
   - `WX_APPSECRET`
   - CloudBase API 密钥
   - 数据库连接字符串
   - `.env` 文件

2. **使用模板文件**：
   - 提交 `*.template.json`
   - 忽略实际的 `*.json`

3. **环境分离**：
   - 开发、测试、生产使用不同环境
   - 每个环境独立配置

## 紧急情况处理

如果发现真正的密钥泄露：
1. 立即在微信公众平台重置 AppSecret
2. 在 CloudBase 控制台重置环境变量
3. 删除旧的云函数并重新部署
4. 通知团队成员更新配置