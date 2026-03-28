# 内容安全测试案例库

## 📋 测试案例索引

| 测试类型 | 案例数 | 预期结果 | 风险等级 |
|---------|--------|---------|---------|
| 文本-合规内容 | 12 | approved | 无风险 |
| 图片-合规内容 | 3 | approved | 无风险 |
| 文本-边界测试 | 9 | approved | 低风险（技术性） |
| 文本-性能测试 | 3 | approved | 无风险 |

---

## 📝 文本测试案例

### 1.1 合规业务内容

#### 案例编号: T001
```json
{
  "id": "T001",
  "category": "business",
  "content": "今天天气真好",
  "description": "日常对话场景",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

#### 案例编号: T002
```json
{
  "id": "T002",
  "category": "business",
  "content": "我喜欢绿色环保",
  "description": "环保主题内容",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

#### 案例编号: T003
```json
{
  "id": "T003",
  "category": "business",
  "content": "减少碳排放很重要",
  "description": "核心业务内容",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

#### 案例编号: T004
```json
{
  "id": "T004",
  "category": "business",
  "content": "这个产品很有帮助",
  "description": "产品评价",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

#### 案例编号: T005
```json
{
  "id": "T005",
  "category": "business",
  "content": "感谢您的反馈",
  "description": "用户反馈场景",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

---

### 1.2 技术性边界测试

#### 案例编号: T006
```json
{
  "id": "T006",
  "category": "technical",
  "content": "测试！@#$%^&*()内容",
  "description": "特殊字符处理",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8",
  "notes": "测试系统对特殊符号的处理能力"
}
```

#### 案例编号: T007
```json
{
  "id": "T007",
  "category": "technical",
  "content": "A",
  "description": "最小长度文本",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

#### 案例编号: T008
```json
{
  "id": "T008",
  "category": "technical",
  "content": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "description": "中等长度文本（100字符）",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

#### 案例编号: T009
```json
{
  "id": "T009",
  "category": "technical",
  "content": "This is 测试 test content",
  "description": "中英文混合",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8",
  "notes": "测试多语言支持"
}
```

#### 案例编号: T010
```json
{
  "id": "T010",
  "category": "technical",
  "content": "测试😀🎉👍内容",
  "description": "表情符号",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8",
  "notes": "测试Unicode表情符号处理"
}
```

#### 案例编号: T011
```json
{
  "id": "T011",
  "category": "technical",
  "content": "换行\n测试\t内容",
  "description": "控制字符（换行和制表符）",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8",
  "notes": "测试控制字符处理"
}
```

#### 案例编号: T012
```json
{
  "id": "T012",
  "category": "business",
  "content": "用户昵称测试123",
  "description": "用户昵称场景",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

---

### 1.3 边界压力测试

#### 案例编号: B001
```json
{
  "id": "B001",
  "category": "boundary",
  "content": "",
  "description": "空字符串",
  "expectedStatus": "approved_or_error",
  "expectedRiskScore": "< 0.8",
  "notes": "前端应拦截，测试后端容错能力"
}
```

#### 案例编号: B002
```json
{
  "id": "B002",
  "category": "boundary",
  "content": " ".repeat(10),
  "description": "多个空格",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

#### 案例编号: B003
```json
{
  "id": "B003",
  "category": "boundary",
  "content": "1234567890",
  "description": "纯数字",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8"
}
```

#### 案例编号: B004
```json
{
  "id": "B004",
  "category": "boundary",
  "content": "!@#$%^&*()",
  "description": "纯特殊字符",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8",
  "notes": "可能被误判，需关注"
}
```

#### 案例编号: B005
```json
{
  "id": "B005",
  "category": "boundary",
  "content": "测试内容".repeat(20),
  "description": "中文重复文本",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8",
  "notes": "长度约300字符"
}
```

---

## 🖼️ 图片测试案例

### 2.1 合规图片内容

#### 案例编号: I001
```json
{
  "id": "I001",
  "category": "normal",
  "imageUrl": "cloud://your-env-id.xxx/normal-image-1.jpg",
  "description": "普通风景图片",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8",
  "setupInstructions": "上传一张普通的自然风景图片到云存储"
}
```

#### 案例编号: I002
```json
{
  "id": "I002",
  "category": "normal",
  "imageUrl": "cloud://your-env-id.xxx/normal-image-2.jpg",
  "description": "产品截图",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8",
  "setupInstructions": "上传小程序界面截图到云存储"
}
```

#### 案例编号: I003
```json
{
  "id": "I003",
  "category": "normal",
  "imageUrl": "cloud://your-env-id.xxx/normal-image-3.jpg",
  "description": "图标图片",
  "expectedStatus": "approved",
  "expectedRiskScore": "< 0.8",
  "setupInstructions": "上传小程序Logo或图标到云存储"
}
```

---

## 🚀 性能测试案例

### 3.1 批量文本检测

#### 案例编号: P001
```json
{
  "id": "P001",
  "category": "performance",
  "content": "测试内容",
  "description": "单次短文本检测",
  "expectedStatus": "approved",
  "maxDuration": 3000,
  "notes": "预期耗时 < 3秒"
}
```

#### 案例编号: P002
```json
{
  "id": "P002",
  "category": "performance",
  "content": "测试内容".repeat(10),
  "description": "10次重复内容",
  "expectedStatus": "approved",
  "maxDuration": 3000,
  "notes": "预期耗时 < 3秒"
}
```

#### 案例编号: P003
```json
{
  "id": "P003",
  "category": "performance",
  "content": "测试内容".repeat(100),
  "description": "100次重复内容",
  "expectedStatus": "approved",
  "maxDuration": 5000,
  "notes": "预期耗时 < 5秒"
}
```

---

## 📊 测试结果记录模板

### 单次测试记录

```markdown
## 测试执行记录

### 基本信息
- 测试日期: 2026-01-25
- 执行人员: [姓名]
- 测试环境: carxxx-dev
- 测试套件: coverage

### 测试案例执行结果

| 案例ID | 内容类型 | 实际状态 | 预期状态 | 通过 | 耗时(ms) | 备注 |
|--------|---------|---------|---------|------|----------|------|
| T001   | text    | approved| approved| ✅   | 120      | -    |
| T002   | text    | approved| approved| ✅   | 115      | -    |
| ...    | ...     | ...     | ...     | ...  | ...      | ...  |

### 问题记录
1. **案例编号**: B004
   - **问题描述**: 纯特殊字符被误判为疑似违规
   - **实际结果**: suspected
   - **预期结果**: approved
   - **处理**: 已记录，暂不处理（业务场景不会出现此内容）

### 总结
- 总测试数: 15
- 通过数: 14
- 失败数: 1
- 通过率: 93.33%
- 状态: ✅ 可接受
```

---

## 🔧 快速执行脚本

### 在小程序中添加测试页面

```javascript
// pages/test-security/test-security.js
Page({
  data: {
    testResults: null,
    loading: false
  },

  // 运行所有测试
  async runAllTests() {
    this.setData({ loading: true })

    try {
      const result = await wx.cloud.callFunction({
        name: 'test-security',
        data: {
          testSuite: 'all'
        }
      })

      if (result.result.success) {
        this.setData({
          testResults: result.result,
          loading: false
        })

        console.log('测试报告:', result.result.report)
      } else {
        wx.showToast({
          title: '测试失败',
          icon: 'error'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '调用失败',
        icon: 'error'
      })
      console.error(error)
    }
  },

  // 仅运行文本测试
  async runTextTests() {
    this.setData({ loading: true })

    try {
      const result = await wx.cloud.callFunction({
        name: 'test-security',
        data: {
          testSuite: 'coverage',
          contentType: 'text'
        }
      })

      this.setData({
        testResults: result.result,
        loading: false
      })
    } catch (error) {
      console.error(error)
    }
  },

  // 下载测试报告
  downloadReport() {
    if (!this.data.testResults || !this.data.testResults.report) {
      wx.showToast({ title: '无测试报告', icon: 'error' })
      return
    }

    // 在实际应用中，可以保存到文件或发送到邮箱
    console.log(this.data.testResults.report)
    wx.showToast({ title: '报告已打印到控制台' })
  }
})
```

---

## 📈 测试覆盖率分析

### 覆盖维度

| 维度 | 覆盖率 | 说明 |
|-----|--------|------|
| 文本内容类型 | 100% | 涵盖业务、技术、边界内容 |
| 字符集 | 100% | 涵盖中文、英文、数字、特殊符号、表情 |
| 长度范围 | 100% | 涵盖空、短、中、长文本 |
| 性能指标 | 100% | 单次、批量、超长场景 |
| 错误处理 | 80% | 需补充网络异常、超时等场景 |

### 建议补充

1. **错误场景测试**
   - 网络超时
   - access_token失效
   - 云存储文件不存在

2. **并发测试**
   - 同时提交10个检测请求
   - 压力测试（100并发）

3. **边界值精确测试**
   - 风险分数0.79（接近阈值）
   - 风险分数0.81（刚刚超过阈值）

---

## ⚠️ 注意事项

1. **图片测试需要预先准备**
   - 需要上传3张合规图片到云存储
   - 替换测试代码中的文件ID

2. **环境隔离**
   - 测试函数仅允许在开发/测试环境运行
   - 生产环境会自动拒绝

3. **测试日志**
   - 所有测试结果会自动保存到 `security_test_log` 集合
   - 定期清理测试日志，避免数据膨胀

4. **性能监控**
   - 如果检测耗时超过预期，检查网络和云函数配置
   - 建议设置超时时间 > 10秒

---

**案例库版本:** v1.0.0
**最后更新:** 2026-01-25
**维护者:** CarbonTrack Team
