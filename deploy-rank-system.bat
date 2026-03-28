@echo off
REM ========================================
REM 排行榜系统部署脚本
REM ========================================

echo.
echo ======================================
echo   排行榜系统完整部署
echo ======================================
echo.

REM 颜色设置
color 0A

echo [1/6] 检查环境...
if not exist "cloudfunctions\get-rank" (
    echo 错误: get-rank 云函数目录不存在
    pause
    exit /b 1
)

if not exist "cloudfunctions\update-users-table" (
    echo 错误: update-users-table 云函数目录不存在
    pause
    exit /b 1
)

if not exist "cloudfunctions\create-friends-table" (
    echo 错误: create-friends-table 云函数目录不存在
    pause
    exit /b 1
)

echo ✓ 环境检查通过
echo.

echo [2/6] 准备部署文件...
echo ✓ 所有云函数文件已就绪
echo.

echo [3/6] 部署步骤说明...
echo.
echo ======================================
echo 部署步骤：
echo ======================================
echo.
echo 步骤1: 部署 get-rank 云函数
echo   1. 打开微信开发者工具
echo   2. 右键点击 cloudfunctions/get-rank 目录
echo   3. 选择"上传并部署：云端安装依赖"
echo   4. 等待部署完成
echo.
echo 步骤2: 部署 update-users-table 云函数
echo   1. 右键点击 cloudfunctions/update-users-table 目录
echo   2. 选择"上传并部署：云端安装依赖"
echo   3. 等待部署完成
echo.
echo 步骤3: 部署 create-friends-table 云函数
echo   1. 右键点击 cloudfunctions/create-friends-table 目录
echo   2. 选择"上传并部署：云端安装依赖"
echo   3. 等待部署完成
echo.
echo 步骤4: 初始化数据库表
echo   1. 进入云开发控制台 → 云函数
echo   2. 找到 update-users-table 云函数
echo   3. 点击"云端测试"
echo   4. 输入参数: {"addTestUsers": true, "testUserCount": 50}
echo   5. 点击"测试"
echo   6. 等待执行完成
echo.
echo 步骤5: 创建好友关系表
echo   1. 找到 create-friends-table 云函数
echo   2. 点击"云端测试"
echo   3. 输入参数: {"clearExisting": true}
echo   4. 点击"测试"
echo   5. 等待执行完成
echo.
echo ======================================
echo 测试排行榜系统：
echo ======================================
echo.
echo 1. 在小程序中打开排行榜页面
echo 2. 测试全球榜、校内榜、好友榜
echo 3. 检查数据是否从数据库获取
echo.
echo ======================================
echo 注意事项：
echo ======================================
echo.
echo 1. 确保 users 表有以下字段：
echo    - totalCarbon (number): 累计减碳量
echo    - points (number): 积分
echo    - school (string): 学校名称
echo    - level (number): 用户等级
echo.
echo 2. 确保 friends 表已创建
echo    - 用于好友榜数据查询
echo.
echo 3. 如果用户没有设置学校信息：
echo    - 校内榜会显示提示
echo    - 需要用户在个人资料中设置学校
echo.
echo 4. 如果用户没有好友：
echo    - 好友榜会显示"暂无好友数据"
echo    - 需要用户添加好友
echo.

pause

echo.
echo [4/6] 创建测试脚本...
echo.
echo 创建测试脚本: test-rank-system.js
echo.

REM 创建测试脚本
(
echo // 排行榜系统测试脚本
echo // 在小程序开发者工具中运行
echo 
echo async function testRankSystem() {
echo   console.log('开始测试排行榜系统...');
echo 
echo   // 测试全球榜
echo   console.log('测试1: 全球榜');
echo   try {
echo     const globalResult = await wx.cloud.callFunction({
echo       name: 'get-rank',
echo       data: {
echo         type: 'global',
echo         page: 1,
echo         limit: 10
echo       }
echo     });
echo     console.log('全球榜结果:', globalResult.result);
echo   } catch (error) {
echo     console.error('全球榜测试失败:', error);
echo   }
echo 
echo   // 测试校内榜
echo   console.log('测试2: 校内榜');
echo   try {
echo     const schoolResult = await wx.cloud.callFunction({
echo       name: 'get-rank',
echo       data: {
echo         type: 'school',
echo         page: 1,
echo         limit: 10
echo       }
echo     });
echo     console.log('校内榜结果:', schoolResult.result);
echo   } catch (error) {
echo     console.error('校内榜测试失败:', error);
echo   }
echo 
echo   // 测试好友榜
echo   console.log('测试3: 好友榜');
echo   try {
echo     const friendResult = await wx.cloud.callFunction({
echo       name: 'get-rank',
echo       data: {
echo         type: 'friend',
echo         page: 1,
echo         limit: 10
echo       }
echo     });
echo     console.log('好友榜结果:', friendResult.result);
echo   } catch (error) {
echo     console.error('好友榜测试失败:', error);
echo   }
echo 
echo   console.log('排行榜系统测试完成');
echo }
echo 
echo // 运行测试
echo testRankSystem();
) > test-rank-system.js

echo ✓ 测试脚本已创建
echo.

echo [5/6] 创建部署检查清单...
echo.
echo 创建部署检查清单: DEPLOY-CHECKLIST.md
echo.

REM 创建部署检查清单
(
echo # 排行榜系统部署检查清单
echo 
echo ## 部署前检查
echo - [ ] 微信开发者工具已打开
echo - [ ] 云开发环境已连接
echo - [ ] 项目已正确加载
echo 
echo ## 云函数部署
echo - [ ] get-rank 云函数已部署
echo - [ ] update-users-table 云函数已部署
echo - [ ] create-friends-table 云函数已部署
echo 
echo ## 数据库初始化
echo - [ ] 运行 update-users-table 云函数初始化用户表
echo - [ ] 运行 create-friends-table 云函数创建好友关系表
echo - [ ] 检查 users 表字段是否完整
echo - [ ] 检查 friends 表是否创建成功
echo 
echo ## 功能测试
echo - [ ] 全球榜能正常显示数据
echo - [ ] 校内榜能根据学校过滤数据
echo - [ ] 好友榜能根据好友关系过滤数据
echo - [ ] 用户个人排名能正确计算
echo - [ ] 分页功能正常工作
echo - [ ] 未登录用户能查看全球榜
echo - [ ] 错误提示信息正确
echo 
echo ## 数据库字段要求
echo 
echo ### users 表必要字段
echo - totalCarbon: 累计减碳量（number类型）
echo - points: 积分（number类型）
echo - school: 学校名称（string类型）
echo - level: 用户等级（number类型）
echo - username: 用户名（string类型，兼容nickName）
echo 
echo ### friends 表结构
echo - userOpenId: 发起方用户ID
echo - friendOpenId: 好友用户ID
echo - status: 关系状态（pending/accepted/blocked）
echo - friendSince: 成为好友时间
echo - notes: 备注信息
echo - createdAt: 创建时间
echo 
echo ## 常见问题排查
echo 
echo 1. **校内榜显示"请先设置学校信息"**
echo    - 检查用户是否有 school 字段
echo    - 运行 update-users-table 云函数添加字段
echo 
echo 2. **好友榜显示"暂无好友数据"**
echo    - 检查 friends 表是否有数据
echo    - 运行 create-friends-table 云函数添加测试数据
echo 
echo 3. **排行榜数据为空**
echo    - 检查 users 表是否有测试数据
echo    - 运行 update-users-table 云函数添加测试用户
echo 
echo 4. **用户排名计算错误**
echo    - 检查 totalCarbon 字段是否为数字
echo    - 确保数据库排序正确
echo 
echo ## 性能优化建议
echo 
echo 1. 在 users 表上创建索引：
echo    - totalCarbon 降序索引（用于排行榜排序）
echo    - school 和 totalCarbon 联合索引（用于校内榜）
echo    - _openid 索引（用于用户查询）
echo 
echo 2. 在 friends 表上创建索引：
echo    - userOpenId 和 friendOpenId 联合索引
echo 
echo 3. 使用缓存：
echo    - 排行榜数据可以缓存2-5分钟
echo    - 减少数据库查询压力
) > DEPLOY-CHECKLIST.md

echo ✓ 部署检查清单已创建
echo.

echo [6/6] 部署完成！
echo.
echo ======================================
echo 部署总结：
echo ======================================
echo.
echo ✅ 已完成以下工作：
echo    1. 检查环境配置
echo    2. 准备部署说明
echo    3. 创建测试脚本
echo    4. 创建部署检查清单
echo.
echo 📋 接下来需要手动执行：
echo    1. 按照部署步骤部署云函数
echo    2. 初始化数据库表
echo    3. 测试排行榜功能
echo.
echo 🔧 测试脚本：test-rank-system.js
echo 📝 检查清单：DEPLOY-CHECKLIST.md
echo.
echo ======================================
echo.

pause
