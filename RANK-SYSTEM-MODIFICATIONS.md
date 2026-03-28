# 排行榜系统修改总结

## 🎯 修改目标

将排行榜系统从 **Mock数据** 改为 **全后端数据库读写**，实现三个榜单的真实数据查询。

## 📊 修改内容概览

### 1. **云函数修改**

#### `cloudfunctions/get-rank/index.js`
- ✅ 完全重写，实现三个榜单的真实数据库查询
- ✅ **全球榜**：查询所有用户按减碳量排序
- ✅ **校内榜**：根据用户学校字段过滤查询
- ✅ **好友榜**：根据好友关系表过滤查询
- ✅ 实时计算用户个人排名
- ✅ 支持分页查询
- ✅ 完善的错误处理机制

#### `cloudfunctions/create-friends-table/index.js` (新增)
- ✅ 创建好友关系表结构
- ✅ 添加示例好友关系数据
- ✅ 创建查询索引优化性能

#### `cloudfunctions/update-users-table/index.js` (新增)
- ✅ 更新用户表结构，添加必要字段
- ✅ 为现有用户补全缺失字段
- ✅ 可选创建测试用户数据

### 2. **前端页面修改**

#### `pages/rank/rank.js`
- ✅ 完全移除Mock数据生成函数
- ✅ 优化错误处理逻辑
- ✅ 支持未登录用户查看全球榜
- ✅ 完善登录和学校信息提示

#### `pages/rank/rank.wxml`
- ✅ 移除对Mock数据字段的依赖
- ✅ 使用数据库返回的标准字段
- ✅ 优化数据展示逻辑

### 3. **部署工具和文档**

#### `deploy-rank-system.bat`
- ✅ 提供完整的部署脚本
- ✅ 详细的部署步骤说明
- ✅ 包含测试脚本

#### `DEPLOY-CHECKLIST.md`
- ✅ 部署检查清单
- ✅ 常见问题排查
- ✅ 性能优化建议

## 🗄️ 数据库结构要求

### users 表必要字段
```javascript
{
  totalCarbon: number,     // 累计减碳量（kg）
  points: number,          // 积分
  school: string,          // 学校名称
  level: number,           // 用户等级
  username: string,        // 用户名（兼容nickName）
  avatarUrl: string,       // 头像URL
  // 其他字段...
}
```

### friends 表结构
```javascript
{
  userOpenId: string,      // 发起方用户ID
  friendOpenId: string,    // 好友用户ID
  status: string,          // 关系状态: pending/accepted/blocked
  friendSince: date,       // 成为好友时间
  notes: string,           // 备注信息
  createdAt: date,         // 创建时间
}
```

## 🚀 部署步骤

### 步骤1: 部署云函数
1. 部署 `get-rank` 云函数
2. 部署 `update-users-table` 云函数
3. 部署 `create-friends-table` 云函数

### 步骤2: 初始化数据库
1. 运行 `update-users-table` 添加字段和测试用户
2. 运行 `create-friends-table` 创建好友关系表

### 步骤3: 测试功能
1. 测试全球榜数据获取
2. 测试校内榜学校过滤
3. 测试好友榜好友关系过滤

## 🔧 功能测试

### 测试场景
1. **未登录用户**
   - 可以查看全球榜
   - 校内榜显示提示（需要登录和设置学校）
   - 好友榜显示登录提示

2. **已登录用户（无学校信息）**
   - 全球榜正常显示
   - 校内榜提示设置学校信息
   - 好友榜根据好友关系显示

3. **已登录用户（有学校信息）**
   - 三个榜单都能正常显示
   - 个人排名正确计算
   - 分页功能正常工作

## ⚠️ 注意事项

### 1. 数据迁移
- 现有用户可能缺少必要字段
- 需要运行 `update-users-table` 补全字段
- 测试数据可以按需添加

### 2. 性能优化
- 在 `users` 表创建 `totalCarbon` 降序索引
- 在 `users` 表创建 `school` 和 `totalCarbon` 联合索引
- 在 `friends` 表创建 `userOpenId` 和 `friendOpenId` 联合索引

### 3. 错误处理
- 数据库查询失败时返回友好错误信息
- 未登录用户有明确的引导提示
- 缺少必要字段时有清晰的修复指导

## 📈 性能影响

### 优化前（Mock数据）
- 前端生成数据，无网络请求
- 数据不真实，无法反映实际用户情况
- 无法实现个性化排名

### 优化后（真实数据库）
- **优点**：数据真实，排名准确，支持个性化
- **缺点**：需要数据库查询，有网络延迟
- **优化**：使用缓存、索引、分页等技术

## 🔄 回滚方案

如果需要回滚到Mock数据版本：
1. 恢复 `pages/rank/rank.js` 中的Mock数据函数
2. 修改 `loadRankData` 函数逻辑
3. 更新 `pages/rank/rank.wxml` 中的字段引用

## 📋 验证清单

- [ ] 全球榜能显示真实用户数据
- [ ] 校内榜能按学校过滤数据
- [ ] 好友榜能按好友关系过滤数据
- [ ] 用户个人排名计算正确
- [ ] 分页功能正常工作
- [ ] 未登录用户有合适的提示
- [ ] 错误处理机制完善
- [ ] 性能满足要求（查询时间 < 2秒）

---

**修改完成时间**: 2026-01-25  
**修改人员**: CarbonTrack Team  
**版本**: v2.0.0 (真实数据版)
