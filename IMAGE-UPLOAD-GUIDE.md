# 图片上传检测功能使用指南

基于 UGC 内容审核要求中的**图片检测（晒单图/产品实拍图/教程配图）**规范实现，已集成到碳减排记录页面的凭据上传功能。

## 📦 已创建的文件

### 1️⃣ **云函数**（4个文件）
```
cloudfunctions/
├── check-image-security/
│   ├── index.js             # 图片安全检测
│   └── package.json         # 依赖（axios + form-data）
└── get-wx-access-token/
    ├── index.js             # access_token获取（带缓存）
    └── package.json         # 依赖（axios）
```

### 2️⃣ **图片上传组件**（可选，4个文件）
```
components/image-uploader/
├── image-uploader.json      # 组件配置
├── image-uploader.wxml      # 组件模板
├── image-uploader.wxss      # 组件样式（支持深色模式）
└── image-uploader.js        # 组件逻辑
```

### 3️⃣ **碳减排记录凭证上传集成**（已集成到calculate页面）
```
pages/calculate/
├── calculate.js               # 已添加图片检测逻辑
├── calculate.wxml             # 已添加检测状态UI
└── calculate.wxss             # 已添加检测状态样式
```

## 🚀 快速开始

### 步骤1：配置云函数环境变量
在CloudBase控制台为 `get-wx-access-token` 云函数配置环境变量：

```
WX_APPID=你的小程序appId
WX_APPSECRET=你的小程序appSecret
```

**配置路径**：云函数列表 → get-wx-access-token → 函数配置 → 环境变量

### 步骤2：安装依赖
```bash
# 进入云函数目录
cd cloudfunctions/check-image-security && npm install
cd ../get-wx-access-token && npm install
```

### 步骤3：部署云函数
```bash
./deploy-carbon-functions.ps1
```

### 步骤4：验证碳减排记录图片检测
打开碳减排记录页面（calculate），上传活动凭证图片时会自动进行安全检测

## 📱 碳减排记录凭证上传检测（已集成）

碳减排记录页面的图片上传功能已在 `pages/calculate` 页面集成图片检测。

### 集成代码位置

**pages/calculate/calculate.js**
```javascript
// 提交记录
async submitRecord() {
  // ...
  
  // 上传图片到云存储（如果有）
  if (imageUrl) {
    // 上传图片
    const uploadResult = await wx.cloud.uploadFile({...});
    
    // 调用微信安全API检测图片
    this.setData({ checkingImage: true });
    
    const checkResult = await this.checkImageSecurity(uploadResult.fileID);
    
    if (checkResult.passed) {
      // 检测通过
      cloudImageUrl = uploadResult.fileID;
    } else {
      // 检测不通过，删除已上传的文件
      await wx.cloud.deleteFile({
        fileList: [uploadResult.fileID]
      });
      
      // 提示用户并阻止提交
      wx.showToast({
        title: checkResult.errMsg || '图片包含违规内容',
        icon: 'none',
        duration: 3000
      });
      
      return; // 阻止提交
    }
  }
}

// 调用微信安全检测API
async checkImageSecurity(fileID) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'check-image-security',
      data: { fileID }
    });
    
    return {
      passed: result.result.errcode === 0,
      errcode: result.result.errcode,
      errMsg: result.result.errmsg
    };
  } catch (error) {
    console.error('图片检测失败:', error);
    throw error;
  }
}
```

**pages/calculate/calculate.wxml**
```xml
<!-- 图片检测状态 -->
<view class="security-check-panel" wx:if="{{checkingImage}}">
  <view class="check-status">
    <text class="loading-icon">⏳</text>
    <text class="check-text">正在检测图片安全性...</text>
  </view>
</view>
```

**pages/calculate/calculate.wxss**
```css
/* 图片检测状态样式 */
.security-check-panel {
  width: 100%;
  padding: 30rpx;
  background: #F7F7F7;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.check-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.loading-icon {
  font-size: 40rpx;
  animation: spin 1s linear infinite;
}

.check-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 📦 在新增页面中使用（组件方式）

如果你的其他页面需要图片上传功能，可以使用组件：

#### 在页面配置中引入组件
```json
// pages/your-page/your-page.json
{
  "usingComponents": {
    "image-uploader": "/components/image-uploader/image-uploader"
  }
}
```

#### 在页面中使用
```xml
<!-- pages/your-page/your-page.wxml -->
<image-uploader 
  theme="{{theme}}"
  bind:success="onImageUploadSuccess"
/>
```

#### 在页面逻辑中处理
```javascript
// pages/your-page/your-page.js
Page({
  onImageUploadSuccess(e) {
    const imagePath = e.detail.imagePath;
    console.log('图片上传成功:', imagePath);
    // 保存图片路径到表单数据
  }
});
```

## ⚠️ 检测规则

根据 UGC 内容审核要求，重点检测：
- ✅ **二维码/微信号水印**（防止引流）⭐ 重点检测
- ✅ **违规图案**（色情、暴力、政治敏感等）
- ✅ **低俗图片**
- ✅ **非相关内容**

## 🚫 违规处理

- 检测不通过的图片将被自动删除
- 用户会收到清晰的违规提示
- 阻止提交包含违规图片的记录

## 🔧 自定义配置

### 修改文件大小限制
```javascript
// 前端预检查已在 calculate.js 中设置
// 如需修改，编辑 calculate.js 的 chooseImage 方法
```

### 检测失败处理
```javascript
// 已在 calculate.js 中实现
// 检测失败时会：
// 1. 删除已上传的违规图片
// 2. 提示用户具体原因
// 3. 阻止表单提交
```

## 📊 审核流程

```
用户上传活动凭证图片
    ↓
上传到云存储
    ↓
调用微信安全API检测
    ↓
检测通过 → 保存记录并展示
    ↓
检测失败 → 删除图片 → 提示用户 → 阻止提交
```

## 📚 相关文档

- [微信图片检测API官方文档](https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/sec-center/sec-check/imgSecCheck.html)
- [UGC内容审核要求](./UGC内容审核要求.md)

## 🆘 常见问题

### Q: 图片检测失败怎么办？
A: 检查：
1. 云函数是否部署成功
2. 环境变量是否配置正确
3. 查看云函数日志排查错误

### Q: 如何申请提高API调用额度？
A: 在微信开放平台提交申请，说明小程序的UGC场景和需求。

### Q: 误判率太高怎么办？
A: 可叠加第三方内容审核产品（如阿里云、腾讯云）进行二次检测。

## 📝 注意事项

1. **先检测后发布**：必须等待API返回结果，通过后才允许提交记录
2. **失败拒绝发布**：API调用失败或超时，直接拒绝用户提交
3. **环境变量配置**：必须配置 `WX_APPID` 和 `WX_APPSECRET`
4. **云函数部署**：部署前需安装依赖（`npm install`）
5. **审核日志**：建议记录所有检测记录，留存≥6个月
