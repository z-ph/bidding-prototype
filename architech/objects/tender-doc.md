# 业务对象：TenderDoc（招标文件）

> P0 对象。招标文件是评标办法的「配置产物」，其 scoreItems（发布冻结）驱动专家评分页。P0-4 的载体。
> 现状 `tenderDocStore.js` 已有版本链与 scoreItems，但下游引用不一致（P1-3 版本统一链）。

---

## ① 业务对象

**定义**：招标方为某标段编制的招标文件，含多版本（版本链）、目录、附件、评标办法、评分项、评审条款。**发布时 scoreItems 冻结为快照**，写入 Package.scoreItems，驱动专家评分。

**字段**：

```
TenderDoc {
  id*, packageId*
  versions*         TenderDocVersion[]
  currentPublished  versionId     当前已发布版本（版本链锚点，单一来源）
}

TenderDocVersion {
  id*, versionNo*, status: editing | published
  catalog*          CatalogNode[] 目录树（可增删改拖拽）
  fileList*         FileRef[]     附件
  scoreMethod*      enum          comprehensive_low | comprehensive_avg | lowest_evaluated | manual
  scoreItems*       ScoreItem[]   评分项（发布时冻结）
  basePriceType     enum          lowest | average   （综合评分法的基准价类型）
  evaluationClauses EvaluationClause[]  评审条款（驱动 BidFile.clauseLinks）
  quoteFields       QuoteField[]  报价字段模板（驱动 BidQuote）
  creator, confirmer
  publishedAt, updatedAt
}

ScoreItem { id*, name*, weight* (0-100), type: business | tech | price, scoringRule }
```

**配置链**：`TenderDocVersion(published).scoreItems` →（发布时快照）→ `Package.scoreItems` →（评标时读）→ 专家评分页。

---

## ② 生命周期（版本级）

状态链（单个版本）：

```
editing → published（冻结，不可改）
```

版本链演进：

```
V1.0(editing) → V1.0(published) → 发变更 → V1.1(editing) → V1.1(published)
```

迁移表（版本状态 -[事件]-> 新版本状态）：

| 当前版本状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 创建初版 | 仅招标人/代理 | editing | 招标人/代理 |
| editing | 编辑目录/评分项 | 未发布可改 | editing | 招标人/代理 |
| editing | 发布 | Σweight=100；综合评分法有且仅有一个price项；字段完整 | published；currentPublished 指向它；scoreItems 冻结写入 Package | 招标人/代理 |
| published | 发变更 | 标段状态≥bidding | 基于当前版本创建新版本 editing | 招标人/代理 |
| published | 改评分项 | **拒绝**（已冻结） | (拒绝) | - |

---

## ③ Actor（谁做什么）

| 动作 | 招标人/代理 | 投标人 | 专家 | 监督 |
|---|---|---|---|---|
| 编制/编辑（editing 版本） | ● | · | · | · |
| 发布（冻结 scoreItems） | ● | · | · | · |
| 发变更（新版本） | ● | · | · | · |
| 下载（currentPublished） | ○ | ●(已缴费) | · | · |
| 下载澄清/变更版 | ○ | ●(已报名) | · | · |
| 招标文件质疑 | · | ●(提出) | · | · |
| 质疑答复 | ● | · | · | · |
| 查阅（评标时 currentPublished） | ○ | · | ●(reviewing) | ○ |

---

## ④ Event（事件清单）

- `created` 创建初版
- `edited` 编辑（目录/评分项/条款）
- `published` 发布（冻结 scoreItems，写入 Package 快照）
- `changed` 发变更（基于当前版本创建新版本）
- `clarified` 发澄清（关联 Notice clarification，不改版本状态）
- `questioned` 投标人质疑
- `question_answered` 招标方答复质疑

> 事件≠状态：`published`（事件）触发 editing→published（状态）。

---

## ⑤ Rule（业务规则）

1. **评分项冻结规则**：版本 published 后 scoreItems 不可改；Package.scoreItems 引用此快照。专家评分页读 Package.scoreItems，**不读草稿**。（P0-4）
2. **评分项完整性规则**：发布校验 `Σ weight === 100`；综合评分法须有且仅有一个 type=price 项。
3. **版本链单一源规则**：`currentPublished` 是唯一锚点；招标文件页/投标人下载页/专家查阅页**三处都读 currentPublished**，版本号一致。（P1-3）
4. **变更通知规则**：发新 published 版本 → 所有已报名投标人收到通知；BidDownload 显示「有新版本」。
5. **报价字段驱动规则**：`quoteFields` 在发布时写入 Package.quoteFields，驱动 BidQuote 报价表单。
6. **评审条款驱动规则**：`evaluationClauses` 在发布时供 BidFile.clauseLinks 挂接，并供专家查阅。（P1-1）
7. **质疑规则**：投标人在报名后可对招标文件提出质疑；招标方答复形成澄清公告（Notice clarification）。

---

## ⑥ Question（待确认）

- **Q8** 评分项固定三类还是可自定义？（默认：可自定义 + price 项必须）
- 评分项 weight 校验是「严格=100」还是「允许≤100」？（默认严格=100）
- 招标文件版本号规则：小修订 V1.1，重大变更是否 V2.0？（默认小修订递增 minor）
- 澄清（clarification）是否算版本变更？（默认不算，独立 Notice 但关联 packageId）
- 投标人质疑是否有时间窗口限制？（需求未明确）
- 经评审最低价法是否完全无评分项？（默认：无评分项，仅资格审查+价格排序）
