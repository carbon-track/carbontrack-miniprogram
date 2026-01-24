// components/record-detail-modal/record-detail-modal.js
Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    record: {
      type: Object,
      value: {}
    }
  },

  data: {
    currentImageIndex: 0,
    formattedDate: '',
    formattedCreateTime: ''
  },

  observers: {
    'record': function(record) {
      if (record) {
        // 格式化日期为 YYYY-MM-DD
        const formatDate = (dateString) => {
          if (!dateString) return '暂无日期';
          const date = new Date(dateString);
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        };

        // 格式化时间为 YYYY-MM-DD HH:mm
        const formatDateTime = (dateString) => {
          if (!dateString) return '暂无时间记录';
          const date = new Date(dateString);
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        };

        this.setData({
          formattedDate: formatDate(record.date || record._createTime || record.createTime),
          formattedCreateTime: formatDateTime(record.createTime || record._createTime || record.date)
        });
      }
    }
  },

  methods: {
    // 格式化日期
    formatDate: function(dateString) {
      if (!dateString) return '暂无日期';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },

    // 格式化时间
    formatDateTime: function(dateString) {
      if (!dateString) return '暂无时间记录';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },

    // 预览图片（放大查看）
    previewImage: function() {
      const { record } = this.data;
      if (record.imageUrl) {
        // 直接使用云存储fileID预览,微信会自动处理
        wx.previewImage({
          urls: [record.imageUrl],
          current: record.imageUrl
        });
      }
    },

    // 关闭弹窗
    onClose: function() {
      this.triggerEvent('close');
    }
  }
});
