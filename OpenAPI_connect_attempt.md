网站 OpenAPI 对接已按计划落地，主要变更如下。

配置与 HTTP
app.js：apiBaseUrl / baseUrl 默认 https://carbontrackapp.com，增加 useWebsiteApi；同步维护 token 与登出清理。
utils/api.js：统一走 apiBaseUrl；200/201/204 为成功；X-Client: miniprogram；登录相关路径上的 401 不清 token；错误信息兼容 message/error；支持 silent、skipAuth（预留）。
认证
utils/auth.js：邮箱登录/注册写 token + userInfo；登出调用 POST /api/v1/auth/logout 并清本地；有 token 时用 GET /api/v1/users/me 校验；register 支持对象载荷或旧的多参数形式。
业务适配层（核心）
utils/cloud-api.js：主流程全部走 /api/v1，并保持原页面期望的 { success, data, records, stats, … } 形状。
仍走云函数的：get-announcements、get-faq、get-activities / join-activity、wx-login；成就接口失败时回退 get-achievements 云函数。
Turnstile 使用占位 miniprogram（与后端约定一致后可改常量 CF_TURNSTILE_MINIPROGRAM）。
页面与流程
注册 pages/register/register.js：真实调用注册 API；密码不少于 8 位；按学校选择传 school_id 或 new_school_name。
记录 pages/calculate/calculate.js：活动列表仅来自 GET /api/v1/carbon-activities；图片走 POST /api/v1/files/upload；提交走 carbon-records（有图）或 carbon-track/record（无图）；去掉云安全检测链路。
成就 pages/achievements/achievements.js：getAchievements()（badges + me/badges）。
消息 pages/messages/messages.js：GET /api/v1/messages、mark-all-read；修复 viewMessage 越界。
个人中心未读数 pages/center/center.js：unread-count。
排行榜 pages/rank/rank.js：users/me/stats 的 leaderboards；好友榜提示「暂未开放」；校内榜无数据时 NO_SCHOOL；修正 limit 未定义。
商城 pages/store/store.js：避免把中文分类名直接当作 API category slug，改为先拉列表再本地筛。
资料 pages/profile/profile.js：头像上传走网站 files/upload；保存学校走 PUT /users/me/profile（school_id / new_school_name）。
缺口与说明
首页公告、帮助 FAQ、挑战活动、微信一键登录、激励弹窗逻辑仍按计划在云或降级策略上保留/弱化（checkIncentiveBonus 仅尝试 badges/auto-trigger，不再弹连续打卡文案）。
自定义头像仅本地展示 URL；网站资料接口以 avatar_id 为主，若需与网站完全一致，可后续接 GET /api/v1/avatars 选型再提交 avatar_id。
请在微信公众平台把 request 合法域名 配好 carbontrackapp.com，真机联调 JWT 登录与文件上传域名。若注册接口仍强制校验 Turnstile，请让后端识别 X-Client: miniprogram 或接受当前占位字段。