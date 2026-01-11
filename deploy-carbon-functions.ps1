# PowerShell script to deploy new carbon-related functions
# Usage: Run this script in PowerShell

$envId = "pangou-8g51newcf37c99d1"
$projectRoot = "D:\programming\trae\carbontrack\carbon-track-miniapp"
$cloudFunctionsDir = "$projectRoot\cloudfunctions"

if (-not (Test-Path $cloudFunctionsDir)) {
    Write-Host "Error: cloudfunctions directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    exit 1
}

# 新创建的碳核算相关云函数
$functions = @(
    "get-carbon-rules",
    "create-carbon-rule",
    "update-carbon-rule",
    "init-carbon-rules"
)

cd $projectRoot

Write-Host "Starting deployment of carbon-related functions..." -ForegroundColor Green
Write-Host "Environment: $envId" -ForegroundColor Cyan
Write-Host "Functions to deploy: $($functions.Count)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($func in $functions) {
    $funcPath = "$cloudFunctionsDir\$func"
    if (Test-Path $funcPath) {
        Write-Host "Deploying: $func" -ForegroundColor Yellow
        try {
            $output = tcb fn deploy $func -e $envId 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Success: $func" -ForegroundColor Green
                $successCount++
            }
            else {
                Write-Host "  Failed: $func" -ForegroundColor Red
                Write-Host "  Error: $output" -ForegroundColor Red
                $failCount++
            }
            
            Start-Sleep -Seconds 1
        }
        catch {
            Write-Host "  Exception deploying $func" -ForegroundColor Red
            $errorMessage = $_.Exception.Message
            Write-Host "  Error: $errorMessage" -ForegroundColor Red
            $failCount++
        }
    }
    else {
        Write-Host "Warning: Function directory $func not found, skipping" -ForegroundColor Yellow
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "All carbon functions deployed successfully!" -ForegroundColor Green
    Write-Host "You can now initialize carbon rules data." -ForegroundColor Green
}
else {
    Write-Host "Some functions failed to deploy. Check errors above." -ForegroundColor Yellow
}
