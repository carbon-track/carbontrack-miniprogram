# CloudBase 快速开始指南

## 🚀 5 分钟快速部署

### 1️⃣ 开通云开发

在微信开发者工具中：
- 点击「云开发」→「开通」
- 创建环境，记下环境 ID（如：`carbontrack-xxx`）

### 2️⃣ 配置环境 ID

在两个文件中替换环境 ID：

**app.js (第 13 行)**
```javascript
wx.cloud.init({
  env: 'carbontrack-xxx', // ← 替换这里
  traceUser: true
});
```

**utils/auth.js (第 9 行)**
```javascript
wx.cloud.init({
  env: 'carbontrack-xxx', // ← 替换这里
  traceUser: true
});
```

### 3️⃣ 创建数据库

在云开发控制台：
- 进入「数据库」→「添加集合」
- 创建集合名称：`users`

### 4️⃣ 上传云函数

右键以下文件夹，选择「上传并部署：云端安装依赖」：
- `cloudfunctions/wx-login`
- `cloudfunctions/email-login`
- `cloudfunctions/register`
- `cloudfunctions/get-user-info`

### 5️⃣ 测试登录

点击登录页面的「微信一键登录」按钮即可！

---

## 📁 已创建的文件

```
cloudfunctions/
├── wx-login/           # 微信登录云函数
│   ├── index.js
│   └── package.json
├── email-login/        # 邮箱登录云函数
│   ├── index.js
│   └── package.json
├── register/           # 注册云函数
│   ├── index.js
│   └── package.json
└── get-user-info/      # 获取用户信息云函数
    ├── index.js
    └── package.json
```

---

## 🔧 已修改的文件

1. **app.js** - 初始化云开发
2. **utils/auth.js** - 适配 CloudBase 云函数
3. **pages/login/login.js** - 简化微信登录逻辑
4. **cloudbase-config.json** - CloudBase 配置文件

---

## 📚 相关文档

- `cloudbase-setup-guide.md` - 详细部署指南
- `cloudbase-database.md` - 数据库结构说明

---

## ⚠️ 重要提示

1. **必须先开通云开发**才能使用云函数
2. **环境 ID 必须替换**为你的实际环境 ID
3. **云函数必须上传**才能调用
4. **数据库集合必须创建**才能存储数据

---

## 🎯 下一步

部署成功后，你可以：

- [ ] 添加碳足迹计算功能
- [ ] 创建排行榜云函数
- [ ] 集成云存储（上传头像）
- [ ] 添加实时数据同步

---

## 💡 遇到问题？

查看 `cloudbase-setup-guide.md` 中的「常见问题」章节。
