---
name: carbon-track-bug-fixes
overview: 修复小程序8个关键问题:图片显示、数据字段、页面滚动、数值格式、返回按钮、启动页、微信授权和隐私协议
design:
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
      - "#66BB6A"
    background:
      - "#FFFFFF"
      - "#F5F5F5"
    text:
      - "#333333"
      - "#666666"
    functional:
      - "#4CAF50"
      - "#F44336"
todos:
  - id: fix-history-image
    content: 修复历史记录页面图片显示问题，确保imageUrl正确渲染
    status: pending
  - id: display-history-fields
    content: 在历史记录页面显示活动数量、活动日期和记录时间
    status: pending
    dependencies:
      - fix-history-image
  - id: disable-center-scroll
    content: 为个人中心页面添加禁止滚动配置，防止左右晃动
    status: pending
  - id: format-carbon-values
    content: 统一所有页面碳减排数值为整数显示，固定字体大小为24px
    status: pending
  - id: unify-back-buttons
    content: 删除重复的返回按钮，统一所有页面标题栏为"carbontrack"
    status: pending
  - id: create-splash-screen
    content: 创建启动过渡页面，使用carbontracks.png显示2秒
    status: pending
  - id: fix-wechat-auth
    content: 修复微信授权功能，确保名称、头像、学校信息正确显示
    status: pending
  - id: add-privacy-config
    content: 在app.json中添加微信隐私条款requiredPrivateInfos配置
    status: pending
---

## 产品概述

修复碳足迹小程序的8个关键问题，提升用户体验和功能完整性

## 核心功能

- 修复图片UGC安全检测后记录不显示图片的问题
- 在历史记录页面正确显示活动数量、活动日期和记录时间
- 防止"我的"tab页面左右晃动
- 统一碳减排数值格式为整数显示，并固定字体大小
- 统一所有页面左上角返回按钮样式，避免重复显示
- 添加应用启动时的品牌过渡页
- 修复微信授权信息显示问题（名称、头像、学校信息）
- 适配微信隐私条款合规要求

## 技术栈

- 微信小程序原生框架
- CloudBase云开发（环境ID: pangou-8g51newcf37c99d1）
- 微信云函数：check-image-security, get-wx-access-token

## 技术架构

### 系统架构

- 前端页面：微信小程序原生页面
- 后端服务：CloudBase云函数
- 数据存储：CloudBase云数据库
- 文件存储：CloudBase云存储

### 数据流

```
用户操作 → 前端页面 → 云函数调用 → 云数据库/云存储
                ↓
            前端渲染
```

### 模块划分

- **UI组件模块**：uni-back-button组件、record-detail-modal组件
- **业务逻辑模块**：calculate页面、carbon-history页面、center页面
- **数据管理模块**：cloud-api工具、auth工具
- **启动页模块**：splash-screen页面

## 实现细节

### 修改目录结构

```
carbon-track-miniapp/
├── pages/
│   ├── carbon-history/
│   │   └── carbon-history.wxml       # 修改：删除重复返回按钮，显示日期和数量
│   ├── calculate/
│   │   ├── calculate.js               # 修改：数值取整
│   │   └── calculate.wxml             # 修改：统一标题栏
│   ├── center/
│   │   └── center.json                # 新建：禁止页面滚动
│   ├── splash-screen/                 # 新建：启动页
│   │   ├── splash-screen.js
│   │   ├── splash-screen.json
│   │   ├── splash-screen.wxml
│   │   └── splash-screen.wxss
│   └── login/
│       └── login.js                   # 修改：修复授权逻辑
├── components/
│   └── uni-back-button/
│       └── uni-back-button.wxml       # 修改：统一标题为"carbontrack"
├── app.json                           # 修改：添加启动页配置和隐私配置
└── images/
    └── carbontracks.png               # 使用现有资源
```

### 关键代码结构

**碳减排数值处理**

```javascript
// 统一数值格式化为整数
formatCarbonValue(value) {
  return Math.round(value || 0);
}
```

**页面滚动禁用配置**

```
{
  "navigationStyle": "custom",
  "disableScroll": true
}
```

**启动页配置**

```
{
  "pages": [
    "pages/splash-screen/splash-screen",
    "pages/index/index"
  ]
}
```

### 技术实现计划

#### 1. 图片显示修复

- **问题**：imageUrl字段存在但未正确显示
- **方案**：检查carbon-history.wxml中的图片渲染逻辑，确保云存储fileID正确转换为临时链接
- **实现**：优化previewImage方法，统一图片显示处理

#### 2. 历史记录字段显示

- **问题**：amount、unit、date、createTime字段已映射但未在UI显示
- **方案**：在carbon-history.wxml中添加活动数量、日期、记录时间的显示
- **实现**：在record-item中增加对应的数据展示区域

#### 3. 页面滚动禁用

- **问题**：center页面可左右晃动
- **方案**：在center.json中添加disableScroll配置
- **实现**：创建center.json配置文件，设置disableScroll为true

#### 4. 数值格式统一

- **问题**：碳减排数值显示带小数，字体不统一
- **方案**：将所有carbonValue显示改为整数，统一字体大小为24px
- **实现**：
- calculate.js: carbonResult改为Math.round()
- 所有页面的wxss: 统一.carbon-value字体大小

#### 5. 返回按钮统一

- **问题**：carbon-history.wxml中有重复的uni-back-button
- **方案**：删除重复组件，统一所有页面标题栏显示为"carbontrack"
- **实现**：
- 删除carbon-history.wxml中重复的返回按钮
- 修改uni-back-button.wxml，标题固定为"carbontrack"
- 统一各页面的navigationBarTitleText配置

#### 6. 启动过渡页

- **问题**：无启动过渡效果
- **方案**：创建splash-screen页面，显示carbontracks.png图片2秒后跳转
- **实现**：
- 创建splash-screen页面
- app.json中设置为首页
- splash-screen.js中使用setTimeout延迟跳转到index

#### 7. 微信授权修复

- **问题**：名称、头像、学校信息显示不正确
- **方案**：检查login.js和register.js中的授权逻辑，确保正确获取和存储用户信息
- **实现**：
- 检查getUserProfile调用
- 确认userInfo字段映射
- 验证学校信息的表单提交逻辑

#### 8. 隐私条款适配

- **问题**：未配置微信隐私条款
- **方案**：在app.json中添加requiredPrivateInfos配置
- **实现**：根据小程序使用的接口添加相应的隐私权限声明

## 技术考虑

### 兼容性

- 确保修改不影响现有功能
- 保持CloudBase云函数调用逻辑不变

### 性能优化

- 图片预览使用临时链接缓存
- 启动页加载资源优化

### 安全性

- 继续使用微信安全检测API
- 确保用户隐私数据安全存储

## 设计风格

采用简洁现代的设计风格，以绿色环保为主题色。启动页使用品牌标志过渡，整体界面保持一致性。

## 页面规划

### 1. 启动页

- **背景**：白色背景
- **中心元素**：carbontracks.png品牌图片居中显示
- **过渡效果**：淡入淡出，持续2秒
- **布局**：全屏居中布局

### 2. 碳足迹记录页

- **顶部**：统一标题栏"carbontrack"，左侧返回按钮
- **筛选区**：筛选下拉菜单
- **统计区**：总记录数、总碳减排（整数显示）
- **列表区**：每条记录显示活动类型、活动数量、活动日期、记录时间、图片预览
- **底部**：加载状态提示

### 3. 计算页

- **顶部**：统一标题栏"carbontrack"，左侧返回按钮
- **内容区**：活动选择、数量输入、日期选择、图片上传
- **结果区**：碳减排数值（整数）、积分（整数）

### 4. 个人中心页

- **滚动**：禁止左右滚动
- **内容区**：用户信息、统计数据、功能菜单
- **字体**：统一数值字体大小，碳减排使用24px

## 设计内容描述

所有页面保持一致的视觉风格：

- 标题栏高度统一为88rpx
- 返回按钮图标统一使用"⬅️"
- 标题文字统一为"carbontrack"，字号36rpx，加粗
- 碳减排数值统一显示为整数，字体24px，颜色#4CAF50
- 启动页全屏显示品牌图片，保持2秒后自动跳转