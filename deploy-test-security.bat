@echo off
REM ========================================
REM 内容安全测试部署脚本
REM ========================================

echo.
echo ======================================
echo   内容安全测试系统部署
echo ======================================
echo.

REM 颜色设置
color 0A

echo [1/4] 检查环境...
if not exist "cloudfunctions\content-security" (
    echo 错误: content-security 云函数目录不存在
    pause
    exit /b 1
)

if not exist "cloudfunctions\content-security\test.js" (
    echo 错误: test.js 文件不存在
    pause
    exit /b 1
)

echo ✓ 环境检查通过
echo.

echo [2/4] 准备测试云函数...
if not exist "cloudfunctions\test-security" (
    mkdir cloudfunctions\test-security
    echo 创建 test-security 目录
)

REM 复制主函数
copy /Y cloudfunctions\content-security\test.js cloudfunctions\test-security\index.js
echo ✓ 复制 test.js 到 index.js

REM 复制配置文件
if exist "cloudfunctions\content-security\package.json" (
    copy /Y cloudfunctions\content-security\package.json cloudfunctions\test-security\package.json
    echo ✓ 复制 package.json
)

echo.
echo [3/4] 安装依赖...
cd cloudfunctions\test-security

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 安装测试函数依赖...
    call npm install
) else (
    echo ✓ 依赖已存在，跳过安装
)

cd ..\..
echo.

echo [4/4] 部署说明...
echo.
echo ======================================
echo 部署步骤：
echo ======================================
echo.
echo 1. 打开微信开发者工具
echo 2. 右键点击 cloudfunctions/test-security 目录
echo 3. 选择"上传并部署：云端安装依赖"
echo 4. 等待部署完成
echo.
echo ======================================
echo 测试调用示例：
echo ======================================
echo.
echo 在云开发控制台 - 云函数 - test-security
echo 点击"云端测试"，输入以下参数：
echo.
echo 测试所有功能:
echo {
echo   "testSuite": "all"
echo }
echo.
echo 仅测试文本:
echo {
echo   "testSuite": "coverage",
echo   "contentType": "text"
echo }
echo.
echo 边界测试:
echo {
echo   "testSuite": "boundary"
echo }
echo.
echo ======================================
echo.

pause
