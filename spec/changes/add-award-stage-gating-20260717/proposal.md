# Proposal: 定标/通知书/归档按项目维度并按阶段门禁

## Change ID

`add-award-stage-gating-20260717`

## Why

7-16 招投标测试 P0（test-001）指出：确认中标人、中标通知书、合同归档可从菜单直接打开，未按项目实际阶段限制访问；7-15 评审导出（1415-007）指出这些项目强相关页面写死单一项目，应按项目列表维度展示。

## What Changes

1. **项目维度**：AwardConfirm、AwardNotice、ContractArchive 顶部提供项目选择（数据来自 projectStore，含默认 mock 项目），页面内容按所选项目渲染，不再写死单一项目（1415-007）。
2. **阶段门禁**：按所选项目当前阶段控制可操作性（test-001）：
   - 确认中标人：需项目到达「评标完成」阶段；
   - 中标通知书：需「已确认中标人」；
   - 合同归档：需「中标通知书已发出」。
   未达阶段时页面展示锁定提示并禁用操作，而非任意可写。
3. **状态流转**：确认中标人→可发通知书→可归档，操作回写项目状态（projectStore），形成演示闭环。

## Impact

- **修改文件**：`src/views/AwardConfirm.jsx`、`src/views/AwardNotice.jsx`、`src/views/ContractArchive.jsx`。
- **只读依赖**：`src/data/projects.js`（只读，不得修改该文件；项目状态回写通过 projectStore 已有 API）。
- **菜单**：三个入口保留在招标人菜单，但页面内按项目阶段门禁。

## Out of Scope

- 中标通知书真实 PDF 生成与签章。

## 依赖

- 评审变更记录 test-001（P0）、1415-007。
