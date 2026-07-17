# 业务对象：Package（标段/包）

> 标段是流程主体。投标/开标/评标/定标都围绕标段推进，不是围绕项目。
> 本卡用最复杂的对象验证六面模板的深度。

---

## ① 业务对象

**定义**：招标项目下的一个独立采购单元，是招投标全流程的承载主体。一个 Project 含多个 Package，各 Package 独立流转。

**字段**：

```
Package {
  id*               string
  projectId*        string        所属项目（只读引用）
  name*             string        标段名称
  budget*           number        标段预算（万元）
  procurementMethod* enum         open_tender | invite_tender | open_inquiry | invite_inquiry
  tenderFee         number        招标文件费
  deposit           number        保证金
  bidStartTime*     datetime      报名/投标开始时间
  bidEndTime*       datetime      投标截止时间
  openTime*         datetime      开标时间
  evaluationMethod* enum          comprehensive_low | comprehensive_avg | lowest_evaluated | manual
  scoreItems*       ScoreItem[]   评分项（招标文件发布时冻结的快照）
  quoteFields       QuoteField[]  报价字段模板（驱动 BidQuote）
  invitedBidders    string[]      邀请招标的被邀请供应商（邀请招标必填）
  needReview        bool          报名是否需审核
  status*           enum          见 ② 生命周期
  winnerBidderId    string        中标人（定标后）
  abnormalType      enum          terminate | suspend | retrial（异常时）
}
```

**与 Project 的边界**：Project 是容器（项目级预算/类型/组织方式），Package 是流程主体。状态挂在 Package 上，Project 状态由其所有 Package 状态聚合。

---

## ② 生命周期

主路径（招标类）：

```
draft → bidding → (registering) → bid_open → pre_open → opening → pre_eval → evaluating → summary → pre_award → awarded → archived
```

询比价分支：`... pre_open → compare → pre_eval（或直接 awarded）`

异常分支：`任意 bidding 之后状态 → abnormal → (terminate|suspend|retrial)`

迁移表（当前状态 -[事件]-> 新状态）：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 创建标段 | 仅招标人；标段预算合计≤项目预算 | draft | 招标人 |
| draft | 发标 | 招标文件已发布；标段字段完整（名称/预算/方式/时间）；预算校验通过 | bidding | 招标人/代理 |
| bidding | 报名截止 + 需审核 | - | registering | 系统（时间触发） |
| bidding | 报名截止 + 无需审核 | - | bid_open | 系统 |
| registering | 审核完成 | - | bid_open | 招标人/代理 |
| bid_open | 投标截止 | - | pre_open | 系统（时间触发） |
| pre_open | 开标时间到 + 招标类 | 主持人/监督已确认 | opening | 招标人（主持） |
| pre_open | 报价截止 + 询比价类 | - | compare | 系统/招标人 |
| opening | 全部解密/废标处理 + 唱标结束 | - | pre_eval | 招标人（主持） |
| compare | 确定供应商 | - | pre_eval（或直接 awarded） | 招标人 |
| pre_eval | 专家抽取确认 + 启动评标 | 专家已接受任务 | evaluating | 招标人/代理 |
| evaluating | 全部专家提交评分 | - | summary（组长汇总） | 系统 |
| summary | 组长生成报告 + 签名 | 基准价已设；价格分已算 | pre_award | 组长 |
| pre_award | 确认中标人 | 候选人公示完成（或跳过公示） | awarded | 招标人/代理 |
| awarded | 合同归档/跳过 | - | archived | 招标人/代理 |
| 任意≥bidding | 触发异常 | 终止/中止/重新招标；需登记原因 | abnormal | 招标人/代理（监督登记+管理员确认） |
| abnormal | 终止 | - | archived（废标） | 招标人 |
| abnormal | 中止恢复 | - | 回原状态 | 招标人 |
| abnormal | 重新招标 | 保留历史版本 | draft（新版本号） | 招标人 |

---

## ③ Actor（谁做什么）

| 动作 | 招标人 | 代理 | 投标人 | 专家 | 监督 | 管理员 |
|---|---|---|---|---|---|---|
| 创建/编辑标段 | ● | ●(受托) | · | · | · | · |
| 发标 | ● | ● | · | · | · | · |
| 审核报名 | ● | ● | · | · | · | · |
| 查看报名/参与 | ● | ● | 自 | · | · | · |
| 主持开标 | ● | ● | · | · | · | · |
| 签到 | ● | ● | 自 | · | 自 | · |
| 解密投标文件 | · | · | 自 | · | · | · |
| 抽取专家/启动评标 | ● | ● | · | · | · | · |
| 评分 | · | · | · | 自 | · | · |
| 汇总/生成报告 | · | · | · | 组长 | · | · |
| 确认中标人 | ● | ● | · | · | · | · |
| 发中标通知书 | ● | ● | · | · | · | · |
| 合同归档 | ● | ● | · | · | · | · |
| 触发异常 | ● | ● | · | · | ◐(登记) | ◐(审批) |
| 监督全过程 | ○ | ○ | ○ | ○ | ● | ○ |

> 「自」= 仅限本人/本企业；「组长」= 评标组长。这些是 owner 维度，`04` 的 `canAct()` 在此细化。

---

## ④ Event（事件清单）

- `created` 创建标段
- `published_tender` 发标
- `registration_closed` 报名截止（时间触发）
- `registration_reviewed` 报名审核完成
- `bid_closed` 投标截止（时间触发）
- `opening_started` 开标开始
- `decryption_completed` 解密完成
- `opening_closed` 开标结束
- `supplier_determined` 确定供应商（询比价）
- `evaluation_started` 启动评标
- `scores_submitted` 专家评分提交
- `report_generated` 组长生成报告
- `winner_confirmed` 确认中标人
- `contract_archived` 合同归档
- `abnormal_triggered` 触发异常
- `abnormal_resolved` 异常处理（终止/恢复/重新招标）

> 事件 ≠ 状态：`published_tender`（事件）触发 draft -> bidding（状态）。

---

## ⑤ Rule（业务规则）

1. **预算规则**：Σ 标段预算 ≤ 项目预算；超标阻断发标。
2. **完整性规则**：标段名称/预算/采购方式/投标起止时间/开标时间缺一不可，否则不可发标。
3. **评分项冻结规则**：`scoreItems` 在招标文件发布时冻结为快照写入 Package；后续专家评分页读此快照，不读草稿。
4. **评标办法驱动规则**：`evaluationMethod` 决定评分页形态（综合评分法显示 scoreItems；经评审最低价法仅资格审查+价格；手工输入直接录总分）。
5. **解密权限规则**：解密仅 `BidFile.bidderId === 当前用户orgId` 且状态=opening 时可操作（P0-1）。
6. **评分权限规则**：专家仅能评分配给自己的 ExpertTask（P1）。
7. **汇总权限规则**：仅组长可统计结果/设基准价/生成报告。
8. **基准价规则**：综合评分法按 evaluationMethod 配置（最低价/平均价）计算价格分。
9. **公示规则**：中标候选人公示可跳过；跳过时直接确认中标人。
10. **异常规则**：终止->保证金待退、投标文件废标；中止->冻结可恢复；重新招标->回 draft 新版本。
11. **时间不可逆规则**：投标截止后 BidFile 不可撤回/修改；开标后状态不可回退。

---

## ⑥ Question（待确认）

- **Q1** 多标段是否独立流转？（默认假设：是）影响：状态挂 Package 而非 Project。
- **Q2** 投标人能否只投部分标段？（默认：可）影响：BidFile 挂标段下。
- **Q3** 询比价二次报价是否所有供应商参与？报价是否互相可见？过程中可见还是轮次结束后可见？
- **Q8** 评分项固定三类还是可自定义？价格项是否必须？
- **Q9** 中标候选人推荐几名？公示几名？可中标多名？
- **Q12** 异常（终止/中止/重新招标）对已缴费用、已投投标文件如何处理？保证金退还流程？
- **Q13** 合同归档跳过时流程如何终止？
- 询比价的「确定供应商」是否直接进入 awarded，还是仍需走 pre_eval？（本卡暂按 pre_eval）
- 邀请招标的 invitedBidders 未全部报名时，开标如何处理（按已报名还是延期）？
