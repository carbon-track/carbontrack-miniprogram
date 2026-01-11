# CloudBase Functions Deployment Guide

## Prerequisites

1. Install TCB CLI 2.11.9 or later
2. Configure cloudbaserc.json with your envId
3. PowerShell with UTF-8 encoding

## Step 1: Fix PowerShell Encoding (Important!)

### Option A: Temporary (current session)
```powershell
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

### Option B: Permanent (recommended)
```powershell
# Create PowerShell profile
New-Item -ItemType File -Path $PROFILE -Force

# Edit profile
notepad $PROFILE

# Add these lines and save:
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

Restart PowerShell after setting the profile.

## Step 2: Set English Language for TCB CLI

```powershell
$env:LANG = "en_US.UTF-8"
$env:LC_ALL = "en_US.UTF-8"
```

## Step 3: Deploy Functions

### Method A: Deploy all functions at once
```powershell
.\deploy-all-functions.ps1
```

### Method B: Deploy individually
```powershell
cd D:\programming\trae\carbontrack\carbon-track-miniapp

# Deploy each function
tcb fn deploy get-products -e pangou-8g51newcf37c99d1
tcb fn deploy get-product-detail -e pangou-8g51newcf37c99d1
# ... repeat for all functions
```

## Step 4: Update Runtime to Node.js 16 (Manual)

Since TCB CLI 2.11.9 doesn't support --runtime parameter, you need to manually update runtime:

1. Open CloudBase Console: https://console.cloud.tencent.com/tcb
2. Select environment: pangou-8g51newcf37c99d1
3. Go to "Cloud Functions"
4. Click on each function
5. Click "Edit" or "Configuration"
6. Change "Runtime" to "Node.js 16.13"
7. Click "Save and Deploy"

### Functions to update (33 total):
- get-products
- get-product-detail
- create-product
- update-product
- get-balance
- get-transactions
- add-transaction
- create-exchange-order
- get-exchange-orders
- get-exchange-order-detail
- update-exchange-order
- get-achievements
- check-achievements
- create-achievement
- get-activities
- join-activity
- update-activity-progress
- claim-activity-reward
- create-activity
- get-messages
- mark-message-read
- send-message
- delete-message
- get-announcements
- get-announcement-detail
- create-announcement
- update-announcement
- submit-feedback
- get-feedback-list
- reply-feedback
- get-user-settings
- update-user-settings
- create-test-store-data
- insert-store-data
- query-users

## Troubleshooting

### Error: "unknown option '--runtime'"
**Solution**: Remove --runtime from deploy command. TCB CLI 2.11.9 doesn't support it.

### Garbled/Chinese characters in output
**Solution**: Set PowerShell encoding to UTF-8 (see Step 1)

### Path not found errors
**Solution**: Ensure you're running the script from the project root directory

### Deployment failures
**Solution**: Check if function directory exists and contains valid code

## Quick Start (All-in-One)

Run these commands in PowerShell:

```powershell
# Fix encoding
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Set English
$env:LANG = "en_US.UTF-8"
$env:LC_ALL = "en_US.UTF-8"

# Deploy
cd D:\programming\trae\carbontrack\carbon-track-miniapp
.\deploy-all-functions.ps1
```

After deployment, manually update runtime to Node.js 16.13 in CloudBase Console.
