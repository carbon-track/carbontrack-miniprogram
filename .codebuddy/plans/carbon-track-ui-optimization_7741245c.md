---
name: carbon-track-ui-optimization
overview: 优化碳足迹小程序的三个核心功能：时间选择器、记录详情弹窗、背景主题应用。
design:
  styleKeywords:
    - 简约环保
    - 绿色主题
    - 毛玻璃效果
    - 圆角卡片
    - 流畅动画
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 36rpx
      weight: 600
    subheading:
      size: 28rpx
      weight: 500
    body:
      size: 24rpx
      weight: 400
  colorSystem:
    primary:
      - "#4CAF50"
      - "#81C784"
      - "#2E7D32"
    background:
      - "#F5F5F5"
      - "#FFFFFF"
    text:
      - "#333333"
      - "#666666"
    functional:
      - "#4CAF50"
      - "#FF5252"
      - "#FFC107"
todos:
  - id: explore-codebase
    content: 使用 [subagent:code-explorer] 探索项目结构，定位calculate和carbon-history页面代码
    status: completed
  - id: create-calendar-component
    content: 创建calendar-picker日历选择器组件，支持历史日期选择
    status: completed
    dependencies:
      - explore-codebase
  - id: integrate-calendar
    content: 在calculate页面集成日历选择器，替换原有时间选择控件
    status: completed
    dependencies:
      - create-calendar-component
  - id: create-detail-modal
    content: 创建record-detail-modal详情弹窗组件，支持图片预览
    status: completed
    dependencies:
      - explore-codebase
  - id: apply-theme-background
    content: 在详情弹窗中应用carbontracks.png作为过渡页主题背景
    status: completed
    dependencies:
      - create-detail-modal
  - id: integrate-modal
    content: 在carbon-history页面集成增强版详情弹窗
    status: completed
    dependencies:
      - create-detail-modal
---

## Product Overview

优化碳足迹小程序的三个核心UI功能：时间选择器、记录详情弹窗和背景主题应用，提升用户体验和视觉效果。

## Core Features

- **日历时间选择器**: 将calculate页面的日期选择控件升级为日历组件，支持用户直观选择任意历史日期
- **增强记录详情弹窗**: carbon-history页面的记录点击后展示完整信息，包含图片预览、详细数据等
- **主题背景应用**: 将images/carbontracks.png图片作为记录详情弹窗的过渡页主题背景

## Tech Stack

- 前端框架: 微信小程序原生框架（WXML, WXSS, JavaScript/TypeScript）
- UI组件: 自定义日历组件、弹窗组件
- 状态管理: 小程序原生数据绑定

## Tech Architecture

### System Architecture

- 架构模式: 组件化架构，将时间选择器和详情弹窗封装为独立可复用组件
- 组件结构: 主页面 → 功能组件 → 基础UI组件

### Module Division

- **CalendarComponent Module**: 封装日历选择器，处理日期选择、月份切换、历史日期标记
- **DetailModal Module**: 记录详情弹窗组件，包含图片预览、信息展示、背景渲染
- **ThemeService Module**: 主题背景应用服务，处理图片加载和背景样式应用

### Data Flow

用户点击日期选择 → CalendarComponent展示日历 → 用户选择日期 → 更新页面数据
用户点击记录 → DetailModal显示完整信息 → 加载图片 → 渲染主题背景

## Implementation Details

### Core Directory Structure

针对现有项目的修改结构：

```
carbon-track-miniapp/
├── components/
│   ├── calendar-picker/     # 新增：日历选择器组件
│   │   ├── calendar-picker.wxml
│   │   ├── calendar-picker.wxss
│   │   ├── calendar-picker.js
│   │   └── calendar-picker.json
│   └── record-detail-modal/ # 新增：记录详情弹窗组件
│       ├── record-detail-modal.wxml
│       ├── record-detail-modal.wxss
│       ├── record-detail-modal.js
│       └── record-detail-modal.json
├── pages/
│   ├── calculate/
│   │   └── calculate.js     # 修改：集成日历选择器
│   └── carbon-history/
│       └── carbon-history.js # 修改：集成详情弹窗
└── images/
    └── carbontracks.png     # 已有：主题背景图片
```

### Key Code Structures

**CalendarData Interface**: 日历组件核心数据结构，定义当前选中日期、显示月份、可选日期范围等。

```javascript
// 日历组件数据结构
{
  currentDate: Date,        // 当前选中的日期
  displayMonth: Date,       // 当前显示的月份
  selectableDates: Date[],   // 可选择的日期列表
  selectedDate: Date        // 用户选择的日期
}
```

**RecordDetailData Interface**: 记录详情数据结构，包含完整记录信息和图片资源。

```javascript
// 记录详情数据结构
{
  recordId: String,
  date: Date,
  category: String,
  carbonValue: Number,
  description: String,
  images: String[],         // 图片URL数组
  additionalData: Object    // 其他扩展信息
}
```

### Technical Implementation Plan

1. **日历选择器开发**: 使用微信小程序picker-view或自定义滚动视图实现，支持月份切换和历史日期选择
2. **详情弹窗增强**: 改造现有弹窗，增加图片预览区域（使用swiper组件），完善信息展示布局
3. **主题背景集成**: 在弹窗组件中使用background-image样式引用carbontracks.png，设置适当的background-size和background-position

### Integration Points

- 日历组件通过事件与calculate页面通信（bind:selectdate事件）
- 详情弹窗通过props接收carbon-history页面传递的记录数据
- 图片资源从images目录加载，支持本地和网络图片

## Design Style

采用现代简约风格，结合环保主题色彩。日历选择器采用清晰的网格布局，支持月份滑动切换。记录详情弹窗使用半透明毛玻璃效果叠加主题背景图片，营造沉浸式体验。整体设计注重视觉层次和信息可读性。

## Page Planning

### 1. Calculate页面（日历选择器）

- 顶部日期显示区域：当前选中日期的月日展示
- 日历主体：7列网格布局，显示当月所有日期
- 月份切换：左右箭头切换月份，显示当前年月
- 历史日期标记：已有数据的日期用圆点标记

### 2. Carbon-History页面（详情弹窗）

- 弹窗遮罩：半透明黑色背景
- 弹窗容器：圆角卡片，应用carbontracks.png作为背景
- 图片预览区：顶部轮播展示记录相关图片
- 信息展示区：日期、类别、碳排量、描述等信息
- 关闭按钮：右上角或底部关闭入口

### 3. 弹窗过渡页

- 全屏展示carbontracks.png背景
- 淡入淡出动画效果
- 中央加载或过渡提示

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 探索现有项目代码结构，定位calculate页面和carbon-history页面的实现
- Expected outcome: 了解现有时间选择器和弹窗的实现方式，为改造提供基础

### MCP

- **Figma MCP**
- Purpose: 如果存在设计稿，获取UI设计细节和组件规范
- Expected outcome: 获取日历选择器和详情弹窗的设计参考