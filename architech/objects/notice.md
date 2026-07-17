# 业务对象：Notice（交易公告）

> 交易公告，6 类，关联标段，由招标人/代理在交易系统发布、门户透出。
> 与 PortalContent（新闻/系统公告/法规）不同：Notice 关联 packageId、招标方发布。
> **现状缺口**：`notices.js` 只有 draft/published/withdrawn 三态，缺 changed/clarification/archived 与异常公告（abnormal），且关键信息曾堆富文本。

---

## ① 业务对象

**定义**：招投标全流程中需对外公示的公告，按业务节点分 6 类，关联标段。门户与交易系统同一数据源（Q14）。

**字段**：

```
Notice {
  id*, packageId*             关联标段（异常公告可关联 projectId）
  type*  enum    tender | change | clarification | candidate | award | abnormal
  title*, content*
  structuredFields* object    结构化字段（项目名/编号/开标与截止时间/评标方法/开标一览表）
                             -- 禁止用富文本承载这些
  changeReason   string       变更公告必填
  status* enum    draft | published | changed | withdrawn | archived
  publishTime, withdrawTime
  attachments[]  FileRef
  publisherId*
}
```

**6 类与业务节点**：

| type | 节点 | 触发 |
|---|---|---|
| tender | 发标 | 标段 draft→bidding |
| change | 招标文件/公告变更 | TenderDoc 发新版本 |
| clarification | 招标文件质疑澄清 | 质疑答复 |
| candidate | 评标后 | Evaluation closed |
| award | 定标后 | Award 确认 |
| abnormal | 终止/中止/重新招标 | Abnormal 触发 |

**与 PortalContent 边界**：Notice 关联 packageId、招标方发；PortalContent 不关联标段、管理员发。不混。

---

## ② 生命周期

状态链：

```
draft → published → changed（发变更后原公告）
                 → withdrawn
       (任意 published/changed) → archived（标段归档时）
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 起草 | 仅招标人/代理 | draft | 招标人/代理 |
| draft | 发布 | structuredFields 齐全；标段状态匹配 | published | 招标人/代理 |
| published | 发变更 | changeReason 必填 | changed（原）+ 新建 change 公告 published | 招标人/代理 |
| published | 撤回 | 标段未到下一节点 | withdrawn | 招标人/代理 |
| published | 发澄清 | 质疑已答复 | published（原不变）+ 新建 clarification published | 招标人/代理 |
| published/changed | 标段归档 | - | archived | 系统 |

> 澄清公告（clarification）作为独立 Notice，不改原公告状态，仅关联 packageId。

---

## ③ Actor

| 动作 | 招标人/代理 | 投标人 | 游客 | 管理员 |
|---|---|---|---|---|
| 起草/发布/变更/撤回 | ● | · | · | · |
| 发澄清（质疑答复后） | ● | · | · | · |
| 浏览详情/公开附件 | ○ | ○ | ○ | ○ |
| 报名期内「立即报名」 | · | ● | (引导登录) | · |
| 查看（含 withdrawn） | ○ | ·(withdrawn 不可见) | ·(withdrawn 不可见) | ○ |

---

## ④ Event

- `drafted` 起草
- `published` 发布
- `changed` 发变更（changeReason）
- `clarified` 发澄清
- `withdrawn` 撤回
- `archived` 归档

> 事件≠状态：`changed`（事件）触发 published→changed（状态）并新建变更公告。

---

## ⑤ Rule

1. **结构化规则**：关键信息（名称/编号/开标与截止时间/评标方法/开标一览表）必须结构化，禁止富文本承载。（评审反思根因）
2. **变更原因规则**：change 类型必填 changeReason。
3. **可见性规则**：draft/withdrawn 仅招标方+管理员可见；published/changed 对公众可见。
4. **单数据源规则**：门户与交易系统同一 Notice，不存在两份（Q14）。
5. **撤回窗口规则**：撤回仅在标段未进入下一节点前可用。
6. **节点匹配规则**：type 须与标段状态匹配（如 candidate 须 Evaluation closed 后才能发）。

---

## ⑥ Question

- **Q14** 门户公告与交易系统公告是否同一数据源？（默认是）
- 异常公告（abnormal）挂在 Notice 还是独立 Abnormal 实体？（默认：Abnormal 为业务实体，abnormal Notice 是其公示投影，两者关联）
- 澄清公告是否需要投标人主动触发（质疑）才能发，还是招标方可主动发？（默认：可主动，但通常由质疑触发）
- 变更公告发布后，已报名投标人的投标文件是否受影响？（默认：视变更内容，重大变更可延长投标截止）
- 公告是否支持多标段合并发布？（默认：一公告一标段，项目级汇总另列）
