# 02 - 领域模型与实体设计

> 原则：数据模型先于 UI。每个业务对象必须输出字段、类型、必填、关联关系。
> 禁止用富文本承载后续流程需解析的结构化信息（招标公告的关键字段必须结构化）。

---

## 1. 核心实体清单

按聚合根分组。**★** 标记为本设计重点治理的实体（现有实现存在缺口）。「对象卡」列指向 `objects/` 下的详细分析（六面）。

| 聚合根 | 实体 | 说明 | 对象卡 | 现状 |
|---|---|---|---|---|
| 组织 | Organization | 招标人/代理/投标人机构 | supporting-objects | 有 store，缺数据范围 |
| | User | 账号、角色、所属组织 | supporting-objects | 有 permissions，缺实体 |
| 项目 | **★ Project** | 项目容器 | [project.md](./objects/project.md) | 状态挂在 Project 上 ❌ |
| | **★ Package** | 标段/包（流程主体） | [package.md](./objects/package.md) | 字段缺失（采购方式/费用/时间） ❌ |
| | ProcurementRequirement | 采购需求（Project 辅助关联） | （未单列，挂 Project.requirementId） | 有 store |
| | EntrustContract | 委托合同 | （未单列，待确认 Q-委托抽取条件后补） | 无 ❌ |
| 招标文件 | **★ TenderDoc** | 招标文件（含版本链） | [tender-doc.md](./objects/tender-doc.md) | 有 store，评分项已驱动 |
| | TenderDocVersion | 版本记录 | （tender-doc.md 子对象） | 有，但下游引用不一致 ❌ |
| | EvaluationClause | 评审条款 | （tender-doc.md 子对象） | 有 clauseStore，未与招标文件关联 ❌ |
| 公告 | **★ Notice** | 招标/变更/中标候选人/中标/异常/澄清 | [notice.md](./objects/notice.md) | 有 store，缺生命周期 ❌ |
| 门户 | PortalContent | 新闻/系统公告/法规（不关联标段） | [portal-content.md](./objects/portal-content.md) | 有 AdminNews，需与 Notice 分离 |
| 投标 | BidderRegistration | 报名记录 | （未单列，见 bid-file §6「已报名才可上传」） | 无 ❌ |
| | Invitation | 邀请记录 | （未单列，见 package.invitedBidders） | 无（仅前端 Transfer） ❌ |
| | **★ BidFile** | 投标文件（含签章/加密/提交状态链） | [bid-file.md](./objects/bid-file.md) | **组件 useState，未进 store** ❌❌ |
| | **★ BidQuote** | 报价（含轮次） | [bid-quote.md](./objects/bid-quote.md) | 无独立实体 ❌ |
| | Payment | 文件费/保证金/平台费 | [payment.md](./objects/payment.md) | 无 ❌ |
| 开标 | OpeningSession | 开标会 | [opening-session.md](./objects/opening-session.md) | 无独立实体，散在 OpeningHall 组件 ❌ |
| | SignIn | 签到记录 | （opening-session.md 子对象） | 无 ❌ |
| 评标 | EvaluationCommittee | 评标委员会 | （evaluation.md 子对象） | 有 expertStore.result |
| | **★ ExpertTask** | 专家任务（抽取->通知->接收->评标） | （evaluation.md 子对象） | 链路断裂 ❌ |
| | Score | 单专家评分 | （evaluation.md 子对象） | 散在 EvaluationHall 组件 ❌ |
| | EvaluationResult | 评标汇总/排名/报告 | （evaluation.md 子对象） | 无 ❌ |
| 定标 | AwardCandidate | 中标候选人 | （award.md 子对象） | 无 ❌ |
| | Award | 中标结果 | [award.md](./objects/award.md) | 无 ❌ |
| | Contract | 合同归档 | [contract.md](./objects/contract.md) | 无 ❌ |
| 异议 | Objection | 异议与答复 | [objection.md](./objects/objection.md) | 有 store |
| | Abnormal | 异常/终止/中止/重新招标 | [abnormal.md](./objects/abnormal.md) | 无 ❌ |
| 专家 | Expert | 专家库 | [expert.md](./objects/expert.md) | 有 store |
| 供应商 | Supplier | 供应商机构（准入/考核） | [supplier.md](./objects/supplier.md) | 有 SupplierProfile，缺黑名单/状态链 |
| | SupplierBlacklist | 黑名单 | （supplier.md 内 status=blacklist） | 无 ❌ |
| 分析 | WinRecord | 中标成交清单 | supporting-objects | 无 ❌ |
| | CollusionAlert | 串标预警 | supporting-objects（规则见 05 §4） | 无 ❌ |
| 审计 | AuditLog | 操作日志 | supporting-objects | 有 AdminLogs，未结构化 |
| 配置 | Dictionary/Template | 字典/模板 | supporting-objects | 有 AdminDictionary |

**结论**：现有实现约 40% 核心实体缺失或散落在组件内。最严重的是 **BidFile 停在组件 state**——这是开标读不到投标文件、版本链断裂、加密链不可验的根因。


---

## 2. 实体关系图（ER）

```
┌──────────────┐    1:N    ┌──────────────┐    1:N    ┌──────────────────┐
│ Organization │──────────▶│    Project   │──────────▶│     Package ★    │
│  (机构)      │           │  (项目容器)  │           │  (标段/流程主体) │
└──────┬───────┘           └──────┬───────┘           └────────┬─────────┘
       │ 1:N                      │ 1:N                         │ 1:N
       ▼                          ▼                             │
┌──────────────┐          ┌───────────────┐                    │
│     User     │          │ ProcurementReq│                    │
│  (账号)      │          │  (采购需求)   │                    │
└──────────────┘          └───────────────┘                    │
                                                                │
   ┌────────────────────────────────────────────────────────────┘
   │
   │  Package 1:1 TenderDoc(多版本)   Package 1:N Notice
   │  Package 1:N BidderReg           Package 1:N Invitation
   │  Package 1:N BidFile             Package 1:N BidQuote
   │  Package 1:1 OpeningSession      Package 1:1 EvaluationCommittee
   │  Package 1:N AwardCandidate      Package 1:1 Award
   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Package（标段）                              │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  TenderDoc   │   Notice     │   BidFile ★  │   OpeningSession      │
│  (招标文件)   │  (公告)      │  (投标文件)   │   (开标会)             │
│   ├Version   │   ├草稿/发布 │   ├签章状态   │   ├SignIn[]           │
│   ├ScoreItem │   └变更/撤回 │   ├加密方式   │   ├DecryptStatus[]    │
│   └Clause[]  │              │   ├提交状态   │   └Record            │
└──────────────┴──────────────┴──────┬───────┴───────────────────────┘
                                     │ 1:N
                                     ▼
                              ┌──────────────┐    1:N    ┌─────────────┐
                              │ Evaluation   │──────────▶│ ExpertTask  │
                              │ Committee    │           │ (专家任务)  │
                              └──────┬───────┘           └──────┬──────┘
                                     │ 1:N                       │ 1:N
                                     ▼                           ▼
                              ┌──────────────┐           ┌─────────────┐
                              │    Score     │           │  AwardCand  │
                              │  (单专家评分) │           │  (候选人)   │
                              └──────────────┘           └──────┬──────┘
                                                                 │ 1:1
                                                                 ▼
                                                         ┌─────────────┐
                                                         │    Award    │
                                                         │  (中标结果) │
                                                         └──────┬──────┘
                                                                │ 1:1
                                                                ▼
                                                         ┌─────────────┐
                                                         │  Contract   │
                                                         │ (合同归档)   │
                                                         └─────────────┘
```

---

## 3. 关键实体字段定义

仅列出核心字段与现有实现差距较大的实体。`*` 为必填。

### 3.1 Package（标段）★ - 流程主体

```
Package {
  id*               string        标段编号
  projectId*        string        所属项目
  name*             string        标段名称
  budget*           number        标段预算（万元）
  procurementMethod* enum         open_tender | invite_tender | open_inquiry | invite_inquiry
  tenderFee         number        招标文件费
  deposit           number        保证金金额
  bidStartTime*     datetime      投标开始时间
  bidEndTime*       datetime      投标截止时间
  openTime*         datetime      开标时间
  evaluationMethod* enum          comprehensive_low | comprehensive_avg | lowest_evaluated | manual
  scoreItems*       ScoreItem[]   评分项配置（发布时冻结）
  quoteFields       QuoteField[]  报价字段模板（驱动 BidQuote）
  invitedBidders    string[]      邀请招标时的被邀请供应商ID
  status*           enum          见 03 状态机
  winnerBidderId    string        中标人（定标后）
}
```

**与现状差距**：现有 `projects.js` 把标段信息平铺在 Project 上，缺少 procurementMethod/tenderFee/deposit/时间/evaluationMethod/scoreItems/quoteFields。这些字段是开标、报价、评标的上游数据源。

### 3.2 BidFile（投标文件）★ - 状态链实体

```
BidFile {
  id*               string
  packageId*        string        挂在标段下（非项目下）
  bidderId*         string        投标人组织ID
  fileList*         BidFileItem[] 文件清单
  clauseLinks       map<clauseId, fileName>   评审条款关联
  quoteSnapshot*    object        提交时的开标一览表/报价快照
  signStatus*       enum          unsigned | signed
  encryptMethod*    enum          none | password | ca
  submitStatus*     enum          draft | submitted
  submittedAt       datetime
  receiptNo         string        正式回执编号（CA加密才有）
  version*          number        版本号（支持撤回重传）
}
BidFileItem {
  name*, type*, size*, signed: bool, signTime, encrypted: bool, encryptMethod, encryptTime
}
```

**与现状差距**：现有 `BidUpload.jsx` 把所有状态放在 `useState`，刷新即丢、且开标大厅无法读取。**必须落入共享 store**，这是 P0-2/P0-3 的前置条件。

### 3.3 Notice（公告）★ - 生命周期实体

```
Notice {
  id*               string
  packageId*        string        关联标段
  type*             enum          tender | change | candidate | award | abnormal | clarification
  title*, content*
  structuredFields* object        结构化字段（名称/编号/开标时间/截止时间/评标方法/开标一览表）
                                  -- 禁止用富文本承载这些
  status*           enum          draft | published | changed | withdrawn | archived
  changeReason      string        变更公告必填
  publishTime, withdrawTime
  attachments[]     FileRef[]
}
```

**与现状差距**：现有公告把关键信息放富文本，开标/报价无法引用。`structuredFields` 是结构化的硬性要求。

### 3.4 TenderDoc（招标文件）★ - 配置产物

```
TenderDoc {
  id*, packageId*
  versions*         TenderDocVersion[]
  currentPublished  versionId     当前已发布版本（版本链锚点）
}
TenderDocVersion {
  id*, versionNo*, status: editing|published
  catalog*          CatalogNode[] 目录树
  fileList*         FileRef[]
  scoreMethod*      enum          同 Package.evaluationMethod
  scoreItems*       ScoreItem[]   评分项（发布时冻结，驱动专家评分页）
  basePriceType     enum          lowest | average   基准价类型
  evaluationClauses EvaluationClause[]  评审条款（驱动 BidFile.clauseLinks）
  publishedAt
}
ScoreItem { id*, name*, weight*, type: business|tech|price, scoringRule }
```

**关键规则**：`scoreItems` 在版本 `published` 时冻结。Package.scoreItems 引用已发布版本的 scoreItems。专家评分页读 Package.scoreItems，不读草稿。见 `05`。

### 3.5 ExpertTask（专家任务）★ - 链路实体

```
ExpertTask {
  id*, packageId*, expertId*
  extractionId*     string        所属抽取批次
  status*           enum          notified | accepted | declined | evaluating | submitted
  notifiedAt        datetime      短信通知时间
  acceptedAt        datetime      专家确认接受时间
  isLeader          bool          是否组长
  scoreId           string        关联评分（提交后）
}
```

**与现状差距**：现有专家直接进入评标页，无「抽取->通知->接受->评标」链路。见 `08-B5`。

### 3.6 AwardCandidate / Award / Contract

```
AwardCandidate { id*, packageId*, bidderId*, rank*, score*, amount* }
Award { id*, packageId*, bidderId*, noticeSentAt, contractId }
Contract { id*, awardId*, fileRef, archiveStatus: pending|archived|skipped }
```

### 3.7 Abnormal（异常）

```
Abnormal { id*, packageId*, type: terminate|suspend|retrial, reason*, 
           effectOnFees: refund_pending, effectOnBids: invalidated, createdAt }
```

---

## 4. 聚合边界与一致性规则

| 聚合根 | 一致性边界 | 跨聚合引用规则 |
|---|---|---|
| Project | Project + Package 的创建/删除 | Package 引用 projectId（只读） |
| Package | Package 状态流转 | 引用 TenderDoc.currentPublished、Award.winnerBidderId |
| TenderDoc | 版本链、评分项冻结 | Package.scoreItems 引用已发布版本快照 |
| BidFile | 签章/加密/提交状态链 | 引用 packageId、clauseLinks 引用 evaluationClauses |
| OpeningSession | 签到、解密状态 | 引用 BidFile.submitStatus（只读） |
| Evaluation | 委员会、任务、评分、结果 | Score 引用 ExpertTask、BidFile |

**一致性原则**：跨聚合只读引用，不直接修改；状态变更通过领域事件（原型中用 store 间函数调用模拟）。

---

## 5. 与现有 store 的差距与迁移

| 现有 store | 处置 |
|---|---|
| `projects.js` | 拆分：Project 留容器字段，Package 独立为 `packageStore.js` |
| `tenderDocStore.js` | 保留版本链；补 `evaluationClauses`；确保 Package 引用其已发布快照 |
| `clauseStore.js` | 合并入 TenderDoc.evaluationClauses，或作为 BidFile 的关联源 |
| `expertStore.js` | 补 ExpertTask 链路状态 |
| **BidFile（无）** | **新增 `bidFileStore.js`**，P0 前置 |
| **Notice（portalStore/notices.js）** | 补生命周期字段与 structuredFields |
| **OpeningSession（无）** | **新增 `openingStore.js`**，承载签到/解密状态 |
| **EvaluationResult（无）** | **新增 `evaluationStore.js`**，承载评分/汇总/报告 |

迁移策略见 `06-architecture.md` §store 治理。
