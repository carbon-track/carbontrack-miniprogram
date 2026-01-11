# 部署 get-rank 云函数

## 方法 1：使用 CloudBase Web UI（推荐）

1. 访问 CloudBase 控制台：https://tcb.cloud.tencent.com/dev
2. 进入 "云函数" 页面
3. 找到 `get-rank` 函数
4. 点击 "更新代码" 或 "部署"
5. 上传 `cloudfunctions/get-rank` 目录

## 方法 2：使用 CloudBase CLI

```bash
# 安装 CloudBase CLI（如果尚未安装）
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署云函数
cd d:/programming/trae/carbontrack/carbon-track-miniapp
cloudbase functions:deploy get-rank
```

## 方法 3：使用 WeChat DevTools

1. 打开微信开发者工具
2. 点击 "云开发" 面板
3. 选择 "云函数"
4. 右键点击 `get-rank` 函数
5. 选择 "上传并部署：云端安装依赖"

---

部署完成后，排行榜页面将正常显示用户名和碳减排量数据。
