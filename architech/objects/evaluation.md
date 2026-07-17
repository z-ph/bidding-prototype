# 业务对象：Evaluation（评标）

> P0 对象。评标委员会/专家任务/评分/汇总结果的总称。P0-4（评标办法驱动）+ P1-5（专家任务链路）的载体。
> **现状缺口**：`EvaluationHall.jsx` 用 `useState` 写死 `scoreSummary`/`expertScores`，无 store；评分项写死商务28/技术36/价格29，非配置驱动。

> 说明：Evaluation 在本卡是聚合概念，含四个子对象 —— EvaluationCommittee（委员会）、ExpertTask（专家任务）、Score（评分）、EvaluationResult（结果）。`02` 领域模型把它们分列为独立实体，本卡统一描述其协作。

---

## ① 业务对象

**定义**：某标段的评标活动。招标方抽取专家组建委员会 → 专家接受任务签到评分 → 组长汇总设基准价 → 生成报告 → 产出中标候选人。评分项读 Package.scoreItems（TenderDoc 发布冻结的快照）。

**字段**：

```
Evaluation {
  id*, packageId*
  committee*        EvaluationCommittee   委员会
  tasks*            ExpertTask[]          专家任务（抽取→通知→接受→评标）
  scores*           Score[]               各专家评分
  result*           EvaluationResult      汇总/排名/报告
  state*            enum                  extracting | notified | accepted | reviewing | scoring | summary | closed
}

EvaluationCommittee { experts[], leaderId, formedAt }

ExpertTask {
  id*, packageId*, expertId*, extractionId*
  status*     enum   notified | accepted | declined | evaluating | submitted
  isLeader    bool
  notifiedAt, acceptedAt, scoreId
}

Score { id*, taskId*, expertId*, bidderId*, items: map<itemId, score>, comment, submittedAt }

EvaluationResult {
  ranking[]        { bidderId, totalScore, priceScore, rank, recommend }
  basePrice        number      组长确认的基准价
  reportText       text        评标报告
  signatures[]     专家电子签名
  generatedAt
}
```

**配置链（P0-4 核心）**：`Package.scoreItems`（= TenderDoc 发布冻结快照）→ 专家评分页读它渲染评分项 → Score 按 itemId 记录 → 组长汇总 `Σ(score/满分×weight)` → 价格分按 basePriceType 自动算 → EvaluationResult。

---

## ② 生命周期

状态链：

```
extracting → notified → accepted → reviewing → scoring → summary → closed
```

迁移表（当前状态 -[事件]-> 新状态）：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 抽取专家 | 回避过滤（avoidOrgs ∪ 已报名投标人机构）；随机抽取；指定组长 | extracting→notified | 招标人/代理 |
| notified | 短信通知 | 沙箱写 SMS_LOG | notified | 系统 |
| notified | 专家接受 | owner | accepted | 专家(owner) |
| notified | 专家拒绝 | 记录原因；标记补抽 | declined | 专家(owner) |
| accepted | 全员接受+签到+选组长 | - | reviewing | 专家 |
| reviewing | 启动评分 | 标段=evaluating | scoring | 招标人/专家 |
| scoring | 专家评分提交 | 仅评自己的 task；读 Package.scoreItems | scoring（更新某 task submitted） | 专家(owner) |
| scoring | 全部专家提交 | - | summary | 系统 |
| summary | 组长设基准价+汇总 | basePriceType 按 Package 配置算价格分 | summary | 组长(leader) |
| summary | 生成报告+签名 | 基准价已设；价格分已算 | closed | 组长(leader) |

> 标段 Package 状态联动：Package=evaluating ↔ Evaluation 在 reviewing/scoring/summary。

---

## ③ Actor（谁做什么）

| 动作 | 招标人/代理 | 专家(owner) | 组长(leader) | 监督 |
|---|---|---|---|---|
| 抽取专家/组建委员会 | ● | · | · | · |
| 采集专家签名/启动评标 | ● | · | · | · |
| 接受/拒绝任务 | · | 自 | 自 | · |
| 签到/选组长 | · | 自 | 自 | · |
| 查阅资料（读 TenderDoc currentPublished + BidFile） | · | ●(reviewing) | ● | ○ |
| **评分** | · | **自** | 自 | · |
| 汇总/设基准价 | · | · | ● | · |
| 生成报告/电子签名 | · | · | ● | · |
| 查看候选人/报告 | ● | ○ | ●(导出) | ○ |
| 监督评标全过程 | ○ | ○ | ○ | ● |

> **核心**：专家仅能评分分配给自己的 ExpertTask（`task.expertId===currentUser`），不能替他人评分；汇总/生成报告仅组长（isLeader）。（P1-5）

---

## ④ Event（事件清单）

- `experts_extracted` 抽取专家
- `notified` 短信通知
- `accepted` / `declined` 专家接受/拒绝
- `checked_in` 签到 / `leader_selected` 选组长
- `evaluation_started` 启动评分
- `score_submitted` 专家评分提交
- `base_price_set` 组长设基准价
- `summarized` 汇总
- `report_generated` 生成报告
- `signed` 电子签名

> 事件≠状态：`report_generated`（事件）触发 summary→closed（状态）。

---

## ⑤ Rule（业务规则）

1. **评分项驱动规则**：专家评分页读 `Package.scoreItems`（TenderDoc 发布冻结快照），**不读草稿、不写死维度**。（P0-4）
2. **评分权限规则**：专家仅评 `task.expertId===currentUser` 的任务；不能替他人评分。
3. **汇总权限规则**：仅组长（isLeader）可设基准价、汇总、生成报告。
4. **基准价算法规则**：`basePriceType=lowest` 取 min(有效报价)；`=average` 取均值（可配置去高低）；价格分 `满分 - |price-base|/base×100×k`，下限 50%。（见 `05` §1.4）
5. **总分算法规则**：`总分 = Σ(itemScore/满分 × weight)`。
6. **回避规则**：抽取过滤 `avoidOrgs ∪ 本标段已报名投标人所属机构`。（P1-5）
7. **任务链路规则**：抽取→通知(notifiedAt)→接受/拒绝→评标，每步状态+时间戳；拒绝记录原因并标记补抽。（P1-5）
8. **全员前置规则**：组长汇总须所有专家已提交评分。

---

## ⑥ Question（待确认）

- **Q8** 评分项固定三类还是可自定义？（默认：可自定义 + price 必须）
- **Q9** 中标候选人推荐几名？（默认 1~3，招标文件可配）
- 专家拒绝后是否自动补抽？（默认：标记补抽，原型不自动）
- 基准价平均法是否去最高最低？（默认可配，待确认默认值）
- 价格分扣分系数 k 默认值？（默认 k=1）
- 经评审最低价法下 Evaluation 是否完全无 Score？（默认：仅资格审查+价格排序，无评分项）
- 组长是否参与评分？（默认参与，既是专家又是组长）
- 线下评标录入是否复用 Evaluation（offline）？（默认复用，另 offline 标记）
