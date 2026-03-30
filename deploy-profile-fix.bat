@echo off
echo ========================================
echo 个人信息保存错误 -504003 修复脚本
echo ========================================
echo.

echo 1. 错误分析:
echo ❌ 错误码: -504003 (云函数执行失败)
echo 📋 问题: update-profile -> content-security -> get-wx-access-token 调用链失败
echo.

echo 2. 可能的原因:
echo 1) content-security 云函数未部署
echo 2) get-wx-access-token 云函数未部署
echo 3) 缺少环境变量 WX_APPID/WX_APPSECRET
echo 4) 依赖包未安装 (axios)
echo 5) 云函数超时
echo.

echo 3. 修复步骤:
echo.

echo 3.1 检查并配置环境变量:
echo 请到云开发控制台 -> 云函数 -> 配置:
echo 为 get-wx-access-token 云函数添加环境变量:
echo WX_APPID=你的小程序AppID
echo WX_APPSECRET=你的小程序AppSecret
echo.

echo 3.2 安装依赖包:
echo 打开命令行，执行以下命令:
call cd /d "d:\programming\trae\carbontrack\carbon-track-miniapp\cloudfunctions\get-wx-access-token"
call npm install
echo.
call cd /d "d:\programming\trae\carbontrack\carbon-track-miniapp\cloudfunctions\content-security"
call npm install axios
echo.

echo 3.3 上传并部署云函数:
echo 请在微信开发者工具中:
echo 1. 右键点击 cloudfunctions\get-wx-access-token 文件夹
echo 2. 选择「上传并部署：云端安装依赖」
echo.
echo 3. 右键点击 cloudfunctions\content-security 文件夹
echo 4. 选择「上传并部署：云端安装依赖」
echo.
echo 4. 右键点击 cloudfunctions\update-profile 文件夹
echo 5. 选择「上传并部署：云端安装依赖」
echo.

echo 4. 测试验证:
echo 1. 打开小程序
echo 2. 进入个人资料页面
echo 3. 修改昵称或简介
echo 4. 点击保存
echo 5. 验证是否成功
echo.

echo 5. 紧急修复方案 (如果无法解决):
echo 临时禁用内容安全检测:
echo 修改 cloudfunctions\update-profile\index.js 第51-149行
echo 注释掉内容安全检测代码
echo.

echo 修复完成!
pause