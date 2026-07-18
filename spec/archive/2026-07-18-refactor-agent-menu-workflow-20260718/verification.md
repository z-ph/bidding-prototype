# Verification: 招标代理交互范式重构

验证日期：2026-07-18
验证人：父 agent（红线审查）
方式：`pnpm run build` + Playwright 真实工作流实测（`scripts/verify-agent-redline.mjs`，trace：`review-assets/agent-redline-trace.zip`）；守卫专项实测（`scripts/verify-guard-hooks.mjs`）

## 实测方式说明

按「真实工作流场景」要求，脚本不硬跳页面：**招标人登录 → 创建项目（真实填表单保存草稿，写入 projectStore/localStorage）→ 退出 → 招标代理登录 → 委托项目列表看到该项目（跨角色数据衔接）→ 点详情进驾驶舱 → 点动作卡片跳转**。基线 mock 已清空（`BASELINE_PROJECTS = []`，0717 口径），全部数据来自页面 CRUD。

## 逐任务验收

| 任务 | 结果 | 证据 |
|------|------|------|
| agent-actions | 通过 | `projectFlow.js:215-353` getAgentActions 全状态映射（draft→招标文件、tendering→文件/公告/授权、registering→跟踪/开标、pending_open→开标、evaluating→抽专家/评标、评标完成→定标审批、已定标→通知书、询比价直达定标审批）；实测 draft 项目代理卡片为「编制招标文件」，无招标人动作 |
| cockpit-role-dispatch | 通过 | `ProjectDetail.jsx:130-134` 按角色分发；实测代理见代理动作、招标人回归见「编辑项目/发标」；ProjectList nextStep 代理适配（draft→招标文件、评标完成→定标审批）、编辑按钮限招标人 |
| agent-menu-grouping | 通过 | 实测顶层 9 项（common 4 + 委托项目/业务台账/审批中心/采购数据分析/消息中心）；业务台账分组含公告列表/供应商授权/费用台账；菜单无招标文件编制/公告发布/专家抽取/中标通知书；无报名/异议/合同归档/发票 |
| expert-extraction-guard | 通过 | 无 projectId 阻断（「需从项目进入」+ 返回项目列表按钮）；带 projectId 正常渲染；默认项目兜底已移除。**含两轮次生修复**：guard 移至 hooks 后（原 hooks 前 early return 在同路由无参→有参导航时 React 崩溃，6 页面同根因一并修复）；useState 不随 URL 重算导致抽取结果错存 undefined 键，新增 useEffect 同步 query→state |
| doc-ledger-version | 通过 | matrix 2.2 节已实施；台账 0718-ux-003（代理三类违规）、0718-ux-004（守卫 hooks 崩溃及次生修复）；changelog 0.4.0；package.json 0.4.0 |
| build-verify | 通过 | build ✓（265ms）；完整实测 **41/41 通过**，控制台零错误 |

## 红线逐条核对

1. 无空壳工作台 —— 通过（代理工作台有真实待办/项目数据）
2. 无职责重叠入口 —— 通过（阶段操作仅驾驶舱一处入口，菜单无重复）
3. 阶段页面强制 projectId —— 通过（专家抽取补 guard 后，代理全部阶段页面有守卫；hooks 崩溃修复后真实导航路径可用）
4. 菜单按业务域聚合 —— 通过（9 项，委托项目/业务台账两分组；红线审查中打回过一次「业务台账未分组」，已复修）
5. 已砍功能不在主导航 —— 通过（实测断言）
6. 共享文件非 append-only —— 通过（Layout 整合式重写，含注释说明设计依据）
7. 菜单从工作流正向推导 —— 通过（委托项目 → 业务台账 → 审批/分析/消息，与代理「接委托→编文件→发公告→组织开评标→报批→发通知书」工作流一致）

## CRUD 闭环实测

专家抽取执行抽取 → 正式名单渲染 → `bidding-expert-results` 按创建的项目 id（P202607182407）写入 localStorage → **刷新后结果仍在**；招标人创建项目 → 代理列表可见（跨角色数据衔接）。

## 验证中发现并修复的缺陷（均已复测通过）

1. 菜单 11 项超建议上限 → 打回聚合「业务台账」分组（9 项）
2. ProjectEntryGuard hooks 前 early return → 同路由导航 React 崩溃（6 页面修复，0718-ux-004）
3. ExpertExtraction useState 不随 query 重算 → useEffect 同步
4. ProjectCreate/ProcurementAnalytics 弃用 addonAfter → 改 suffix（初用 Space.Compact 破坏 Form.Item id 注入致表单定位失败，改 suffix 零副作用）

## 结论

6 个任务全部完成，41/41 实测通过，同意归档。
