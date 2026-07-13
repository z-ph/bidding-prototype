# 招投标原型 / Bidding Prototype

> 一个基于 Vue 3 + Vite 的招投标系统前端原型，包含门户、后台管理、开标大厅与页面评审能力。
>
> A Vue 3 + Vite frontend prototype for a bidding/tendering system, including portal, admin, bidding hall, and page review capabilities.

## 在线预览 / Live Preview

- GitHub Pages: https://z-ph.github.io/bidding-prototype/

## 技术栈 / Tech Stack

- Vue 3（`<script setup>`）
- Vue Router
- Vite
- Element Plus
- [vue-page-review](https://github.com/z-ph/vue-page-review)（页面评审组件）
- [driver.js](https://driverjs.com/)（新手引导）

## 快速开始 / Quick Start

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 构建生产包
pnpm build

# 部署到 GitHub Pages
pnpm deploy
```

## 项目结构 / Project Structure

```
src/
  views/        # 页面视图（门户、后台、开标大厅等）
  components/   # 业务组件
  composables/  # 组合式函数
  router/       # 路由配置
  config/       # 角色与菜单配置
  utils/        # 工具函数
```

## 主要功能 / Features

- **门户 / Portal**：招标公告、采购信息、项目信息展示与筛选
- **后台管理 / Admin**： tendering/project/supplier/bid management
- **开标大厅 / Bidding Hall**：实时开标流程与主持人视角
- **页面评审 / Page Review**：基于 `vue-page-review` 的页面标注与反馈收集，支持元素选择、框选视图、截图、Markdown/JSON/ZIP 导出
- **新手引导 / Onboarding**：driver.js 驱动的分步引导

## 角色 / Roles

当前原型覆盖以下角色入口：

- 门户访客 / Portal Visitor
- 采购人 / Purchaser
- 供应商 / Supplier
- 后台管理员 / Admin
- 主持人 / Host（开标大厅）

## 测试 / Tests

核心模块与 ZIP 导出已提供端到端 Playwright 脚本：

```bash
NODE_PATH=/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules node test-page-review-core.cjs
NODE_PATH=/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules node test-zip-export.cjs
```

完整人工验收清单见 [`page-review-acceptance-tests.md`](./page-review-acceptance-tests.md)。

## License

MIT
