# Deploy all CloudBase functions using TCB MCP integration
# This script uses CloudBase CLI with MCP support

$envId = "pangou-8g51newcf37c99d1"
$projectRoot = "D:\programming\trae\carbontrack\carbon-track-miniapp"
$cloudFunctionsDir = "$projectRoot\cloudfunctions"

# Change to project root
cd $projectRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deploying CloudBase Functions with MCP" -ForegroundColor Cyan
Write-Host "Environment: $envId" -ForegroundColor Green
Write-Host "Functions Directory: $cloudFunctionsDir" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# Define all functions to deploy
$functions = @(
    "get-products", "get-product-detail", "create-product", "update-product",
    "get-balance", "get-transactions", "add-transaction",
    "create-exchange-order", "get-exchange-orders", "get-exchange-order-detail", "update-exchange-order",
    "get-achievements", "check-achievements", "create-achievement",
    "get-activities", "join-activity", "update-activity-progress", "claim-activity-reward", "create-activity",
    "get-messages", "mark-message-read", "send-message", "delete-message",
    "get-announcements", "get-announcement-detail", "create-announcement", "update-announcement",
    "submit-feedback", "get-feedback-list", "reply-feedback",
    "get-user-settings", "update-user-settings",
    "create-test-store-data", "insert-store-data", "query-users",
    "email-login", "wx-login", "register", "verify-user",
    "get-carbon-records", "save-carbon-record", "get-rank", "get-user-info", "get-user-stats",
    "update-profile"
)

$successCount = 0
$failCount = 0

foreach ($func in $functions) {
    $funcPath = "$cloudFunctionsDir\$func"
    
    if (Test-Path $funcPath) {
        Write-Host "`nDeploying: $func" -ForegroundColor Yellow
        Write-Host "Path: $funcPath" -ForegroundColor Gray
        
        try {
            # Use TCB CLI to deploy function
            $output = tcb fn deploy $func -e $envId 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Success: $func" -ForegroundColor Green
                $successCount++
            }
            else {
                Write-Host "❌ Failed: $func" -ForegroundColor Red
                Write-Host "Error: $output" -ForegroundColor Red
                $failCount++
            }
        }
        catch {
            Write-Host "❌ Exception deploying $func" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
        
        # Add a small delay between deployments
        Start-Sleep -Milliseconds 500
    }
    else {
        Write-Host "⚠️  Skipping: $func (directory not found)" -ForegroundColor Yellow
    }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Total Functions: $($functions.Count)" -ForegroundColor White
Write-Host "Successfully Deployed: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`n🎉 All functions deployed successfully!" -ForegroundColor Green
    Write-Host "Functions are now using Node.js runtime specified in package.json" -ForegroundColor Green
}
else {
    Write-Host "`n⚠️  Some functions failed to deploy." -ForegroundColor Yellow
    Write-Host "Check the error messages above and try again." -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Check CloudBase Console to verify all functions are deployed" -ForegroundColor White
Write-Host "2. Test a few functions to ensure they work correctly" -ForegroundColor White
Write-Host "3. Check function runtime version in console" -ForegroundColor White
