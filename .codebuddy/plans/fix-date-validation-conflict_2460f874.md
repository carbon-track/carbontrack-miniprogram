---
name: fix-date-validation-conflict
overview: 移除 calculate.js 中重复的日期验证逻辑，与新的日历选择器统一
design:
  architecture:
    component: tdesign
  styleKeywords:
    - 原生小程序
  fontSystem:
    fontFamily: PingFang-SC
    heading:
      size: 32px
      weight: 600
    subheading:
      size: 18px
      weight: 500
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#07C160"
    background:
      - "#FFFFFF"
    text:
      - "#000000"
todos:
  - id: locate-code
    content: 定位 calculate.js 文件中第327-338行的日期验证代码
    status: completed
  - id: remove-validation
    content: 移除 validateForm 方法中冲突的日期验证逻辑
    status: completed
    dependencies:
      - locate-code
  - id: test-functionality
    content: 测试日期选择功能，确认验证提示正常显示
    status: completed
    dependencies:
      - remove-validation
  - id: verify-other-fields
    content: 验证表单其他字段验证逻辑未受影响
    status: completed
    dependencies:
      - test-functionality
---

## 产品概述

修复碳足迹小程序中日期验证冲突问题，统一使用日历选择器的内置验证逻辑

## 核心功能

- 移除 calculate.js 中 validateForm 方法的旧日期验证代码（第327-338行）
- 确保新的日历选择器正常工作，不再显示重复的验证提示
- 保持表单验证其他逻辑不变

## 技术栈

- 平台：微信小程序
- 语言：JavaScript
- 框架：原生小程序框架

## 技术架构

### 修改范围

- 仅修改 calculate.js 文件中的 validateForm 方法
- 移除与日历选择器冲突的日期验证逻辑片段

### 代码位置

```
project-root/
├── utils/
│   └── calculate.js  # 修改：移除第327-338行的日期验证逻辑
```

### 实现细节

1. **目标代码段**：calculate.js 第327-338行
2. **删除逻辑**：包含"日期不能超过今天"提示的验证代码块
3. **保留内容**：其他表单验证逻辑保持不变

### 验证策略

- 修改后测试日期选择功能
- 确认不再出现重复提示
- 验证表单其他字段验证正常

## 设计说明

此任务为代码逻辑修复，不涉及UI/UX变更。使用现有的微信小程序UI组件，保持视觉一致性。