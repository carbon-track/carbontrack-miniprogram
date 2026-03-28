@echo off
echo ========================================
echo 排行榜碳排放值格式化部署脚本
echo ========================================
echo.

echo 1. 部署更新后的排行榜云函数...
call cd /d "d:\programming\trae\carbontrack\carbon-track-miniapp\cloudfunctions\get-rank"
call npm install
echo.

echo 2. 上传并部署云函数...
echo 请在微信开发者工具中:
echo 1. 右键点击 cloudfunctions\get-rank 文件夹
echo 2. 选择「上传并部署：云端安装依赖」
echo.

echo 3. 更新说明:
echo ✅ 云函数已修改，将碳排放值四舍五入到小数点后两位
echo ✅ 前端JS代码已添加额外格式化，确保显示一致性
echo ✅ 修改涉及三个榜单: 全球榜、校内榜、好友榜
echo.

echo 4. 测试建议:
echo 1. 打开小程序，进入排行榜页面
echo 2. 切换三个榜单，查看碳排放值显示
echo 3. 确认所有碳排放值都显示为两位小数
echo.

echo 部署完成!
pause