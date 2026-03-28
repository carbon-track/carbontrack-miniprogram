# 内容安全测试快速开始

## 🚀 5分钟快速上手

### 步骤1: 部署测试云函数

#### Windows用户
```bash
# 双击运行或在命令行执行
deploy-test-security.bat
```

#### Mac/Linux用户
```bash
# 赋予执行权限
chmod +x deploy-test-security.sh

# 运行脚本
./deploy-test-security.sh
```

### 步骤2: 在微信开发者工具中部署

1. 打开微信开发者工具
2. 右键点击 `cloudfunctions/test-security` 目录
3. 选择 **"上传并部署：云端安装依赖"**
4. 等待部署完成（约30秒）

### 步骤3: 执行测试

#### 方法一: 云函数控制台测试

1. 进入云开发控制台 → 云函数 → `test-security`
2. 点击 **"云端测试"**
3. 选择 **"自定义测试"**
4. 输入测试参数：

```json
{
  "testSuite": "coverage"
}
```

5. 点击 **"测试"** 按钮
6. 查看测试结果

#### 方法二: 小程序内调用测试

创建测试页面 `pages/test/test.js`:

```javascript
Page({
  data: {
    testResults: null
  },

  async runTest() {
    wx.showLoading({ title: '测试中...' })

    try {
      const result = await wx.cloud.callFunction({
        name: 'test-security',
        data: {
          testSuite: 'all'
        }
      })

      if (result.result.success) {
        console.log('测试报告:\n', result.result.report)
        wx.hideLoading()

        wx.showModal({
          title: '测试完成',
          content: `通过率: ${this.calculatePassRate(result.result.suiteResults)}%`,
          showCancel: false
        })
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '测试失败', icon: 'error' })
    }
  },

  calculatePassRate(suiteResults) {
    let total = 0
    let passed = 0

    for (const suite of Object.values(suiteResults)) {
      total += suite.totalTests
      passed += suite.passed
    }

    return total > 0 ? ((passed / total) * 100).toFixed(2) : 0
  }
})
```

---

## 📊 测试套件说明

### 1. 覆盖率测试 (coverage)
**用途**: 验证合规内容能否正确通过检测
**内容**: 业务场景内容 + 技术性边界内容
**预期**: 100% 通过率

```json
{
  "testSuite": "coverage"
}
```

### 2. 边界测试 (boundary)
**用途**: 验证系统对极端情况的处理能力
**内容**: 空内容、超长内容、纯特殊字符等
**预期**: 不抛出异常，正确处理

```json
{
  "testSuite": "boundary"
}
```

### 3. 性能测试 (performance)
**用途**: 验证检测接口的响应速度
**内容**: 单次、批量、超长文本检测
**预期**: 单次 < 3秒，批量 < 30秒

```json
{
  "testSuite": "performance"
}
```

### 4. 完整测试 (all)
**用途**: 执行所有测试套件
**内容**: coverage + boundary + performance
**预期**: 全部通过

```json
{
  "testSuite": "all"
}
```

---

## 🖼️ 准备测试图片

图片测试需要预先上传合规图片到云存储：

### 步骤1: 上传测试图片
1. 进入云开发控制台 → 云存储
2. 点击 **"上传文件"**
3. 上传以下图片（可使用项目assets中的合规图片）：
   - `normal-image-1.jpg` - 普通图片
   - `normal-image-2.jpg` - 景物图片
   - `normal-image-3.jpg` - 图标图片

### 步骤2: 获取文件ID
上传后，复制每个文件的云存储ID，格式类似：
```
cloud://your-env-id.xxx/normal-image-1.jpg
```

### 步骤3: 更新测试代码
编辑 `cloudfunctions/content-security/test.js`:

```javascript
// 找到这部分代码
const SAFE_TEST_CASES = {
  image: [
    // 替换为实际的云存储文件ID
    'cloud://your-env-id.xxx/normal-image-1.jpg',
    'cloud://your-env-id.xxx/normal-image-2.jpg',
    'cloud://your-env-id.xxx/normal-image-3.jpg'
  ]
}
```

### 步骤4: 重新部署
更新后重新上传测试云函数。

---

## 📈 查看测试结果

### 测试报告格式

```
========== 内容安全测试报告 ==========
测试时间: 2026-01-25 10:00:00
环境: carxxx-dev

--- 测试套件: 文本-合规内容 ---
类型: text
总测试数: 12
通过数: 12
失败数: 0
耗时: 1500ms

========== 测试总结 ==========
总测试数: 12
总通过数: 12
总失败数: 0
通过率: 100.00%
================================
```

### 查看历史测试记录

1. 进入云开发控制台 → 数据库
2. 打开 `security_test_log` 集合
3. 查看历史测试记录

---

## ⚠️ 常见问题

### Q1: 测试提示"环境不允许"
**原因**: 在生产环境运行测试
**解决**: 切换到开发/测试环境

### Q2: 图片测试失败
**原因**: 图片文件ID错误或文件不存在
**解决**:
- 检查文件ID是否正确
- 确认文件已上传到云存储
- 检查文件权限设置

### Q3: 测试超时
**原因**: 网络延迟或云函数超时设置过短
**解决**:
- 检查网络连接
- 在云函数配置中增加超时时间（建议60秒）

### Q4: 部分测试返回"suspected"
**原因**: 测试案例包含可能被误判的内容
**解决**:
- 检查该案例是否真正合规
- 如果业务不会出现此内容，可以忽略
- 记录误判情况，用于后续优化

---

## 📝 测试清单

在发布前，请确保完成以下测试：

- [ ] 文本覆盖率测试（12个案例）
- [ ] 图片覆盖率测试（3个案例）
- [ ] 文本边界测试（9个案例）
- [ ] 性能测试（3个案例）
- [ ] 所有测试通过率 ≥ 95%
- [ ] 测试报告已保存

---

## 📚 相关文档

- [详细测试指南](./SECURITY-TEST-GUIDE.md) - 完整的测试流程和最佳实践
- [测试案例库](./TEST-CASES-LIBRARY.md) - 所有测试案例的详细说明
- [内容安全实现文档](./CONTENT-SECURITY-TESTING.md) - 系统架构和实现细节

---

## 🔧 高级用法

### 自定义测试案例

编辑 `cloudfunctions/content-security/test.js`:

```javascript
// 添加自定义测试案例
const CUSTOM_TEST_CASES = {
  text: [
    '你的自定义测试内容1',
    '你的自定义测试内容2'
  ]
}

// 在测试函数中调用
async function runCustomTests() {
  return await testTextSecurity(CUSTOM_TEST_CASES.text)
}
```

### 导出测试报告

```javascript
// 在小程序中
const { testResults } = await wx.cloud.callFunction({
  name: 'test-security',
  data: { testSuite: 'all' }
})

// 保存到本地文件
wx.env.saveFile({
  data: testResults.report,
  fileName: 'security-test-report.txt'
})
```

### 定时自动测试

使用云函数定时触发：

```javascript
// cloudfunctions/scheduled-test/index.js
exports.main = async (event, context) => {
  // 每周自动执行测试
  const result = await cloud.callFunction({
    name: 'test-security',
    data: {
      testSuite: 'all'
    }
  })

  // 发送测试报告到通知
  // ...
}
```

---

**文档版本:** v1.0.0
**最后更新:** 2026-01-25
**维护者:** CarbonTrack Team
