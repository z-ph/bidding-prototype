# 验证报告：simplify-project-creation-20260727

- 验证人：父 agent（协调者）
- 日期：2026-07-27
- 实施 agent：coder subagent（单次派发，无并行文件冲突）

## 机械验证（复核人亲自重跑，非采信自报）

| 检查 | 结果 |
|---|---|
| `node scripts/quality-gate.mjs` | 0 errors（7 个存量 warning 与本次无关） |
| `pnpm run build`（tsc --noEmit + vite build） | 通过，`routeTree.gen.ts` 自动重生成 |
| `node scripts/verify-0727-simplify.mjs`（自起 dev server 5199 实测） | 18/18 PASS：两角色菜单无需求库、旧 URL 重定向、无分步条、无三字段、编号自动生成、提交→待审核→两级审批→待发布→发布采购→采购中、刷新持久化、驳回退草稿、零 console 错误 |
| `node scripts/verify-0727-award-registration.mjs` | 4/4 PASS：登记卡片、登记展示、刷新保留、审批中心无中选结果单据 |
| grep「采购需求库」/ requirementStore 残留 | 菜单/权限零残留；requirementStore 仅 ProjectDetail 存量种子只读展示（按约束 6 保留数据文件），其余命中均为台账/changelog 历史原文与注释 |

## 红线审核（7 条）

1. 空壳工作台/纯跳转页：无新增页面，通过。
2. 角色重叠入口：无，且删除了需求库重复入口，通过。
3. 阶段页面 projectId 守卫：未受影响（本次不涉及阶段页面），通过。
4. 菜单平铺：本次为净删除（tenderee/agent 各删 1 项），无新增顶层项，通过。
5. 砍掉功能残留主导航：采购需求库已从两角色菜单与权限表移除，旧 URL 重定向到创建项目，通过。
6. 共享文件 append-only：Layout/permissions/路由均为删除整合 + 重定向，非 append，通过。
7. 正向推导：全部改动可从 0727 会后补充口径（五.5）正向推导，通过。

## 四层设计判断（subagent-quality-gate）

- 工作流合理：创建项目入口（项目列表）→ 单页填写 → 提交建单 → 审批中心两级审批 → 待发布 → 发布采购，闭环衔接正确；代理创建的项目立项通过后给「查看项目」提示卡，发布采购仍限采购单位（与 0727 会议 3.10「采购部账号可发布」口径一致，且与改动前 publish 门控一致，非回归）。
- 角色/状态条件：抽查 tenderee（draft/approved→发布采购按钮）、agent（仅提示卡）、审批节点（需求部门→采购管理部映射 tenderee 待办）正确；编辑非草稿项目不会退回 pending（submit 保持原状态），边界处理正确。
- 数据流：approvalStore（bidding-approvals / bidding-approval-flows）与 projects.js（bidding-projects）均真实 localStorage 持久化，syncProjectStatus 仅在 pending 时联动，幂等安全；AwardConfirm 登记结果存 project.awardRegistration 随 projectStore 持久化。
- UX：页面顶部 Alert 说明当前阶段与提交后果；采购需求区提示「能上传优先上传」；提交按钮写明「提交审核（生成立项审批单）」；采购包空态有 EmptyState 引导；提交前确认区完整。

## 裁决项（实施 agent 上报，父 agent 裁决）

1. **新增 devDependency @types/react + @types/react-dom**：认可。TS 优先口径下首个 .tsx 页面通过 tsc 的必需基础设施。
2. **部分改动文件保留 @ts-nocheck**（TenderDoc/AwardConfirm/ApprovalCenter/ApprovalFlowConfig/ProjectList/ProjectDetail/TodoCenter/Layout/permissions/projectFlow/ReviewChangeList/changelog）：**接受为偏离项**。理由：这些是 antd 重型视图，strict checkJs 解冻需逐回调标注，与最小改动原则冲突；typecheck 门禁对已解冻文件仍然生效。后续按「改动即解冻」规则在下次触碰这些文件时补齐。
3. tenderDocStore 仍为 no-op 演示（发布不落盘）：提案范围外，登记为后续项。

## 遗留风险（不阻断，另行处理）

- 会议其余口径（采购包 Excel 清单导入、三价体系、供应商体系、收款管理等）未实施，台账 0727-mt-001 保持「待确认」。
- CA 分级使用与 0726-003 口径张力待与陈部长确认。
- 「标段」用词与 0724 敏感词清洗的张力未处理（本次保持「采购包」）。

## 结论

5 个任务全部验收通过，无打回项。台账 0727-mt-002/003/004 状态「已修复」经本次代码复核确认成立；版本 0.13.0 与 changelog 条目已核验。
