# PowerShell script to deploy CloudBase functions with specific runtime
# Uses CloudBase API to set Node.js 16 runtime

$envId = "pangou-8g51newcf37c99d1"
$projectRoot = "D:\programming\trae\carbontrack\carbon-track-miniapp"
$cloudFunctionsDir = "$projectRoot\cloudfunctions"

if (-not (Test-Path $cloudFunctionsDir)) {
    Write-Host "Error: cloudfunctions directory not found" -ForegroundColor Red
    exit 1
}

$functions = @(
    "get-products",
    "get-product-detail",
    "create-product",
    "update-product",
    "get-balance",
    "get-transactions",
    "add-transaction",
    "create-exchange-order",
    "get-exchange-orders",
    "get-exchange-order-detail",
    "update-exchange-order",
    "get-achievements",
    "check-achievements",
    "create-achievement",
    "get-activities",
    "join-activity",
    "update-activity-progress",
    "claim-activity-reward",
    "create-activity",
    "get-messages",
    "mark-message-read",
    "send-message",
    "delete-message",
    "get-announcements",
    "get-announcement-detail",
    "create-announcement",
    "update-announcement",
    "submit-feedback",
    "get-feedback-list",
    "reply-feedback",
    "get-user-settings",
    "update-user-settings",
    "create-test-store-data",
    "insert-store-data",
    "query-users"
)

cd $projectRoot

Write-Host "Starting deployment of all functions..." -ForegroundColor Green
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
            # First deploy without runtime parameter
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
    Write-Host "All functions deployed successfully!" -ForegroundColor Green
}
else {
    Write-Host "Some functions failed to deploy. Check errors above." -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor Cyan
Write-Host "NOTE: To change runtime to Node.js 16 after deployment:" -ForegroundColor Yellow
Write-Host "1. Open 云开发控制台" -ForegroundColor Yellow
Write-Host "2. Go to 云函数" -ForegroundColor Yellow
Write-Host "3. Click each function" -ForegroundColor Yellow
Write-Host "4. Edit configuration" -ForegroundColor Yellow
Write-Host "5. Change Runtime to Node.js 16.13" -ForegroundColor Yellow
Write-Host "6. Save and redeploy" -ForegroundColor Yellow
