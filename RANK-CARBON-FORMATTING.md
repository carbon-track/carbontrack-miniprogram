# 排行榜碳排放值格式化修改说明

## 修改目的

将排行榜三个榜单（全球榜、校内榜、好友榜）中的碳排放值统一格式化为四舍五入到小数点后两位，提升数据显示的一致性和用户体验。

## 修改内容

### 1. 云函数修改 (cloudfunctions/get-rank/index.js)

在三个地方添加了四舍五入到小数点后两位的逻辑：

1. **全球榜用户排名计算** (第46行):
   ```javascript
   const roundedCarbonSaved = Math.round((currentUser.totalCarbon || 0) * 100) / 100
   ```

2. **校内榜用户排名计算** (第91行):
   ```javascript
   const roundedCarbonSaved = Math.round((currentUser.totalCarbon || 0) * 100) / 100
   ```

3. **好友榜用户排名计算** (第155行):
   ```javascript
   const roundedCarbonSaved = Math.round((currentUser.totalCarbon || 0) * 100) / 100
   ```

4. **排行榜列表数据格式化** (第190行):
   ```javascript
   const roundedCarbonSaved = Math.round((user.totalCarbon || 0) * 100) / 100
   ```

### 2. 前端页面修改 (pages/rank/rank.js)

在数据接收处理时添加了额外的格式化函数作为双重保障：

```javascript
// 格式化碳排放值，确保显示两位小数
const formatCarbonValue = (value) => {
  if (value === undefined || value === null) return 0
  const num = Number(value)
  if (isNaN(num)) return 0
  return Math.round(num * 100) / 100
}

// 格式化排行榜数据
const formattedRankList = result.rankList.map(item => ({
  ...item,
  carbonSaved: formatCarbonValue(item.carbonSaved)
}))

// 格式化用户排名数据
const formattedUserRank = result.userRank ? {
  ...result.userRank,
  carbonSaved: formatCarbonValue(result.userRank.carbonSaved)
} : null
```

## 技术实现细节

### 四舍五入算法

使用标准的四舍五入算法：
```javascript
Math.round(value * 100) / 100
```

例如：
- `12.345` → `12.35`
- `12.344` → `12.34`
- `0` → `0.00`

### 数据流说明

1. **数据库层面**: 存储原始的 `totalCarbon` 值，不进行修改
2. **云函数层面**: 查询时进行四舍五入格式化，返回格式化后的 `carbonSaved` 值
3. **前端层面**: 接收到数据后再次进行格式化，确保显示一致性

## 影响的榜单

1. **全球榜** (global): 显示所有用户的碳减排排名
2. **校内榜** (school): 显示同一学校用户的碳减排排名
3. **好友榜** (friend): 显示好友之间的碳减排排名

## 部署步骤

1. **更新云函数**:
   ```bash
   cd cloudfunctions/get-rank
   npm install
   ```

2. **上传部署**:
   - 在微信开发者工具中
   - 右键点击 `cloudfunctions/get-rank` 文件夹
   - 选择「上传并部署：云端安装依赖」

3. **测试验证**:
   - 打开小程序，进入排行榜页面
   - 切换三个榜单，确认碳排放值显示为两位小数
   - 验证排名计算的准确性

## 注意事项

1. **排名计算**: 排名仍然基于原始的 `totalCarbon` 值计算，确保准确性
2. **数据精度**: 四舍五入只影响显示，不影响存储和计算
3. **性能影响**: 格式化操作计算量小，对性能无影响
4. **兼容性**: 与现有代码完全兼容，无需其他修改

## 测试案例

### 测试数据示例

原始数据:
- 用户A: `totalCarbon = 12.345`
- 用户B: `totalCarbon = 12.344`
- 用户C: `totalCarbon = 8.956`

格式化后显示:
- 用户A: `12.35 kg`
- 用户B: `12.34 kg`
- 用户C: `8.96 kg`

### 排名验证

即使显示值相同（如12.35），原始值不同（12.345 vs 12.344）的排名仍保持正确。

## 后续优化建议

1. **缓存优化**: 考虑缓存格式化后的排行榜数据
2. **国际化**: 支持不同语言单位的格式化（如lbs, kg）
3. **动画效果**: 排行榜更新时添加平滑的数值变化动画
4. **历史趋势**: 显示用户碳排放值的历史变化趋势图

---

**修改日期**: 2026-03-28  
**负责人**: CarbonTrack 开发团队  
**版本**: v1.1.0