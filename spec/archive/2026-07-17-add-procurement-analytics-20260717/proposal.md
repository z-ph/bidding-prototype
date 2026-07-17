# Proposal: 新增采购数据分析模块（价格趋势/比价/风险预警）

## Change ID

`add-procurement-analytics-20260717`

## Why

2026-07-17 飞书云文档会议概要八确认新增**采购数据分析模块**：

- **价格趋势**：按时间、供应商、材料维度筛选，展示价格变化及材料报价比价；
- **预警规则**：自动识别法人相同、存在上下级关系、报价异常高等风险情形；
- **数据来源**：信息由 e签宝提供，我方通过甲方提供的接口调用，原型阶段使用 mock 数据。

当前原型无此模块（`src/views/` 下无任何 analytics 相关页面），需从零搭建。

## What Changes

1. **数据分析看板**（`/admin/analytics`）：价格趋势图 + 时间/供应商/材料三维筛选，图表随筛选联动。
2. **材料报价比价视图**：同一材料对比多家供应商历史报价，展示价差。
3. **风险预警**：预警规则引擎 mock，法人相同/上下级关系/报价异常高三类规则各自可配开关；预警列表展示命中规则、涉及供应商/项目、时间。
4. **数据层**：新增 `src/data/analyticsStore.js`（mock + localStorage，参照 `objectionStore.js` 既有约定）；新增 `src/utils/eqianbaoAnalyticsApi.js` 作为 e签宝接口预留占位（页面不直接调用）。
5. **菜单接入**：`Layout.jsx` 增加「采购数据分析」入口，可见角色暂定招标人/代理机构/管理员，**待甲方确认**。

## Impact

- **新增文件**：`src/views/AnalyticsDashboard.jsx`、`src/views/AnalyticsPriceCompare.jsx`、`src/views/AnalyticsRiskWarning.jsx`、`src/data/analyticsStore.js`、`src/utils/eqianbaoAnalyticsApi.js`，及对应路由文件 `src/routes/admin.analytics.jsx` / `.lazy.jsx`。
- **共享文件**（由基础设施 agent 统一接线）：`src/components/Layout.jsx`（菜单）、`src/config/permissions.js`（角色可见性）、自动生成的 `routeTree.gen.ts` 不手动修改。
- **技术约束**：React 18 + AntD 5 原型；mock 数据优先（`src/data/` + localStorage store 模式，参照既有约定）；e签宝等外部接口只做预留，不做真实调用；页面组件放 `src/views/`、路由文件只放元数据（见 AGENTS.md 路由约定），实施时由基础设施 agent 统一接线共享文件。
- **角色**：入口可见角色暂定 tenderee / agent / admin，需在代码中标注「待甲方确认」。

## Out of Scope

- e签宝接口的真实对接与联调（接口文档由甲方提供后再定）。
- 预警规则的复杂阈值配置（如异常高报价的具体百分比阈值算法），原型仅做开关与 mock 命中。
- 数据分析结果的 Excel 导出（清单 65 覆盖所有模块，列入后续统一处理）。

## 依赖

- 依据 2026-07-17 飞书云文档（会议概要八 / 需求确认清单），整理稿 `docs/20260717-需求确认整理.md`（§1.14）。
- e签宝接口由甲方提供，原型阶段以 mock 替代。

## 状态（2026-07-17 实施完成）

- 总体状态：已完成
- 任务统计：5 任务 — 5 已修复 / 0 部分修复 / 0 未修复 / 0 待确认 / 0 未跟踪
- 依据：实施+playwright 验证通过；验证报告 docs/verification-20260717-report.md
