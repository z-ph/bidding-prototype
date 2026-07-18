# Verification: 评标专家交互范式重构

验证日期：2026-07-18
验证人：父 agent（红线审查）
方式：`pnpm run build` + Playwright 跨角色真实工作流实测（`scripts/verify-expert-redline.mjs`，trace：`review-assets/expert-redline-trace.zip`）

## 实测方式说明

完整跨角色闭环：**招标代理登录 → 专家抽取（循环重新抽取直至专家甲进入正式名单——页面文本命中可能只是备选，以 localStorage `experts` 字段为准）→ 确认并通知 → 退出 → 评标专家登录 → 我的评标任务确认参加 → 进入评标（回避声明→签到→推选组长→查阅资料→逐投标人 Tab 评分→电子签名→提交）→ 持久化验证**。

## 逐任务验收

| 任务 | 结果 | 证据 |
|------|------|------|
| expert-menu-merge | 通过 | 实测顶层 7 项（common 4 + 我的评标任务/专家信息/消息中心）；无独立「评标任务」入口 |
| expert-project-redirect | 通过 | 实测 goto `/admin/expert-project`（无参）重定向到 `/admin/expert-tasks`；携带 projectId 详情正常渲染（6 步评分流程走完）；ProjectTaskList/evaluationProjects mock 列表已删，PROJECT_INFO 保留 |
| dashboard-expert-entry | 通过 | 实测工作台点「进入评标大厅」直达 /admin/expert-tasks |
| doc-ledger-version | 通过 | matrix 2.4 节已实施；台账 0718-ux-006；changelog 0.6.0；package.json 0.6.0 |
| build-verify | 通过 | build ✓（470ms）；实测 **24/24 通过**，控制台零错误 |

## 红线逐条核对

1. 无空壳工作台 —— 通过
2. 无职责重叠入口 —— 通过（双"任务"入口合并为「我的评标任务」单一入口，评分详情仅深链）
3. 阶段页面强制 projectId —— 通过（评分详情从任务列表携带 projectId 进入；无参重定向到真实任务列表而非 mock 列表）
4. 菜单按业务域聚合 —— 通过（7 项）
5. 已砍功能不在主导航 —— 通过
6. 共享文件非 append-only —— 通过（expertMenus 精简+注释；ExpertProject 删 mock 列表而非叠加）
7. 菜单从工作流正向推导 —— 通过（邀请确认 → 进入评标 → 签名提交，单一入口承载完整工作流）

## CRUD 闭环实测

- 代理抽取 + 确认名单 → `bidding-expert-results[1].confirmed=true`
- 专家确认参加 → 专家甲 `confirmStatus=confirmed`（写回 expertStore）
- 评分（3 投标人 × 3 评分项 + 意见）→ 实时写入 `bidding-evaluation`
- 电子签名 + 提交 → `experts['专家甲'].submitted=true` → **刷新后签名/提交状态仍在**

## 验证中发现并修复的缺陷

- 4 处 Drawer 弃用 width（ExpertProject 640 / ProcurementRequirementList 560 / ApprovalCenter 640 / ApprovalFlowConfig 520）→ 改 `size`（antd 6 `sizeType | number | string` 类型定义核实后等值替换，宽度不变）

## 实测脚本修正记录（非产品缺陷）

- 抽取命中判断由"页面文本含专家甲"改为读 localStorage 正式名单（页面同时渲染备选名单，文本命中会误判）
- 查阅资料步需先勾选「我已查阅全部投标资料」按钮才解锁；评分按投标人 Tab 逐个填写

## 结论

5 个任务全部完成，24/24 实测通过，同意归档。
