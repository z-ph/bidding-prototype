# Verification: 投标人交互范式重构

验证日期：2026-07-18
验证人：父 agent（红线审查）
方式：`pnpm run build` + Playwright 真实工作流实测（`scripts/verify-bidder-redline.mjs`，trace：`review-assets/bidder-redline-trace.zip`）

## 逐任务验收

| 任务 | 结果 | 证据 |
|------|------|------|
| guard-role-back | 通过 | `ProjectEntryGuard.jsx` backTo/backLabel props 默认值与旧硬编码一致；实测默认调用（招标方 6 页面）回归不破，投标人场景实测点「返回项目中心」跳 `/admin/bidder-projects` |
| bid-quote-guard | 通过 | 无 projectId 阻断且无项目选择器（seeds/选择器/quotableProjects 已删，页面 319→207 行）；guard 位于 6 个 hooks 之后（`:60-62`）；携带 projectId 正常渲染开标一览表；跳上传标书带 projectId |
| bidder-menu-slim | 通过 | 实测顶层 7 项（common 4 + 项目中心/企业档案/消息中心）；菜单无在线报价/开标大厅/中标通知；无报名/发票/异议/费用/合同归档 |
| doc-ledger-version | 通过 | matrix 2.3 节已实施；台账 0718-ux-005；changelog 0.5.0；package.json 0.5.0 |
| build-verify | 通过 | build ✓（465ms）；实测 **26/26 通过**，控制台零错误 |

## 红线逐条核对

1. 无空壳工作台 —— 通过
2. 无职责重叠入口 —— 通过（报价/开标/中标仅项目中心一处入口）
3. 阶段页面强制 projectId —— 通过（BidQuote 补 guard 后投标人全部阶段页面有守卫；选择器空载模式清除）
4. 菜单按业务域聚合 —— 通过（7 项，无分组需要）
5. 已砍功能不在主导航 —— 通过（实测断言报名/发票/异议等）
6. 共享文件非 append-only —— 通过（bidderMenus 精简+注释；guard 参数化而非新增组件）
7. 菜单从工作流正向推导 —— 通过（项目中心承载全部投标操作，与「看项目→按状态执行下载/报价/上传/开标/查中标」工作流一致）

## CRUD 闭环实测

项目中心 → 轨道交通项目点「在线报价」→ 填写开标一览表 4 字段 + 分项单价 → 保存报价 → `bidding-quotes` 写入 `1::A科技有限公司`（quote+items+savedAt）→ **刷新后报价回显**；「下一步：上传投标文件」跳转携带 projectId。

## 验证中发现并修复的缺陷

1. saveQuote 假保存（纯 message 不落库）→ 打回实施方补 quoteStore 落库+回显（0718-ux-005 fix 字段已补充）
2. BidUpload 投标回执 Modal 弃用 maskClosable → 改 `mask={{ closable: false }}`（antd 6 类型定义 `MaskType = MaskConfig | boolean` 核实后修改）

## 范围外观察（登记后续处理，未改动）

- `BidderProjects.jsx:109-164` seedProjects/joinedProjects 为页面级硬编码 mock（可参与/已参与项目演示数据）；且 projectStore 中**公开招标项目未并入**投标人可参与列表（仅邀请制合并，`BidderProjects.jsx:166-185`）。清空 seeds 会使投标人演示断链，需专门提案设计数据来源（招标人发标 → 公开项目进可参与列表），建议列入后续议题。

## 结论

5 个任务全部完成，26/26 实测通过，同意归档。
