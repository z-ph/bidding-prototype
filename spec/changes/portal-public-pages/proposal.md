# Proposal: 实现门户公共页面（新闻公告 / 帮助中心 / 下载中心）

## Change ID

`portal-public-pages`

## Why

线上评审 `page-reviews-20260714-1422.zip` 指出门户顶部导航菜单不可用。上一次修复将 新闻公告/帮助中心/下载中心 简单接为 `message.info('建设中')`，但用户明确反馈这是高保真原型，占位提示不可接受，必须实现真实页面。

## What Changes

1. **新增三个公共页面视图**（无需登录即可访问）：
   - `src/views/News.jsx` — 新闻公告列表（标题、日期、分类标签、分页）
   - `src/views/Help.jsx` — 帮助中心（FAQ 分类折叠面板、新手引导、联系支持）
   - `src/views/Downloads.jsx` — 下载中心（文件列表：CA 驱动、投标工具、操作手册等，含下载按钮）
   每个页面使用与门户一致的顶部导航，提供返回首页入口。
2. **路由注册**：在 `src/router/index.jsx` 添加 `/news`、`/help`、`/downloads` 三个顶层公共路由。
3. **Portal 导航接线**：`src/views/Portal.jsx` header 的 新闻公告/帮助中心/下载中心 按钮改为 `navigate('/news')` 等真实路由。
4. **快速入口同步更新**：Portal 首页「下载中心」「帮助中心」卡片跳转到对应页面；「供应商注册」改为 `/register`（不再统一跳登录）。
5. 不改动 `RequireAuth` 的登录限制；这三个页面加入 `publicPaths` 白名单（或保持顶层非 `/admin` 路由不经过 `RequireAuth` 的现状）。

## Impact

- **新增文件**：`src/views/News.jsx`、`src/views/Help.jsx`、`src/views/Downloads.jsx`
- **修改文件**：`src/router/index.jsx`、`src/views/Portal.jsx`
- **行为**：门户顶部所有菜单均可进入真实页面，原型保真度提升
- **无破坏性变更**

## 验证

- 本地 dev 冒烟（Playwright）：
  - 点击 header「新闻公告」→ URL 包含 `/#/news`，页面出现公告列表
  - 点击 header「帮助中心」→ URL 包含 `/#/help`，页面出现 FAQ/帮助内容
  - 点击 header「下载中心」→ URL 包含 `/#/downloads`，页面出现文件下载列表
  - 三个页面都能通过页面内导航返回首页
  - Portal 快速入口卡片链接目标正确
- 构建部署后线上冒烟同上
