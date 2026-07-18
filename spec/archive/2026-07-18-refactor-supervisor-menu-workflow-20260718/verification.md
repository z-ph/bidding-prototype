# Verification: 监督人员交互范式重构

验证日期：2026-07-18
验证人：父 agent（红线审查）
方式：`pnpm run build` + Playwright 跨 5 角色真实工作流实测（`scripts/verify-supervisor-redline.mjs`，trace：`review-assets/supervisor-redline-trace.zip`）；实施方另有 `scripts/verify-supervisor-hall.mjs` 13 项页面级冒烟

## 实测方式说明

全链路数据准备（全部真实操作落库）：**招标人创建项目 → 代理对项目 1 抽取并确认专家名单 → 投标人对项目 1 保存报价 → 专家确认参加并完成评分**。监督侧验证全部读取这些真实 store 数据。

## 逐任务验收

| 任务 | 结果 | 证据 |
|------|------|------|
| supervisor-store | 通过 | `src/data/supervisorStore.js`（62 行）：getRecords/addRecord/seedIfEmpty，风格与 expertStore 一致；实测大厅登记与登记页同 store 互通 |
| supervisor-hall-projectized | 通过 | 无 projectId 实测：场次列表含招标人刚创建的真实项目、无演示假数据（园区安防等）；点「进入监督」携带 projectId；新项目三个数据区 Empty（不回退假数据）；项目 1 视图：唱标读 quoteStore（A科技 128 万）、委员会读 expertStore（专家甲）、评分汇总读 evaluationStore；硬编码 mock 数组零残留 |
| abnormal-store-migration | 通过 | 大厅登记记录异常登记页可见；**刷新后持久化**；种子记录仅首次写入 |
| dashboard-supervisor-stats | 通过 | 工作台（需从监督大厅点入，supervisor 默认落地监督大厅）三项计数真实渲染 |
| doc-ledger-version | 通过 | matrix 2.5 节已实施（含 ProjectTrack 权限拦截说明）；台账 0718-ux-007；changelog 0.7.0；package.json 0.7.0 |
| build-verify | 通过 | build ✓（378ms）；实测 **26/26 通过**，控制台零错误 |

## 红线逐条核对

1. 无空壳工作台 —— 通过（监督概览真实计数）
2. 无职责重叠入口 —— 通过（监督大厅为唯一监督入口，异常登记/日志职责分明）
3. 阶段页面强制 projectId —— 通过（监督视图项目化：无参为真实场次列表，有参为项目视图；矩阵 2.5 目标达成）
4. 菜单按业务域聚合 —— 通过（8 项，本就精简未动）
5. 已砍功能不在主导航 —— 通过
6. 共享文件非 append-only —— 通过（SupervisorHall 整体重写去 mock，非叠加）
7. 菜单从工作流正向推导 —— 通过（场次列表 → 项目监督 → 异常登记 → 台账备查）

## CRUD 闭环实测

监督大厅对项目 1 记录异常 → `bidding-supervisor-records` 写入（projectId=1, source=hall, status=待处理）→ 异常登记页可见 → **刷新后仍在**。

## 范围外确认（提案已声明，实测验证）

- `/admin/projects/track` 权限仅 tenderee/agent，supervisor URL 直达由 Forbidden 拦截，bidderNodes fallback 无实际暴露面，本期不修（已记录在 matrix 2.5 节）。
- SupervisorLogs 操作日志数据源真实化（需全局埋点）留待独立提案。
- 开标签到无真实数据源，监督视图按口径显示 Empty；开标签到落库后可直接接入。

## 结论

6 个任务全部完成，26/26 实测通过，同意归档。
