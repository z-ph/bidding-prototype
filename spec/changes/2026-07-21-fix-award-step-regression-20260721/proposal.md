# Proposal: 修复定标步骤回退第一步（确认中标人 → 中标通知书页面展示逻辑 bug）

## Change ID

`fix-award-step-regression-20260721`

## Why

**用户反馈**：前往定标为第三步，确认中标人后，页面又回到了第一步。

**复现链路**（以邀请询比价项目 6「办公耗材框架协议采购项目」为例，代码证据）：

1. 项目 6 为 `invitation_inquiry`、状态 `registering`，驾驶舱/列表「前往定标」→ `/admin/award-confirm?projectId=6`。
2. `AwardConfirm.jsx:25-31` 的 `resolveAwardStage` 含邀请询比价分支：`isInvitedRfqProject(project) → 'evaluation-done'` → `stepsCurrent = 2` → Steps 高亮**第 3 步「确认中标人」**。✓（与用户描述一致）
3. 点击「确认中标人」→ `confirm()`（`AwardConfirm.jsx:162-177`）→ toast + 导航 `/admin/award-notice?projectId=6`。
4. `AwardNotice.jsx:18-23` 存在**同名但实现漂移**的 `resolveAwardStage`，**缺少邀请询比价分支**：
   - 项目 6 无 `awardStage` 字段（`projects.js:120-140`）；
   - `evaluationStore.getEval('6')` 无种子记录 → `emptyEval().status = 'evaluating'`（`evaluationStore.js:89-95`）；
   - → 返回 `'evaluating'` → `stepsCurrent = 0` → Steps 高亮**第 1 步「评标结束」**。✗

**根因**：定标两页面各自维护重复的阶段推导函数且实现漂移（AwardConfirm 有询比族兼容分支，AwardNotice 没有），不是按钮或导航本身的问题。

**顺带发现的同文件展示逻辑瑕疵**（`AwardNotice.jsx`，均为复制粘贴残留）：

- 第 153-161 行 `{sent && <Alert "需先在确认中标人页面完成确认…">}` 条件反了——"需先确认中标人"的警示应在**尚未确认**时出现，而非通知书已发出时；
- 第 163 行 `{!sent && !sent && ...}` 重复条件；
- 第 185/195/203/208 行 `disabled={sent || sent}` 重复表达式（语义应为 `sent` 或"未确认中标人"时禁用，需一并厘清）。

## What Changes

1. **抽取共享阶段推导函数**：新建 `src/utils/awardFlow.js`，导出 `resolveAwardStage(projectId, project)` 与 `AWARD_STAGES`/`STAGE_LABELS` 常量（从 AwardConfirm 现有实现原样迁移，保留 `awardStage → 邀请询比价兼容 → evaluationStore → evaluating` 优先级）；`AwardConfirm.jsx`、`AwardNotice.jsx` 删除各自重复定义，统一引用同一函数。
2. **修复 AwardNotice 三处展示条件**：①"需先确认中标人"警示条件改为"阶段早于 winner-confirmed"；② 去重 `!sent && !sent`；③ `disabled={sent || sent}` 改为语义正确的禁用条件（已发出或未确认中标人时禁用编辑）。
3. **无持久化口径说明**（不改架构）：`confirm()` 不写 `awardStage`（store 为 no-op，系上一轮"纯内存静态 mock"重构的既定架构），修复后中标通知书页 Steps 将稳定显示**第 3 步「确认中标人」**（与确认页一致，不再回退第 1 步），但不会自动推进到「发送通知书」。演示主线分工：**项目 6 演示"前往定标 → 确认中标人"，项目 9（种子 `awardStage: 'winner-confirmed'`）演示"发送中标通知书"**。"确认后 Steps 自动推进"超出无持久化架构，如需支持另议（见待确认）。
4. **与提案 `hall-purchase-method-mapping-20260721` 的衔接**：该提案实施后邀请询比价也走评标，共享函数中的询比族兼容分支可删除，统一为 `awardStage → evaluationStore` 双依据。本提案先保留该分支以兼容现行口径。

## Impact

- **新增文件**：`src/utils/awardFlow.js`。
- **修改文件**：`src/views/AwardConfirm.jsx`、`src/views/AwardNotice.jsx`。
- **文档台账**：`src/views/ReviewChangeList.jsx`（0721-002）、`src/data/changelog.js`、`package.json` version。

## Out of Scope

- 定标 Steps 的节点构成（评标结束/候选人公示/确认中标人/结果公示/发送通知书）不变。
- store 写入能力的恢复（维持 no-op 架构）——如确认需要"确认后自动推进"，单独立项。
- 邀请询比价直达定标口径的调整——归属 `hall-purchase-method-mapping-20260721`。

## 待确认事项

1. 修复后中标通知书页显示第 3 步（与确认页一致）是否可接受？还是要求"确认中标人后进入通知书页显示第 4/5 步"（后者需要恢复 awardStage 的内存写入，与现行无持久化架构冲突，需拍板）？

## 依赖

- `AGENTS.md`「以暗猜接口为耻」——根因为重复函数漂移，修复手段为抽取单一事实源。

## 状态

- 总体状态：**已完成**（2026-07-21 实施并 Playwright 实测；采用推荐方案：共享函数统一口径，通知书页与确认页步骤一致，维持无持久化架构）
