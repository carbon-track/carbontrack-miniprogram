---
name: fix-record-detail-issues
overview: 修复详情弹窗图片预览、原始数据展示和createTime显示问题
design:
  styleKeywords:
    - 简洁
    - 清晰
    - 用户友好
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 18px
      weight: 600
    subheading:
      size: 16px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#07C160"
    background:
      - "#FFFFFF"
      - "#F5F5F5"
    text:
      - "#333333"
      - "#999999"
    functional:
      - "#FF5D5D"
      - "#FF9F00"
todos:
  - id: explore-codebase
    content: 使用 [subagent:code-explorer] 探索项目结构，定位详情弹窗组件和相关页面
    status: completed
  - id: fix-image-preview
    content: 实现图片预览放大功能，使用wx.previewImage API
    status: completed
    dependencies:
      - explore-codebase
  - id: add-activity-data
    content: 在详情弹窗中添加原始活动数据展示（数量、单位、日期）
    status: completed
    dependencies:
      - explore-codebase
  - id: handle-null-time
    content: 处理createTime字段为空或null的情况，添加默认值显示
    status: completed
    dependencies:
      - explore-codebase
  - id: test-features
    content: 测试修复功能，验证图片预览、数据展示和空值处理
    status: completed
    dependencies:
      - fix-image-preview
      - add-activity-data
      - handle-null-time
---

## Product Overview

修复现有碳足迹小程序详情弹窗中的三个具体问题，改善用户体验和数据展示准确性。

## Core Features

- 图片预览放大功能：点击详情弹窗中的图片后，实现全屏预览或放大查看，解决图片过小无法看清内容的问题
- 原始活动数据展示：在详情弹窗中补充显示活动数量、活动单位、活动日期等原始数据
- createTime字段容错处理：处理createTime字段为空或null的情况，确保页面正常显示

## Tech Stack

- 小程序框架：微信小程序原生开发
- 后端服务：腾讯云云开发（Tencent CloudBase）
- 组件库：小程序原生组件

## Tech Architecture

### System Architecture

基于现有小程序架构，采用分层结构：视图层、逻辑层、数据层。修改点集中在详情弹窗组件和数据处理逻辑。

### Module Division

- **详情弹窗组件模块**：负责展示记录详情、图片预览和数据展示
- **数据处理模块**：处理原始活动数据映射和时间字段容错

### Data Flow

用户点击记录 → 获取记录详情 → 数据格式化处理（容错create_time）→ 映射原始活动数据 → 渲染详情弹窗 → 用户点击图片 → 触发图片预览

## Implementation Details

### Core Directory Structure

```
project-root/
├── pages/
│   └── record/
│       └── detail.js        # 修改：添加图片预览逻辑和数据展示
├── components/
│   └── detail-popup/        # 修改：增强详情弹窗组件
│       ├── detail-popup.js
│       └── detail-popup.wxml
└── utils/
    └── dataFormatter.js     # 新增：数据格式化和容错工具函数
```

### Key Code Structures

**数据格式化函数**：处理时间字段空值和数据映射

```javascript
// 格式化createTime，处理空值情况
function formatCreateTime(time) {
  if (!time) return '暂无时间记录';
  return formatDate(time);
}

// 映射原始活动数据
function mapActivityData(record) {
  return {
    count: record.activityCount || 0,
    unit: record.activityUnit || '次',
    date: record.activityDate || '未知日期'
  };
}
```

**图片预览逻辑**：使用wx.previewImage实现图片放大预览

```javascript
// 图片预览功能
function handleImagePreview(e) {
  const current = e.currentTarget.dataset.url;
  const urls = e.currentTarget.dataset.urls || [current];
  wx.previewImage({
    current: current,
    urls: urls
  });
}
```

### Technical Implementation Plan

1. **图片预览放大**

- 问题陈述：详情弹窗中图片点击后无法放大查看
- 解决方案：使用wx.previewImage API实现全屏图片预览
- 关键技术：微信小程序原生图片预览API
- 实现步骤：给图片添加点击事件 → 收集图片URL数组 → 调用previewImage方法
- 测试策略：测试单张图片和多张图片的预览效果

2. **原始活动数据展示**

- 问题陈述：详情弹窗缺少活动数量、单位、日期信息
- 解决方案：从记录数据中提取并展示原始字段
- 关键技术：数据绑定和条件渲染
- 实现步骤：在WXML中添加数据展示区域 → JS中提取字段 → 处理默认值
- 测试策略：验证不同数据组合下的展示效果

3. **createTime容错处理**

- 问题陈述：createTime为空或null时显示异常
- 解决方案：添加非空判断和默认值处理
- 关键技术：条件渲染和默认值设置
- 实现步骤：创建格式化函数 → 在渲染前调用 → 设置友好默认值
- 测试策略：测试空值、null、undefined各种情况

### Integration Points

- 与现有记录详情页面集成，保持风格一致
- 使用小程序原生组件避免引入额外依赖
- 与云开发数据库接口对接，确保数据结构兼容

## Design Style

基于现有小程序UI风格，在详情弹窗中优化信息展示和交互体验。保持简洁清晰的设计原则，重点改善图片预览体验和数据可读性。�体验和数据可读性。