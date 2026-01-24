---
name: fix-new-issues
overview: 修复碳足迹小程序的4个新问题：图片保存、Splash布局、首页链接、统计数字大小
todos:
  - id: fix-splash-layout
    content: 修复Splash页面logo-wrapper布局，移除height:100%样式
    status: completed
  - id: fix-homepage-links
    content: 修复首页环保知识功能链接，将URL改为/pages/help/help
    status: completed
  - id: adjust-stats-font-size
    content: 调整个人中心统计数字字体大小，从24px改为18px
    status: completed
  - id: optimize-image-upload
    content: 优化碳足迹计算页面图片上传错误处理，允许用户选择继续提交
    status: completed
---

## 产品概述

修复碳足迹小程序的4个新问题，确保用户能够正常使用各项功能。

## 核心功能

- 修复碳足迹计算页面的图片保存功能
- 修复Splash启动页面的图片显示布局
- 修复首页功能区域的链接跳转
- 调整个人中心环保统计数字的显示大小

## 技术栈

- 微信小程序原生框架
- CloudBase云函数

## 技术架构

### 系统架构

现有微信小程序项目架构，无需引入新技术栈。采用分层结构：视图层（WXML/WXSS）、逻辑层（JS）、云函数层。

### 模块划分

- **视图层模块**：Splash启动页、首页、个人中心页面的样式修复
- **逻辑层模块**：首页功能链接逻辑、图片保存逻辑优化
- **云函数模块**：图片安全检测云函数

### 数据流

1. 图片上传流程：用户选择图片 → 上传到云存储 → 调用安全检测API → 检测通过/失败 → 提交记录
2. 页面导航流程：用户点击功能卡片 → 检查页面是否存在 → 跳转到正确页面

## 实现细节

### 核心文件修改

```
pages/splash/splash.wxss       # 修复布局样式
pages/index/index.js           # 修复环保知识链接
pages/center/center.wxss       # 调整统计数字大小
pages/calculate/calculate.js   # 优化图片保存错误处理
```

### 关键代码结构

**Splash布局修复**：

```css
.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  /* 移除 height: 100% */
  padding: 60rpx;
}
```

**首页链接修复**：

```javascript
{
  id: 4,
  title: '环保知识',
  description: '了解更多环保知识和小贴士',
  emoji: '💡',
  gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  url: '/pages/help/help'  // 修改为存在的页面
}
```

**统计数字大小调整**：

```css
.stat-value {
  font-size: 18px;  /* 从24px缩小到18px */
  font-weight: bold;
  margin-bottom: 4px;
}
```

**图片保存错误处理优化**：

```javascript
// 检测失败时，给予用户选择机会
if (!checkResult.passed) {
  wx.showModal({
    title: '图片检测未通过',
    content: '您的图片可能包含违规内容，是否继续提交（不带图片）？',
    success: (res) => {
      if (res.confirm) {
        // 继续提交不带图片的记录
        cloudImageUrl = '';
      } else {
        return; // 取消提交
      }
    }
  });
}
```

## 技术实现计划

### 任务1：修复Splash页面布局

1. 问题定位：`.logo-wrapper` 设置了 `height: 100%` 导致撑满屏幕
2. 解决方案：移除或调整该属性，使用自适应高度
3. 实现步骤：修改 splash.wxss 第17-24行

### 任务2：修复首页环保知识链接

1. 问题定位：链接指向不存在的 `/pages/knowledge/knowledge` 页面
2. 解决方案：将链接改为 `/pages/help/help` 页面
3. 实现步骤：修改 index.js 第122-129行

### 任务3：调整统计数字显示大小

1. 问题定位：`.stat-value` 字体大小为 24px，过大
2. 解决方案：将字体大小改为 18px
3. 实现步骤：修改 center.wxss 第210-214行

### 任务4：优化图片保存错误处理

1. 问题定位：图片检测失败时，整个提交流程被中断
2. 解决方案：改进错误处理，允许用户选择是否继续提交不带图片的记录
3. 实现步骤：修改 calculate.js 第377-395行的错误处理逻辑

## 技术考虑

### 日志

- 使用 console.log 记录图片上传和检测过程
- 保持现有的日志级别和格式

### 性能优化

- 图片上传使用压缩格式
- 错误处理避免不必要的重试

### 安全措施

- 保留图片安全检测机制
- 检测失败后删除违规图片

### 可扩展性

- 错误处理逻辑可复用到其他图片上传场景

## Agent Extensions

无需要使用的Agent扩展