# 内容安全接口部署脚本
# 一键部署所有内容安全相关的云函数

Write-Host "=====================================" -ForegroundColor Green
Write-Host "内容安全接口部署工具" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# 检查是否安装了CloudBase CLI
if (-not (Get-Command tcb -ErrorAction SilentlyContinue)) {
    Write-Host "错误：未安装 CloudBase CLI" -ForegroundColor Red
    Write-Host "请先安装：npm install -g @cloudbase/cli" -ForegroundColor Yellow
    exit 1
}

# 检查是否已登录
Write-Host "检查CloudBase登录状态..." -ForegroundColor Cyan
$tcbLogin = tcb login --check 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "请先登录CloudBase：tcb login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ 已登录" -ForegroundColor Green
Write-Host ""

# 需要部署的云函数列表
$functions = @(
    @{ Name = "content-security"; Path = "cloudfunctions/content-security"; Description = "统一内容安全检测" },
    @{ Name = "review-admin"; Path = "cloudfunctions/review-admin"; Description = "审核管理" },
    @{ Name = "submit-feedback"; Path = "cloudfunctions/submit-feedback"; Description = "提交反馈（已集成安全检测）" },
    @{ Name = "update-profile"; Path = "cloudfunctions/update-profile"; Description = "更新资料（已集成安全检测）" }
)

Write-Host "需要部署的云函数：" -ForegroundColor Cyan
$functions | ForEach-Object {
    Write-Host "  - $($_.Name): $($_.Description)" -ForegroundColor White
}
Write-Host ""

# 确认部署
$confirm = Read-Host "是否开始部署? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "部署已取消" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# 部署每个云函数
$successCount = 0
$failedCount = 0

foreach ($func in $functions) {
    Write-Host "=====================================" -ForegroundColor Gray
    Write-Host "部署云函数: $($func.Name)" -ForegroundColor Cyan
    Write-Host "路径: $($func.Path)" -ForegroundColor Gray
    Write-Host ""
    
    # 安装依赖
    Write-Host "安装依赖..." -ForegroundColor Yellow
    $packageJsonPath = Join-Path $func.Path "package.json"
    if (Test-Path $packageJsonPath) {
        Set-Location $func.Path
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠ 依赖安装警告" -ForegroundColor Yellow
        }
        Set-Location (Split-Path -Parent $PSScriptRoot)
    }
    
    # 部署云函数
    Write-Host "部署云函数..." -ForegroundColor Yellow
    $deployResult = tcb fn deploy $func.Name 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 部署成功: $($func.Name)" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "✗ 部署失败: $($func.Name)" -ForegroundColor Red
        Write-Host $deployResult -ForegroundColor Red
        $failedCount++
    }
    
    Write-Host ""
}

# 部署总结
Write-Host "=====================================" -ForegroundColor Gray
Write-Host "部署完成" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Gray
Write-Host ""
Write-Host "成功: $successCount" -ForegroundColor Green
Write-Host "失败: $failedCount" -ForegroundColor Red
Write-Host ""

if ($failedCount -gt 0) {
    Write-Host "部分云函数部署失败，请检查错误信息" -ForegroundColor Yellow
    exit 1
}

# 检查并提示配置环境变量
Write-Host ""
Write-Host "=====================================" -ForegroundColor Gray
Write-Host "环境变量配置检查" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Gray
Write-Host ""
Write-Host "请确保以下环境变量已配置：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. get-wx-access-token 云函数：" -ForegroundColor White
Write-Host "   - WX_APPID: 你的小程序appId" -ForegroundColor Gray
Write-Host "   - WX_APPSECRET: 你的小程序appSecret" -ForegroundColor Gray
Write-Host ""
Write-Host "2. review-admin 云函数：" -ForegroundColor White
Write-Host "   - ADMIN_OPENIDS: 管理员openid列表（逗号分隔）" -ForegroundColor Gray
Write-Host ""
Write-Host "配置方法：" -ForegroundColor Cyan
Write-Host "  云开发控制台 → 云函数 → 函数配置 → 环境变量" -ForegroundColor Gray
Write-Host ""

$envConfirm = Read-Host "是否已配置环境变量? (y/n)"
if ($envConfirm -eq 'y') {
    Write-Host "✓ 环境变量已配置" -ForegroundColor Green
} else {
    Write-Host "⚠ 请先配置环境变量再使用" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "1. 配置环境变量（如未完成）" -ForegroundColor White
Write-Host "2. 按照 CONTENT-SECURITY-TESTING.md 进行测试" -ForegroundColor White
Write-Host "3. 验证三层审核机制" -ForegroundColor White
Write-Host ""
