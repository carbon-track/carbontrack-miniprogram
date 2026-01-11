// ============================================
// CloudBase 数据库操作 - 清空 users 表
// 使用方法：在云开发控制台 -> 数据库 -> users 集合 -> 高级代码编辑器 中运行
// ============================================

const db = cloud.database()

// ============================================
// 方法 1: 删除所有用户数据（推荐，有确认提示）
// ============================================
// ⚠️ 警告：此操作将删除 users 表中的所有数据，且不可恢复！

db.collection('users')
  .get()
  .then(res => {
    const count = res.data.length
    console.log(`找到 ${count} 条用户数据`)
    
    // 批量删除
    const deletePromises = res.data.map(item => {
      return db.collection('users').doc(item._id).remove()
    })
    
    return Promise.all(deletePromises)
  })
  .then(() => {
    console.log('✅ 所有用户数据已清空')
  })
  .catch(err => {
    console.error('❌ 清空失败:', err)
  })

// ============================================
// 方法 2: 直接删除所有用户（更快，但有风险）
// ============================================
// ⚠️ 警告：此操作将直接删除所有用户，无需先查询！

db.collection('users')
  .where({
    _openid: db.RegExp({
      regexp: '.*',
      options: 'i'
    })
  })
  .remove()
  .then(res => {
    console.log('✅ 用户表已清空，删除记录数:', res.stats.removed)
  })
  .catch(err => {
    console.error('❌ 清空失败:', err)
  })

// ============================================
// 方法 3: 删除指定用户（按_openid）
// ============================================
// 只删除指定的用户，保留其他用户

db.collection('users')
  .where({
    _openid: 'test_user_001'  // 替换为要删除的用户ID
  })
  .remove()
  .then(res => {
    console.log('✅ 指定用户已删除，删除记录数:', res.stats.removed)
  })
  .catch(err => {
    console.error('❌ 删除失败:', err)
  })

// ============================================
// 方法 4: 按条件删除（例如：删除积分小于10的用户）
// ============================================

db.collection('users')
  .where({
    points: _.lt(10)
  })
  .remove()
  .then(res => {
    console.log('✅ 已删除积分小于10的用户，删除记录数:', res.stats.removed)
  })
  .catch(err => {
    console.error('❌ 删除失败:', err)
  })

// ============================================
// 方法 5: 先统计，再删除（更安全）
// ============================================
// 先查看有多少用户，确认后再删除

// 步骤1: 统计用户数
db.collection('users')
  .count()
  .then(res => {
    console.log(`当前用户总数: ${res.total}`)
    console.log('⚠️ 请确认是否要删除这些用户！')
    console.log('如果确认，请运行下面的删除代码')
  })
  .catch(err => {
    console.error('❌ 统计失败:', err)
  })

// 步骤2: 确认后执行删除
db.collection('users')
  .where({
    _openid: db.RegExp({
      regexp: '.*',
      options: 'i'
    })
  })
  .remove()
  .then(res => {
    console.log('✅ 用户表已清空，删除记录数:', res.stats.removed)
  })
  .catch(err => {
    console.error('❌ 清空失败:', err)
  })

// ============================================
// 方法 6: 删除前导出数据（最安全）
// ============================================
// 先导出数据，再删除，以便恢复

// 导出数据
db.collection('users')
  .get()
  .then(res => {
    // 在控制台显示数据，可以复制保存
    console.log('用户数据（共', res.data.length, '条）:')
    console.log(JSON.stringify(res.data, null, 2))
    
    // 复制数据后，再执行删除
    console.log('⚠️ 请先复制上面的数据保存，确认后再运行删除代码')
  })
  .catch(err => {
    console.error('❌ 导出失败:', err)
  })

// 导出后执行删除
db.collection('users')
  .where({
    _openid: db.RegExp({
      regexp: '.*',
      options: 'i'
    })
  })
  .remove()
  .then(res => {
    console.log('✅ 用户表已清空，删除记录数:', res.stats.removed)
  })
  .catch(err => {
    console.error('❌ 清空失败:', err)
  })

// ============================================
// 注意事项：
// 1. 删除操作不可恢复，请谨慎操作
// 2. 建议先备份数据或导出数据
// 3. 生产环境操作前请先在测试环境验证
// 4. 删除用户数据可能影响关联的订单、交易记录等
// ============================================
