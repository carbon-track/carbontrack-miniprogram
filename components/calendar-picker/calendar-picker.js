// components/calendar-picker/calendar-picker.js
Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    value: {
      type: String,
      value: ''
    },
    maxDate: {
      type: String,
      value: '' // 最大可选日期，空字符串表示今天
    },
    recordDates: {
      type: Array,
      value: [] // 有记录的日期数组，格式: ['2025-01-10', '2025-01-11']
    }
  },

  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    selectedDate: null
  },

  observers: {
    'visible': function(visible) {
      if (visible) {
        this.initCalendar();
      }
    },
    'value': function(value) {
      if (value) {
        this.setData({ selectedDate: value });
        const date = new Date(value);
        this.setData({
          currentYear: date.getFullYear(),
          currentMonth: date.getMonth() + 1
        });
      }
    }
  },

  methods: {
    initCalendar: function() {
      this.generateCalendarDays();
    },

    generateCalendarDays: function() {
      const { currentYear, currentMonth } = this.data;
      const days = [];

      // 获取当月第一天是星期几
      const firstDay = new Date(currentYear, currentMonth - 1, 1);
      const firstDayOfWeek = firstDay.getDay();

      // 获取当月有多少天
      const lastDay = new Date(currentYear, currentMonth, 0);
      const totalDays = lastDay.getDate();

      // 今天的日期
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 最大可选日期
      let maxDateObj = null;
      if (this.data.maxDate) {
        maxDateObj = new Date(this.data.maxDate);
        maxDateObj.setHours(0, 0, 0, 0);
      } else {
        maxDateObj = today;
      }

      // 选中的日期
      let selectedDateObj = null;
      if (this.data.selectedDate) {
        selectedDateObj = new Date(this.data.selectedDate);
        selectedDateObj.setHours(0, 0, 0, 0);
      }

      // 填充空白
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ day: '', date: '', disabled: true });
      }

      // 填充日期
      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentYear, currentMonth - 1, day);
        const dateStr = this.formatDate(date);

        // 检查是否是今天
        const isToday = date.getTime() === today.getTime();

        // 检查是否被选中
        const isSelected = selectedDateObj && date.getTime() === selectedDateObj.getTime();

        // 检查是否禁用（未来日期）
        date.setHours(0, 0, 0, 0);
        const isDisabled = date > maxDateObj;

        // 检查是否有记录
        const hasRecord = this.data.recordDates.includes(dateStr);

        days.push({
          day: day,
          date: dateStr,
          disabled: isDisabled,
          today: isToday,
          selected: isSelected,
          hasRecord: hasRecord
        });
      }

      this.setData({ calendarDays: days });
    },

    formatDate: function(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    prevMonth: function() {
      const { currentYear, currentMonth } = this.data;
      if (currentMonth === 1) {
        this.setData({
          currentYear: currentYear - 1,
          currentMonth: 12
        });
      } else {
        this.setData({
          currentMonth: currentMonth - 1
        });
      }
      this.generateCalendarDays();
    },

    nextMonth: function() {
      const { currentYear, currentMonth } = this.data;

      // 检查是否超过今天
      const today = new Date();
      let maxDateObj = null;
      if (this.data.maxDate) {
        maxDateObj = new Date(this.data.maxDate);
      } else {
        maxDateObj = today;
      }

      const nextMonthDate = new Date(currentYear, currentMonth, 1);
      maxDateObj.setHours(0, 0, 0, 0);
      nextMonthDate.setHours(0, 0, 0, 0);

      if (nextMonthDate > maxDateObj) {
        return; // 不能切换到未来月份
      }

      if (currentMonth === 12) {
        this.setData({
          currentYear: currentYear + 1,
          currentMonth: 1
        });
      } else {
        this.setData({
          currentMonth: currentMonth + 1
        });
      }
      this.generateCalendarDays();
    },

    onSelectDate: function(e) {
      const { date, disabled } = e.currentTarget.dataset;
      if (disabled) {
        return;
      }

      const calendarDays = this.data.calendarDays.map(day => ({
        ...day,
        selected: day.date === date
      }));

      this.setData({
        selectedDate: date,
        calendarDays
      });
    },

    onConfirm: function() {
      if (this.data.selectedDate) {
        this.triggerEvent('change', { value: this.data.selectedDate });
        this.onClose();
      } else {
        wx.showToast({
          title: '请选择日期',
          icon: 'none'
        });
      }
    },

    onClose: function() {
      this.triggerEvent('close');
    }
  }
});
