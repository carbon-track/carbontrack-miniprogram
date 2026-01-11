/**
 * 性能优化工具
 * 提供防抖、节流、缓存等性能优化函数
 */

/**
 * 防抖函数
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param {Function} fn - 需要节流的函数
 * @param {number} interval - 间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
const throttle = (fn, interval = 300) => {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};

/**
 * 缓存管理器
 * 支持内存缓存和本地存储缓存
 */
class CacheManager {
  constructor() {
    // 内存缓存
    this.memoryCache = new Map();
    // 本地缓存前缀
    this.storagePrefix = '_cache_';
    // 默认缓存时间（毫秒）
    this.defaultExpire = 5 * 60 * 1000; // 5分钟
  }

  /**
   * 生成缓存key
   * @param {string} key - 原始key
   * @returns {string} 完整key
   */
  _getFullKey(key) {
    return `${this.storagePrefix}${key}`;
  }

  /**
   * 从内存获取缓存
   * @param {string} key - 缓存key
   * @returns {any|null} 缓存值或null
   */
  _getFromMemory(key) {
    const cache = this.memoryCache.get(key);
    if (!cache) return null;

    // 检查是否过期
    if (cache.expire && Date.now() > cache.expire) {
      this.memoryCache.delete(key);
      return null;
    }

    return cache.value;
  }

  /**
   * 从本地存储获取缓存
   * @param {string} key - 缓存key
   * @returns {any|null} 缓存值或null
   */
  _getFromStorage(key) {
    try {
      const fullKey = this._getFullKey(key);
      const cacheStr = wx.getStorageSync(fullKey);
      if (!cacheStr) return null;

      const cache = JSON.parse(cacheStr);

      // 检查是否过期
      if (cache.expire && Date.now() > cache.expire) {
        wx.removeStorageSync(fullKey);
        return null;
      }

      return cache.value;
    } catch (error) {
      console.error('读取本地缓存失败:', error);
      return null;
    }
  }

  /**
   * 设置内存缓存
   * @param {string} key - 缓存key
   * @param {any} value - 缓存值
   * @param {number} expire - 过期时间（毫秒）
   */
  _setMemoryCache(key, value, expire) {
    this.memoryCache.set(key, {
      value,
      expire: expire ? Date.now() + expire : null
    });
  }

  /**
   * 设置本地存储缓存
   * @param {string} key - 缓存key
   * @param {any} value - 缓存值
   * @param {number} expire - 过期时间（毫秒）
   */
  _setStorageCache(key, value, expire) {
    try {
      const fullKey = this._getFullKey(key);
      const cache = {
        value,
        expire: expire ? Date.now() + expire : null
      };
      wx.setStorageSync(fullKey, JSON.stringify(cache));
    } catch (error) {
      console.error('设置本地缓存失败:', error);
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存key
   * @param {object} options - 选项 { type: 'memory' | 'storage' | 'all', forceStorage: boolean }
   * @returns {any|null} 缓存值或null
   */
  get(key, options = {}) {
    const { type = 'all', forceStorage = false } = options;

    // 优先从内存获取
    if (!forceStorage && (type === 'memory' || type === 'all')) {
      const memoryValue = this._getFromMemory(key);
      if (memoryValue !== null) return memoryValue;
    }

    // 从本地存储获取
    if (type === 'storage' || type === 'all') {
      const storageValue = this._getFromStorage(key);
      if (storageValue !== null) return storageValue;
    }

    return null;
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存key
   * @param {any} value - 缓存值
   * @param {object} options - 选项 { type: 'memory' | 'storage' | 'all', expire: number }
   */
  set(key, value, options = {}) {
    const { type = 'all', expire = this.defaultExpire } = options;

    // 设置内存缓存
    if (type === 'memory' || type === 'all') {
      this._setMemoryCache(key, value, expire);
    }

    // 设置本地存储缓存
    if (type === 'storage' || type === 'all') {
      this._setStorageCache(key, value, expire);
    }
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存key
   * @param {object} options - 选项 { type: 'memory' | 'storage' | 'all' }
   */
  remove(key, options = {}) {
    const { type = 'all' } = options;

    // 删除内存缓存
    if (type === 'memory' || type === 'all') {
      this.memoryCache.delete(key);
    }

    // 删除本地存储缓存
    if (type === 'storage' || type === 'all') {
      try {
        const fullKey = this._getFullKey(key);
        wx.removeStorageSync(fullKey);
      } catch (error) {
        console.error('删除本地缓存失败:', error);
      }
    }
  }

  /**
   * 清空所有缓存
   * @param {string} type - 'memory' | 'storage' | 'all'
   */
  clear(type = 'all') {
    if (type === 'memory' || type === 'all') {
      this.memoryCache.clear();
    }

    if (type === 'storage' || type === 'all') {
      try {
        const res = wx.getStorageInfoSync();
        const keys = res.keys.filter(key => key.startsWith(this.storagePrefix));
        keys.forEach(key => wx.removeStorageSync(key));
      } catch (error) {
        console.error('清空本地缓存失败:', error);
      }
    }
  }
}

// 创建单例
const cacheManager = new CacheManager();

/**
 * 请求去重管理器
 * 防止相同的请求重复发送
 */
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  /**
   * 发送请求（带去重）
   * @param {string} key - 请求唯一标识
   * @param {Function} requestFn - 请求函数
   * @returns {Promise} 请求Promise
   */
  async request(key, requestFn) {
    // 检查是否有相同的请求正在进行
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // 创建新的请求Promise
    const promise = requestFn().finally(() => {
      // 请求完成后删除
      this.pendingRequests.delete(key);
    });

    // 保存请求Promise
    this.pendingRequests.set(key, promise);

    return promise;
  }

  /**
   * 取消所有待处理的请求
   */
  cancelAll() {
    this.pendingRequests.clear();
  }
}

// 创建单例
const requestDeduplicator = new RequestDeduplicator();

/**
 * 带缓存的请求函数
 * @param {string} key - 缓存key
 * @param {Function} requestFn - 请求函数
 * @param {object} options - 选项 { expire: number, type: string, forceRefresh: boolean }
 * @returns {Promise} 请求结果
 */
const cachedRequest = async (key, requestFn, options = {}) => {
  const { expire = 5 * 60 * 1000, type = 'all', forceRefresh = false } = options;

  // 强制刷新时不使用缓存
  if (!forceRefresh) {
    // 尝试从缓存获取
    const cachedValue = cacheManager.get(key, { type });
    if (cachedValue !== null) {
      return cachedValue;
    }
  }

  // 发送请求（带去重）
  const result = await requestDeduplicator.request(key, requestFn);

  // 缓存结果
  cacheManager.set(key, result, { expire, type });

  return result;
};

/**
 * 优化setData调用
 * 将多次setData合并为一次
 */
class SetDataOptimizer {
  constructor(context) {
    this.context = context;
    this.pendingData = {};
    this.timer = null;
    this.delay = 10; // 10ms内的更新会合并
  }

  /**
   * 添加数据更新
   * @param {object} data - 要更新的数据
   */
  setData(data) {
    // 合并待更新的数据
    Object.assign(this.pendingData, data);

    // 清除之前的定时器
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // 设置新的定时器
    this.timer = setTimeout(() => {
      // 执行setData
      this.context.setData(this.pendingData);
      // 清空待更新数据
      this.pendingData = {};
    }, this.delay);
  }

  /**
   * 立即执行待更新的setData
   */
  flush() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (Object.keys(this.pendingData).length > 0) {
      this.context.setData(this.pendingData);
      this.pendingData = {};
    }
  }
}

/**
 * 创建setData优化器
 * @param {object} context - 页面或组件上下文（this）
 * @returns {SetDataOptimizer} setData优化器实例
 */
const createSetDataOptimizer = (context) => {
  return new SetDataOptimizer(context);
};

module.exports = {
  debounce,
  throttle,
  cacheManager,
  requestDeduplicator,
  cachedRequest,
  createSetDataOptimizer
};
