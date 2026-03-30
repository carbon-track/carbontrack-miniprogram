@echo off
echo ========================================
echo 排行榜重复用户问题修复部署脚本
echo ========================================
echo.

echo 1. 修复的问题:
echo ✅ 修复WX:KEY绑定问题 (使用 _id 而非 id)
echo ✅ 避免当前用户在排行榜列表中重复显示
echo ✅ 添加二级排序确保相同carbon值时的稳定排序
echo.

echo 2. 部署更新后的排行榜云函数...
call cd /d "d:\programming\trae\carbontrack\carbon-track-miniapp\cloudfunctions\get-rank"
call npm install
echo.

echo 3. 需要上传并部署的文件:
echo 1) cloudfunctions/get-rank/index.js
echo 2) pages/rank/rank.js
echo 3) pages/rank/rank.wxml
echo.

echo 4. 上传并部署云函数:
echo 请在微信开发者工具中:
echo 1. 右键点击 cloudfunctions\get-rank 文件夹
echo 2. 选择「上传并部署：云端安装依赖」
echo.

echo 5. 测试建议:
echo 1. 打开小程序，进入排行榜页面
echo 2. 切换三个榜单，查看是否有重复用户
echo 3. 确认排名顺序正确
echo 4. 测试当前用户排名显示
echo.

echo 6. 修复说明:
echo 🔧 WX:KEY问题: 使用 _id 字段确保列表渲染正确
echo 🔧 重复用户: 当前用户如果在列表中，会单独显示在下方
echo 🔧 排序稳定: 添加 _id 二级排序，确保相同carbon值时稳定排序
echo.

echo 部署完成!
pause