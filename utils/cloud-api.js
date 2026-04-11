/**
 * 业务 API：默认走网站 OpenAPI（/api/v1），缺口能力保留云函数。
 */

const { get, post, put, upload } = require('./api.js')

/** 后端对小程序放宽 Turnstile 时使用的占位（与后端约定一致后可改） */
const CF_TURNSTILE_MINIPROGRAM = 'miniprogram'

const callCloudFunction = async (name, data = {}) => {
  try {
    const response = await wx.cloud.callFunction({ name, data })
    return response.result
  } catch (error) {
    console.error(`云函数调用失败 [${name}]:`, error)
    throw error
  }
}

function makeRequestId16() {
  let s = ''
  for (let i = 0; i < 16; i++) {
    s += Math.floor(Math.random() * 16).toString(16)
  }
  return s
}

function mapUser(u) {
  if (!u || typeof u !== 'object') return null
  return {
    _id: u.uuid || String(u.id != null ? u.id : ''),
    id: u.id,
    uuid: u.uuid,
    username: u.username,
    email: u.email,
    nickName: u.username || u.nickName,
    points: u.points,
    totalCarbon: u.total_carbon_saved,
    school: u.school_name,
    schoolName: u.school_name,
    schoolId: u.school_id,
    avatarUrl: u.avatar_url,
    avatar_id: u.avatar_id,
    isAdmin: u.is_admin,
    level: 1
  }
}

function normalizeCarbonActivity(a) {
  if (!a || typeof a !== 'object') return null
  const name = a.name_zh || a.combined_name || a.name_en || '活动'
  return {
    _id: a.id,
    id: a.id,
    name,
    unit: a.unit || '',
    emoji: '🌱',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    carbonFactor: Number(a.carbon_factor) || 0,
    pointsFactor: 10,
    description: a.description_zh || a.description_en || '',
    category: a.category || ''
  }
}

function extractCarbonActivitiesPayload(raw) {
  if (!raw) return []
  if (Array.isArray(raw.activities)) return raw.activities.filter((x) => x && x.id)
  if (raw.data && Array.isArray(raw.data.activities)) return raw.data.activities.filter((x) => x && x.id)
  if (Array.isArray(raw.data)) return raw.data.filter((x) => x && x.id)
  return []
}

// --- 认证（网站）---

const emailLogin = async (email, password) => {
  try {
    const raw = await post('/api/v1/auth/login', { email, password }, { silent: true })
    if (raw && raw.data && raw.data.token) {
      wx.setStorageSync('token', raw.data.token)
      const userInfo = mapUser(raw.data.user)
      return { success: true, userInfo, message: raw.message || '登录成功' }
    }
    return { success: false, message: raw?.message || '登录失败' }
  } catch (e) {
    return { success: false, message: e.message || '登录失败' }
  }
}

/**
 * @param {object} payload
 */
const registerWithPayload = async (payload) => {
  const {
    email,
    username,
    password,
    confirmPassword,
    schoolId,
    newSchoolName,
    countryCode = 'CN',
    stateCode = 'BJ'
  } = payload

  const body = {
    username,
    email,
    password,
    confirm_password: confirmPassword || password,
    cf_turnstile_response: CF_TURNSTILE_MINIPROGRAM,
    country_code: countryCode,
    state_code: stateCode
  }
  if (schoolId != null && schoolId !== '') {
    const n = parseInt(String(schoolId), 10)
    if (!isNaN(n)) body.school_id = n
  }
  if (newSchoolName) body.new_school_name = newSchoolName

  try {
    const raw = await post('/api/v1/auth/register', body, { silent: true })
    if (raw && raw.data && raw.data.token) {
      wx.setStorageSync('token', raw.data.token)
      const userInfo = mapUser(raw.data.user)
      return { success: true, userInfo, message: raw.message || '注册成功' }
    }
    return { success: false, message: raw?.message || '注册失败' }
  } catch (e) {
    return { success: false, message: e.message || '注册失败' }
  }
}

/** 支持 register(payload) 或 register(email, username, password, verificationCode) */
const register = async (emailOrPayload, username, password, verificationCode) => {
  if (emailOrPayload && typeof emailOrPayload === 'object') {
    return registerWithPayload(emailOrPayload)
  }
  return registerWithPayload({
    email: emailOrPayload,
    username,
    password,
    confirmPassword: password,
    verificationCode
  })
}

const wxLogin = async (userInfo = {}, code = '') => {
  return await callCloudFunction('wx-login', { userInfo, code })
}

function unwrapUser(raw) {
  if (!raw) return null
  if (raw.username || raw.email) return raw
  if (raw.data && (raw.data.username || raw.data.email)) return raw.data
  return null
}

const getUserInfo = async () => {
  const raw = await get('/api/v1/users/me', {}, { silent: true })
  const u = unwrapUser(raw)
  return { success: !!u, userInfo: mapUser(u) }
}

const verifyUser = async () => {
  try {
    const raw = await get('/api/v1/users/me', {}, { silent: true })
    const u = unwrapUser(raw)
    if (!u) return { success: false, isValid: false }
    return { success: true, isValid: true, userInfo: mapUser(u) }
  } catch (e) {
    return { success: false, isValid: false }
  }
}

// --- 碳足迹 ---

const calculateCarbonPreview = async (activityId, amount, unit) => {
  const body = { activity_id: activityId, amount: Number(amount) }
  if (unit) body.unit = unit
  const raw = await post('/api/v1/carbon-track/calculate', body, { silent: true })
  const c = raw.carbon_saved != null ? raw : raw?.data || raw
  return {
    carbon_saved: c.carbon_saved,
    points_earned: c.points_earned,
    unit: c.unit
  }
}

const saveCarbonRecord = async (data) => {
  const activityId = data.activity_id || data.activityId || (data.selectedActivity && data.selectedActivity.id)
  if (!activityId) {
    return { success: false, message: '缺少活动 ID' }
  }

  const images = []
  if (data.imageUrl && String(data.imageUrl).startsWith('http')) {
    images.push({ url: data.imageUrl })
  }

  const body = {
    activity_id: String(activityId),
    amount: Number(data.amount),
    date: data.date,
    description: data.description || null,
    unit: data.unit || undefined,
    images
  }

  const headers = { 'X-Request-ID': makeRequestId16() }
  const path =
    images.length > 0 ? '/api/v1/carbon-records' : '/api/v1/carbon-track/record'

  let raw
  try {
    raw = await post(path, body, { headers, silent: true })
  } catch (e) {
    return { success: false, message: e.message || '提交失败' }
  }

  const calc = raw.calculation || raw.data || {}
  const carbon = calc.carbon_saved ?? raw.carbon_saved ?? data.carbonValue
  const points = calc.points_earned ?? raw.points_earned ?? data.points

  return {
    success: raw.success !== false,
    message: raw.message,
    totalCarbon: carbon,
    points
  }
}

const getCarbonRecords = async (params = {}) => {
  const page = params.page || 1
  let limit = params.limit || 20
  if (limit < 10) limit = 10
  if (limit > 50) limit = 50

  const query = { page, limit }
  if (params.status) query.status = params.status

  const raw = await get('/api/v1/carbon-track/transactions', query, { silent: true })
  const list = Array.isArray(raw.data) ? raw.data : []
  const pagination = raw.pagination || {}

  const records = list.map((r) => {
    const name = r.activity_name_zh || r.activity_name_en || '环保活动'
    const emoji = name && name.length >= 2 ? name.slice(0, 2) : '🌱'
    const img = r.images && r.images[0] && (r.images[0].url || r.images[0].public_url)
    return {
      _id: r.id,
      id: r.id,
      activityType: name,
      activityDetail: `${emoji} ${name}`,
      carbonValue: r.carbon_saved,
      points: r.points_earned,
      date: r.date || r.created_at,
      description: r.description,
      imageUrl: img,
      amount: r.amount,
      unit: r.unit,
      createTime: r.created_at,
      status: r.status
    }
  })

  let filtered = records
  if (params.activityType && params.activityType !== 'all') {
    filtered = records.filter((x) => x.activityType === params.activityType)
  }

  const total = pagination.total != null ? pagination.total : filtered.length
  const pages = pagination.pages || 1
  const hasMore = page < pages

  return {
    success: raw.success !== false,
    records: filtered,
    total,
    hasMore,
    message: raw.message
  }
}

const getCarbonRules = async () => {
  const raw = await get('/api/v1/carbon-activities', {}, { silent: true })
  const arr = extractCarbonActivitiesPayload(raw)
  const data = arr.map(normalizeCarbonActivity).filter(Boolean)
  return { success: true, data }
}

// --- 统计与排行 ---

const getUserStats = async () => {
  const raw = await get('/api/v1/users/me/stats', {}, { silent: true })
  const d = raw.data || raw || {}
  const stats = {
    totalCarbon: d.total_carbon_saved,
    totalPoints: d.current_points != null ? d.current_points : d.total_points,
    activityCount: d.total_activities,
    level: 1
  }
  return { success: raw.success !== false, stats, raw }
}

const getRank = async (params = {}) => {
  const type = params.type || 'global'
  if (type === 'friend') {
    return {
      success: true,
      rankList: [],
      userRank: null,
      hasMore: false,
      code: 'FRIEND_UNSUPPORTED',
      message: '好友榜暂未开放'
    }
  }

  const bundle = await getUserStats()
  const raw = bundle.raw || {}
  const d = raw.data || raw || {}
  const lbs = d.leaderboards || {}
  const ctx = type === 'school' ? lbs.school : lbs.global
  const entries = (ctx && ctx.entries) || []

  if (type === 'school' && entries.length === 0) {
    return {
      success: false,
      code: 'NO_SCHOOL',
      message: '请先在个人资料中设置学校信息',
      rankList: [],
      userRank: null,
      hasMore: false
    }
  }

  const page = params.page || 1
  const limit = params.limit || 20
  const start = (page - 1) * limit
  const slice = entries.slice(start, start + limit)

  const rankList = slice.map((e, i) => ({
    _id: String(e.id != null ? e.id : start + i),
    username: e.username || '用户',
    carbonSaved: e.total_points != null ? e.total_points : 0,
    rank: e.rank != null ? e.rank : start + i + 1,
    avatarUrl: e.avatar_url
  }))

  const me = wx.getStorageSync('userInfo') || {}
  const userRank =
    d.rank != null
      ? {
          userId: me._id || me.uuid,
          username: me.username || me.nickName,
          carbonSaved:
            d.total_points != null
              ? d.total_points
              : d.current_points != null
                ? d.current_points
                : 0,
          rank: d.rank
        }
      : null

  return {
    success: true,
    rankList,
    userRank,
    hasMore: start + slice.length < entries.length
  }
}

// --- 用户资料 ---

const updateProfile = async (data) => {
  const body = {}
  if (data.school_id != null && data.school_id !== '') {
    const sid = parseInt(String(data.school_id), 10)
    if (!isNaN(sid)) body.school_id = sid
  }
  if (data.new_school_name) body.new_school_name = data.new_school_name
  if (data.school && !body.school_id && !body.new_school_name) {
    body.new_school_name = data.school
  }
  if (data.avatar_id != null) body.avatar_id = data.avatar_id

  if (Object.keys(body).length === 0) {
    return { success: true, reviewStatus: 'approved', message: '无服务端可同步项' }
  }

  body.cf_turnstile_response = CF_TURNSTILE_MINIPROGRAM

  const raw = await put('/api/v1/users/me/profile', body, { silent: true })
  const u = unwrapUser(raw)
  return { success: true, userInfo: mapUser(u), reviewStatus: 'approved' }
}

// --- 活动挑战（仅云）---

const getActivities = async (status = 'active') => {
  return await callCloudFunction('get-activities', { status })
}

const getAchievements = async () => {
  let badgesRaw = {}
  try {
    badgesRaw = await get('/api/v1/badges', {}, { silent: true })
  } catch (e) {
    return await callCloudFunction('get-achievements')
  }

  let mineRaw = {}
  try {
    mineRaw = await get('/api/v1/users/me/badges', {}, { silent: true })
  } catch (e) {}

  const defs = Array.isArray(badgesRaw.data) ? badgesRaw.data : Array.isArray(badgesRaw) ? badgesRaw : []
  const mineList = Array.isArray(mineRaw.data) ? mineRaw.data : Array.isArray(mineRaw) ? mineRaw : []

  const awardedById = {}
  mineList.forEach((row) => {
    const b = row.badge || row
    const ub = row.user_badge
    const id = b.id != null ? b.id : ub && ub.badge_id
    if (id != null && ub && ub.status === 'awarded') {
      awardedById[id] = ub
    }
  })

  const data = (Array.isArray(defs) ? defs : []).map((b) => {
    const ub = awardedById[b.id]
    return {
      _id: String(b.id),
      name: b.name_zh || b.name_en,
      description: b.description_zh || b.description_en || '',
      points: 0,
      unlocked: !!ub,
      unlockedAt: ub && ub.awarded_at,
      category: 'carbon',
      icon: b.icon_url || b.icon_thumbnail_url || b.icon_path,
      condition: ''
    }
  })

  return { success: true, data }
}

const getTransactions = async (params = {}) => {
  const page = params.page || 1
  const limit = Math.min(50, Math.max(10, params.limit || 20))
  const type = params.type

  let statRes = {}
  try {
    statRes = await get('/api/v1/users/me/stats', {}, { silent: true })
  } catch (e) {}
  const sd = statRes.data || statRes
  const totalPoints = sd.current_points != null ? sd.current_points : 0

  const income = []
  const expense = []

  if (!type || type === 'income' || type === 'all') {
    try {
      const ph = await get('/api/v1/users/me/points-history', { page, limit }, { silent: true })
      const recs = ph.records || (ph.data && ph.data.records) || []
      recs.forEach((r) => {
        income.push({
          _id: r.id,
          type: 'income',
          amount: r.points_awarded || 0,
          title: '碳足迹积分',
          description: r.status || '',
          createTime: r.created_at,
          date: r.created_at
        })
      })
    } catch (e) {}
  }

  if (!type || type === 'expense' || type === 'all') {
    try {
      const ex = await get('/api/v1/exchange/transactions', { page, limit }, { silent: true })
      const rows = Array.isArray(ex.data) ? ex.data : []
      rows.forEach((r) => {
        expense.push({
          _id: r.id,
          type: 'expense',
          amount: r.points_used || 0,
          title: r.product_name || '积分兑换',
          description: r.status || '',
          createTime: r.created_at
        })
      })
    } catch (e) {}
  }

  let transactions = []
  if (type === 'income') transactions = income
  else if (type === 'expense') transactions = expense
  else {
    transactions = [...income, ...expense].sort(
      (a, b) => new Date(b.createTime) - new Date(a.createTime)
    )
  }

  return { success: true, transactions, totalPoints, hasMore: false }
}

const getAnnouncements = async () => {
  return await callCloudFunction('get-announcements')
}

const getSchools = async () => {
  const raw = await get('/api/v1/schools', { page: 1, limit: 200 }, { silent: true })
  const schools = (raw.data && raw.data.schools) || raw.schools || []
  const data = schools.map((s) => ({
    _id: s.id,
    id: s.id,
    name: s.name
  }))
  return { success: true, data }
}

const getFaq = async () => {
  return await callCloudFunction('get-faq')
}

const getBalance = async () => {
  const r = await getUserStats()
  const pts = r.stats && r.stats.totalPoints
  return { success: true, data: { points: pts } }
}

const getProducts = async (params = {}) => {
  const query = {
    page: params.page || 1,
    limit: params.limit || 50
  }
  if (params.category && params.category !== 'all') query.category = params.category
  const raw = await get('/api/v1/products', query, { silent: true })
  const pack = raw.data || raw
  const products = pack.products || []
  const data = products.map((p) => ({
    _id: p.id,
    id: p.id,
    name: p.name,
    description: p.description || '',
    points: p.points_required != null ? p.points_required : p.price,
    category: p.category_slug || p.category || 'product',
    stock: p.stock,
    emoji: '🎁',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    exchangeCount: 0,
    image_url: p.image_url
  }))
  return { success: true, data }
}

const createExchangeOrder = async (data) => {
  const productId = data.productId != null ? data.productId : data.product_id
  const raw = await post(
    '/api/v1/exchange',
    {
      product_id: parseInt(String(productId), 10),
      quantity: data.quantity || 1,
      notes: data.notes,
      delivery_address: data.delivery_address
    },
    { silent: true }
  )
  const ok = raw.success !== false && (raw.exchange_id != null || raw.success === true || raw.remaining_points != null)
  return {
    success: ok,
    message: raw.message,
    data: raw
  }
}

const checkIncentiveBonus = async () => {
  try {
    await post('/api/v1/badges/auto-trigger', {}, { silent: true })
  } catch (e) {}
  return { success: false, data: null }
}

const getMessageUnreadCount = async () => {
  try {
    const raw = await get('/api/v1/messages/unread-count', {}, { silent: true })
    const n = raw.data != null ? raw.data : raw
    const count = typeof n === 'object' && n != null ? n.count || n.unread || 0 : n || 0
    return typeof count === 'number' ? count : 0
  } catch (e) {
    return 0
  }
}

const getMessages = async (params = {}) => {
  const query = {
    page: params.page || 1,
    limit: Math.min(50, Math.max(10, params.limit || 20))
  }
  const raw = await get('/api/v1/messages', query, { silent: true })
  const data = raw.data || []
  return { success: raw.success !== false, data, pagination: raw.pagination }
}

const markAllMessagesRead = async () => {
  return await put('/api/v1/messages/mark-all-read', {}, { silent: true })
}

/** 上传碳记录凭证图，返回可访问 URL */
const uploadCarbonFile = (filePath) => {
  return upload('/api/v1/files/upload', filePath, 'file', {})
}

module.exports = {
  callCloudFunction,
  emailLogin,
  wxLogin,
  register,
  getUserInfo,
  saveCarbonRecord,
  getCarbonRecords,
  getRank,
  updateProfile,
  getUserStats,
  verifyUser,
  getActivities,
  getAchievements,
  getTransactions,
  getAnnouncements,
  getSchools,
  getFaq,
  getBalance,
  getProducts,
  createExchangeOrder,
  getCarbonRules,
  checkIncentiveBonus,
  calculateCarbonPreview,
  uploadCarbonFile,
  getMessageUnreadCount,
  getMessages,
  markAllMessagesRead
}
