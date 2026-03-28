# 内容安全测试指南

## 📋 目录
1. [测试目的](#测试目的)
2. [测试环境要求](#测试环境要求)
3. [测试案例说明](#测试案例说明)
4. [如何执行测试](#如何执行测试)
5. [测试结果分析](#测试结果分析)
6. [合规性说明](#合规性说明)

---

## 🎯 测试目的

验证内容安全检测系统的以下功能：
- ✅ 合规内容能够正确通过检测
- ✅ 边界情况（空内容、超长内容等）能够正确处理
- ✅ 检测接口性能满足要求
- ✅ 三层处理机制（合规/违规/疑似）工作正常
- ✅ 错误处理机制完善

---

## 🔒 测试环境要求

### 1. 环境限制
```javascript
// ⚠️ 重要：测试函数仅允许在开发/测试环境运行
// 生产环境会自动拒绝测试请求

// 环境ID判断逻辑
const envId = process.env.TCB_ENV_ID
if (envId.includes('prod')) {
  // 生产环境禁止测试
  return { error: '测试函数仅允许在开发/测试环境运行' }
}
```

### 2. 必需的云函数
确保以下云函数已部署：
- `content-security` - 内容安全检测主函数
- `get-wx-access-token` - 获取微信access_token
- `test-security` - 测试函数（本文件）

### 3. 必需的数据库集合
- `security_test_log` - 测试日志（自动创建）

---

## 📊 测试案例说明

### 1. 合规内容测试（Coverage Test）

#### 文本测试案例
```javascript
// 业务场景内容
[
  '今天天气真好',                    // 日常对话
  '我喜欢绿色环保',                  // 环保主题
  '减少碳排放很重要',                // 核心业务
  '感谢您的反馈'                      // 用户反馈
]

// 技术性边界测试
[
  '测试！@#$%^&*()内容',              // 特殊字符
  'A',                                // 最短文本
  'A'.repeat(100),                    // 中等长度
  'This is 测试 test content',        // 中英文混合
  '测试😀🎉👍内容',                    // 表情符号
  '换行\n测试\t内容'                   // 控制字符
]
```

#### 图片测试案例
```javascript
// 需要替换为实际的云存储文件ID
[
  'cloud://xxx.xxx/normal-image-1.jpg',  // 普通图片
  'cloud://xxx.xxx/normal-image-2.jpg',  // 景物图片
  'cloud://xxx.xxx/normal-image-3.jpg'   // 图标图片
]
```

**预期结果：** 所有测试案例应返回 `status: 'approved'`

---

### 2. 边界测试（Boundary Test）

```javascript
// 长度边界
[
  '',                              // 空字符串（前端应拦截）
  'A'.repeat(1),                   // 最小长度
  'A'.repeat(500),                 // 较长文本
  'A'.repeat(10000)                // 超长文本
]

// 字符集边界
[
  ' ',                             // 仅空格
  '   ',                           // 多个空格
  '1234567890',                    // 仅数字
  '!@#$%^&*()',                    // 仅特殊字符
  '测试内容'.repeat(20)             // 中文重复
]
```

**预期结果：** 能够正常处理，不应抛出异常

---

### 3. 性能测试（Performance Test）

```javascript
[
  '测试内容',                      // 单条短文本
  '测试内容'.repeat(10),           // 10次重复
  '测试内容'.repeat(100)           // 100次重复
]
```

**预期结果：** 单次检测耗时 < 3秒，批量检测耗时 < 30秒

---

## 🚀 如何执行测试

### 方法一：在微信开发者工具中调用

1. 打开微信开发者工具
2. 进入云开发控制台 → 云函数
3. 找到 `test-security` 云函数
4. 点击"云端测试"
5. 输入测试参数：

```json
// 测试所有功能
{
  "testSuite": "all"
}

// 仅测试文本覆盖率
{
  "testSuite": "coverage",
  "contentType": "text"
}

// 仅测试图片覆盖率
{
  "testSuite": "coverage",
  "contentType": "image"
}

// 边界测试
{
  "testSuite": "boundary"
}

// 性能测试
{
  "testSuite": "performance"
}
```

### 方法二：在小程序代码中调用

```javascript
// pages/test/test.js
async function runSecurityTest() {
  try {
    const result = await wx.cloud.callFunction({
      name: 'test-security',
      data: {
        testSuite: 'coverage',
        contentType: 'text'
      }
    })

    console.log('测试结果:', result.result)

    if (result.result.success) {
      console.log('测试报告:\n', result.result.report)
    } else {
      console.error('测试失败:', result.result.error)
    }
  } catch (error) {
    console.error('调用测试函数失败:', error)
  }
}
```

### 方法三：使用自动化测试脚本

```bash
# 创建测试脚本 test-security.sh
#!/bin/bash

echo "开始内容安全测试..."

# 测试文本覆盖率
echo "测试1: 文本覆盖率"
# 使用 curl 或其他工具调用云函数

# 测试图片覆盖率
echo "测试2: 图片覆盖率"
# ...

echo "测试完成"
```

---

## 📈 测试结果分析

### 1. 成功标志

```
========== 测试总结 ==========
总测试数: 15
总通过数: 15
总失败数: 0
通过率: 100.00%
================================
```

### 2. 常见问题排查

#### 问题1: 图片测试失败

**现象：**
```
失败的测试案例:
  1. {"imageUrl":"cloud://xxx.xxx/image.jpg","status":"error","error":"文件不存在"}
```

**原因：**
- 云存储文件ID错误
- 文件未上传到云存储
- 文件权限设置不正确

**解决：**
```javascript
// 检查文件是否存在
wx.cloud.getTempFileURL({
  fileList: ['cloud://xxx.xxx/image.jpg']
}).then(res => {
  console.log('文件URL:', res.fileList[0].tempFileURL)
})
```

---

#### 问题2: 部分文本测试返回疑似违规

**现象：**
```
失败的测试案例:
  1. {"content":"测试！@#$%^&*()内容","status":"suspected","expected":"approved"}
```

**原因：**
- 测试案例包含特殊字符组合，可能被误判
- 微信API返回其他错误码，被归类为疑似违规

**解决：**
- 检查该案例是否真正合规
- 如果合规，可以调整风险阈值（不推荐）
- 记录误判情况，用于后续优化

---

#### 问题3: 测试超时

**现象：**
```
{"status":"error","error":"检测超时"}
```

**原因：**
- 网络延迟过高
- 微信API响应慢
- 云函数超时设置过短

**解决：**
```javascript
// 检查云函数配置
// cloudbaserc.json
{
  "functions": [
    {
      "name": "content-security",
      "timeout": 60  // 增加到60秒
    }
  ]
}
```

---

## ⚠️ 合规性说明

### 1. 测试行为是否违规？

**答案：不违规**

**原因：**
- ✅ 在开发/测试环境进行，不影响生产环境
- ✅ 测试案例都是合规内容，不包含真实违规信息
- ✅ 仅用于验证系统功能，不公开发布
- ✅ 符合微信开发者文档建议

### 2. 测试案例选择原则

#### ✅ 推荐使用的案例
- 业务相关的正常内容
- 技术性的边界案例
- 官方文档提供的示例

#### ❌ 禁止使用的案例
- 真实的恶意内容
- 涉及政治敏感的内容
- 色情、暴力、恐怖等违规内容
- 未经授权的第三方内容

### 3. 数据安全

```javascript
// 测试数据隔离
const testResults = {
  // 仅保存在测试环境数据库
  envId: process.env.TCB_ENV_ID,  // 非生产环境ID
  timestamp: new Date(),
  // 不包含任何真实用户数据
}

// 测试完成后清理
await db.collection('security_test_log').where({
  timestamp: _.lt(cleanupDate)
}).remove()
```

---

## 📝 测试记录模板

建议在每次测试后记录：

```markdown
## 测试记录 - 2026-01-25

### 环境信息
- 环境ID: carxxx-dev
- 云函数版本: v1.0.0
- 测试人员: [姓名]

### 测试执行
- 测试套件: all
- 执行时间: 2026-01-25 10:00:00

### 测试结果
- 总测试数: 15
- 通过数: 14
- 失败数: 1
- 通过率: 93.33%

### 失败案例
1. 图片测试 `cloud://xxx.xxx/image.jpg` - 文件不存在

### 修复措施
- 已重新上传图片文件
- 已更新测试案例中的文件ID

### 回归测试
- 执行时间: 2026-01-25 14:00:00
- 结果: 全部通过 ✅
```

---

## 🔄 持续集成

### 在CI/CD流程中集成测试

```yaml
# .github/workflows/security-test.yml
name: Content Security Test

on:
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Security Test
        run: |
          npm run test:security
      - name: Upload Test Results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

---

## 📚 参考资料

- [微信小程序内容安全接口文档](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/sec-check/security.msgSecCheck.html)
- [云开发文档](https://cloud.tencent.com/document/product/876)
- [本项目内容安全实现文档](./CONTENT-SECURITY-TESTING.md)

---

## ❓ 常见问题

### Q1: 可以在生产环境测试吗？
**A:** 不可以。测试函数会自动拒绝生产环境的请求。如需在生产环境验证，请使用合规的真实用户数据。

### Q2: 测试案例可以共享吗？
**A:** 可以。本测试案例都是合规内容，可以安全共享和复用。

### Q3: 如何获取违规案例用于测试？
**A:** 不需要也不应该使用真实的违规案例。系统已通过三层机制处理：
- 明确违规：微信API会自动返回 87014 错误码
- 疑似违规：其他错误码自动归类为 suspected
- 合规内容：返回 approved

### Q4: 测试频率建议？
**A:** 建议：
- 每次发布前：执行完整测试套件
- 每周：执行覆盖率测试
- 每月：执行性能测试

---

**文档版本:** v1.0.0
**最后更新:** 2026-01-25
**维护者:** CarbonTrack Team
