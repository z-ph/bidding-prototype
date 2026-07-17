# 业务对象：Abnormal（异常）

> 招标异常：终止/中止/重新招标。对已投投标文件、已缴费用的处理见 Q12。
> Abnormal 是业务实体，abnormal Notice 是其公示投影（两者关联）。

---

## ① 业务对象

**定义**：标段在招标过程中发生的异常事件，分终止/中止/重新招标三类，影响投标文件与费用状态。

**字段**：

```
Abnormal {
  id*, packageId*
  type*   enum    terminate（终止） | suspend（中止） | retrial（重新招标）
  reason*         text    异常原因（必填）
  raisedBy*       string  提出人（招标人/代理；监督登记）
  approverId      string  审批人（管理员/招标人确认）
  status* enum    pending（待确认） | effective（已生效） | resolved（已处理）
  effectOnFees    enum    refund_pending（待退还） | refunded   对费用影响
  effectOnBids    enum    invalidated（废标） | frozen（冻结）   对投标文件影响
  createdAt, effectiveAt
}
```

**与 Notice 的边界**：Abnormal 是业务实体（含费用/标书处理逻辑）；Notice(abnormal) 是公示投影。触发 Abnormal 生效时同步发 abnormal Notice。

---

## ② 生命周期

```
pending（登记待确认） → effective（生效） → resolved（处理完成）
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 登记异常 | reason 必填；监督登记或招标方发起 | pending | 监督/招标人 |
| pending | 确认生效 | 管理员/招标人确认 | effective | 管理员/招标人 |
| effective | 终止处理 | BidFile→invalidated；Payment→refund_pending | resolved | 系统 |
| effective | 中止恢复 | 回原状态（Package 解冻） | resolved | 招标人 |
| effective | 重新招标 | Package→draft 新版本；保留历史 | resolved | 招标人 |

> 监督人「叫停」= 登记 Abnormal(pending)，需管理员/招标人确认才 effective，监督人不直接改业务状态。（Q5）

---

## ③ Actor

| 动作 | 监督 | 招标人/代理 | 管理员 |
|---|---|---|---|
| 登记异常（叫停） | ● | ● | · |
| 确认生效 | ◐(登记) | ◐(确认) | ◐(确认) |
| 处理（终止/恢复/重新招标） | · | ● | · |
| 退还费用（状态记录） | · | ○ | ● |

---

## ④ Event

- `raised` 登记
- `approved` 确认生效
- `terminated` 终止处理
- `resumed` 中止恢复
- `retrialed` 重新招标
- `notice_published` 发异常公告

---

## ⑤ Rule

1. **叫停模型规则**：监督人登记 Abnormal=pending，需管理员/招标人确认才 effective，监督人不直接改业务状态。（Q5）
2. **终止规则**：terminate → BidFile→invalidated；Payment(deposit)→refund_pending。（Q12）
3. **中止规则**：suspend → 流程冻结，可恢复回原状态。
4. **重新招标规则**：retrial → Package→draft 新版本号，保留历史。
5. **公示规则**：effective 时同步发 Notice(abnormal)。
6. **费用影响规则**：终止的保证金标记待退还；退还仅做状态记录，不实现真实退款。（Q11）

---

## ⑥ Question

- **Q5** 监督人能否叫停？（默认：登记异常需确认，不直接改业务状态）
- **Q12** 异常对已投投标文件、已缴费用如何处理？（默认：终止废标+保证金待退；中止冻结；重新招标回 draft）
- 重新招标是否重新发标+重新投标，还是沿用原投标文件？（默认：重新走完整流程）
- 中止最长期限？（需求未明确）
- 异常确认权限是管理员还是招标人？（默认两者均可确认）
