# 业务对象：Objection（异议/质疑）

> 异议与质疑。投标人对招标文件/开标过程/中标候选人公示提出异议，招标方答复；评标质疑由投标人提出、专家答复。

---

## ① 业务对象

**定义**：投标人对招标活动各节点提出的异议/质疑及答复记录。

**字段**：

```
Objection {
  id*, packageId*（或 projectId）
  bidderId*, bidderName
  type*    enum    tender_doc（招标文件） | opening（开标过程） | candidate（候选人公示） | evaluation（评标质疑）
  subType  string  分类（技术/商务/其他）
  content*, attachments[]
  status*  enum    pending（待答复） | answered（已答复） | closed（已关闭）
  reply    text
  replyBy  string  答复人（招标方 / 评标专家）
  replyAt
  createdAt
}
```

**类型与节点**：

| type | 可提出节点 | 答复方 |
|---|---|---|
| tender_doc | 招标文件发布后 | 招标人/代理（→ 发澄清公告） |
| opening | 开标过程中 | 招标人/代理 |
| candidate | 候选人公示期 | 招标人/代理 |
| evaluation | 评标过程中 | 评标专家（转答复） |

---

## ② 生命周期

```
pending（待答复） → answered（已答复） → closed
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 提出异议 | 仅投标人；在允许节点 | pending | 投标人 |
| pending | 答复 | 招标方/专家 | answered | 招标方/专家 |
| answered | 关闭 | - | closed | 招标人/代理 |

> tender_doc 异议答复后触发 Notice(clarification) 发布。

---

## ③ Actor

| 动作 | 投标人 | 招标人/代理 | 专家 | 监督 |
|---|---|---|---|---|
| 提出异议 | ●(自) | · | · | · |
| 答复（tender/opening/candidate） | · | ● | · | · |
| 答复（evaluation 质疑） | · | ·(转) | ● | · |
| 查看 | ●(自) | ○ | ○(相关) | ○ |

---

## ④ Event

- `raised` 提出
- `answered` 答复
- `closed` 关闭
- `clarification_triggered` 触发澄清公告（tender_doc 类型）

---

## ⑤ Rule

1. **节点规则**：异议只能在对应节点提出（如 candidate 须在公示期）。
2. **答复方规则**：tender/opening/candidate 由招标方答；evaluation 由专家答。
3. **澄清触发规则**：tender_doc 异议答复后触发澄清公告发布。
4. **仅投标人可提规则**：异议提出方仅投标人（供应商）。

---

## ⑥ Question

- 各类异议的**时间窗口**？（候选人公示期、开标过程等具体时长需求未明确）
- 评标质疑是投标人对评分结果提出，还是对专家评分过程？（需求表述"对评标专家评标时提出的质疑进行答疑"，待确认主体）
- 异议未答复是否阻断后续流程？（默认：候选人公示异议未答复不阻断，但记录在案）
- 异议是否公开可见？（默认仅提出方与答复方+监督可见）
