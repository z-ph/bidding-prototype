# Proposal: 评标大厅角色拆分与开标准备人员配置

## Change ID

`fix-evaluation-hall-role-split-20260717`

## Why

7-14 评审导出（2052）与 cal 交叉评审指出：评标大厅所有角色看到同一页面同一批按钮（2052-008）、专家/监督可点击「提交评标结果」（2052-009，严重）、专家未全部提交时提交控制不完整（2052-003）、招标人开标后点「进入评标大厅」被踢到无权限页（2052-010）、开标准备无法指定主持人/监督人（cal-003，P1）。

## What Changes

1. **角色拆分视图**：EvaluationHall 引入 useRole，按角色渲染：
   - 代理（agent）：组织评标、查看汇总、提交评标结果；
   - 招标人（tenderee）：只读评标进度 + 评标报告确认入口；
   - 专家（expert）：只读汇总进度，本人评分在 ExpertProject 完成；
   - 监督（supervisor）：只读 + 监督意见登记。
2. **提交控制**：「提交评标结果」仅 agent 可见；全部专家提交前按钮禁用；按钮旁展示未提交专家名单；提交二次确认（2052-003、2052-009）。
3. **招标人评标进度**：tenderee 允许进入 evaluation-hall（只读模式），OpeningHall「进入评标大厅」不再跳无权限页（2052-010；permissions 由基础设施接线）。
4. **开标准备人员配置**：OpeningHall 支持代理在开标前指定主持人、监督人（下拉选择或手动输入），签到表与唱标环节使用配置值（cal-003）。

## Impact

- **修改文件**：`src/views/EvaluationHall.jsx`、`src/views/OpeningHall.jsx`。
- **基础设施接线**：`src/config/permissions.js`（evaluation-hall 增加 tenderee 只读）。
- **共享存储**：专家提交状态读取 `src/data/evaluationStore.js`（契约固定，不得改签名）；开标准备配置可新建 `src/data/openingPrepStore.js`。

## Out of Scope

- 评标委员会真实多方协同（ mock 单浏览器演示）。

## 依赖

- 评审变更记录 2052-003/008/009/010、cal-003。
- `src/data/evaluationStore.js` 契约（基础设施预建）。
