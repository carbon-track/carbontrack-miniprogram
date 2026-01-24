/* components/image-uploader/image-uploader.js */

Component({
  properties: {
    maxSize: {
      type: Number,
      value: 10 * 1024 * 1024 // 默认10MB
    },
    theme: {
      type: String,
      value: 'light'
    }
  },
  
  data: {
    tempImagePath: '',
    status: '', // checking, success, error
    showStatus: false,
    errorMsg: ''
  },
  
  methods: {
    // 选择图片
    chooseImage() {
      const that = this;
      
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera', 'album'], // 支持拍照和相册选择
        maxDuration: 30,
        camera: 'back',
        success(res) {
          const tempFilePath = res.tempFiles[0].tempFilePath;
          const size = res.tempFiles[0].size;
          
          // 1. 前端预检查：文件大小
          if (size > that.data.maxSize) {
            that.showError('图片大小超过10MB限制');
            return;
          }
          
          // 2. 前端预检查：文件类型
          const fileType = tempFilePath.split('.').pop().toLowerCase();
          const allowedTypes = ['jpg', 'jpeg', 'png'];
          if (!allowedTypes.includes(fileType)) {
            that.showError('仅支持jpg、jpeg、png格式');
            return;
          }
          
          that.setData({
            tempImagePath: tempFilePath,
            showStatus: false,
            errorMsg: ''
          });
        },
        fail(err) {
          console.error('选择图片失败:', err);
          wx.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 重新选择
    rechooseImage() {
      this.setData({
        tempImagePath: '',
        status: '',
        showStatus: false,
        errorMsg: ''
      });
    },
    
    // 上传并检测图片
    async uploadImage() {
      const { tempImagePath } = this.data;
      
      if (!tempImagePath) {
        wx.showToast({
          title: '请先选择图片',
          icon: 'none'
        });
        return;
      }
      
      // 显示检测状态
      this.setData({
        status: 'checking',
        showStatus: true,
        errorMsg: ''
      });
      
      try {
        // 先上传到云存储
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath: `review-images/${Date.now()}-${Math.random()}.jpg`,
          filePath: tempImagePath
        });
        
        // 调用微信内容安全API检测
        const result = await this.checkImageSecurity(uploadResult.fileID);
        
        if (result.passed) {
          // 检测通过
          this.setData({
            status: 'success'
          });
          
          // 触发成功事件，将图片路径传递给父组件
          this.triggerEvent('success', {
            imagePath: uploadResult.fileID
          });
          
          // 2秒后自动隐藏状态提示
          setTimeout(() => {
            this.setData({ showStatus: false });
          }, 2000);
        } else {
          // 检测不通过，删除已上传的文件
          await wx.cloud.deleteFile({
            fileList: [uploadResult.fileID]
          });
          
          // 显示错误
          this.showError(result.errMsg || '图片包含违规内容');
        }
      } catch (error) {
        console.error('图片检测失败:', error);
        this.showError('检测失败，请稍后重试');
      }
    },
    
    // 调用微信安全检测API
    async checkImageSecurity(fileID) {
      try {
        // 调用云函数进行检测
        const result = await wx.cloud.callFunction({
          name: 'check-image-security',
          data: {
            fileID: fileID
          }
        });
        
        if (result.result.errcode === 0) {
          return {
            passed: true,
            errcode: 0
          };
        } else if (result.result.errcode === 87014) {
          return {
            passed: false,
            errcode: 87014,
            errMsg: '图片包含违规内容（如二维码、水印、敏感图案等）'
          };
        } else {
          return {
            passed: false,
            errcode: result.result.errcode,
            errMsg: result.result.errmsg || '图片检测失败'
          };
        }
      } catch (error) {
        console.error('API调用失败:', error);
        throw error;
      }
    },
    
    // 显示错误信息
    showError(msg) {
      this.setData({
        status: 'error',
        showStatus: true,
        errorMsg: msg
      });
      
      // 3秒后自动隐藏
      setTimeout(() => {
        this.setData({ showStatus: false });
      }, 3000);
    }
  }
});