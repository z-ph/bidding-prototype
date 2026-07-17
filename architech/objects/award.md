# 业务对象：Award（中标/定标）

> 定标结果对象。评标产出候选人 → 公示 → 确认中标人 → 发通知书 → 合同归档。

---

## ① 业务对象

**定义**：某标段的中标结果，含候选人名单、中标人、通知书、关联合同。一个 Package 对应一个 Award（可含多名候选人）。

**字段**：

```
Award {
  id*, packageId*
  candidates*    AwardCandidate[]   候选人（来自 EvaluationResult.ranking）
  winnerBidderId* string            中标人
  noticeSentAt   datetime           中标通知书发送时间
  noticeContent  text               通知书内容
  contractId     string             关联合同
  status* enum   pending（待确认） | notified（已发通知） | contracted（已签合同） | archived
  confirmedAt
}
AwardCandidate { id*, bidderId*, rank*, totalScore*, amount*, recommend }
```

**与 Evaluation 的边界**：Evaluation 产出 ranking（候选人排序）；Award 消费 ranking，招标方从中确认中标人。

---

## ② 生命周期

```
pending（候选人公示中） → notified（已确认+发通知书） → contracted（合同归档） → archived
                                ↘ (跳过合同) → archived
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 评标结束生成候选人 | Evaluation closed | pending | 系统 |
| pending | 候选人公示 | Notice(candidate) 发布（可跳过） | pending | 招标人/代理 |
| pending | 确认中标人 | 从 candidates 选 1（或多） | notified | 招标人/代理 |
| notified | 发中标通知书 | - | notified | 招标人/代理 |
| notified | 合同归档 | Contract 上传 | contracted | 招标人/代理 |
| notified | 跳过合同 | Q13 | archived | 招标人/代理 |
| contracted | 归档完成 | - | archived | 系统 |

> 候选人公示可跳过（需求明确）；合同归档可跳过（Q13）。

---

## ③ Actor

| 动作 | 招标人/代理 | 投标人 | 监督 | 管理员 |
|---|---|---|---|---|
| 候选人公示 | ● | ○(看公示) | ○ | ○ |
| 确认中标人 | ● | · | · | · |
| 发中标通知书 | ● | ○(收通知) | · | · |
| 合同归档 | ● | · | · | · |
| 查看中标结果 | ● | ○(看是否中标) | ○ | ○ |

---

## ④ Event

- `candidates_generated` 生成候选人
- `candidate_publicized` 公示
- `winner_confirmed` 确认中标人
- `notice_sent` 发通知书
- `contract_archived` 合同归档

---

## ⑤ Rule

1. **候选人来源规则**：candidates 来自 EvaluationResult.ranking，不可手动编造。
2. **公示可跳过规则**：候选人公示步骤可跳过，直接确认中标人。
3. **确认规则**：中标人须从 candidates 中选；选多名须 Q9 明确。
4. **通知书规则**：确认后发通知书，中标人收到通知。
5. **合同跳过规则**：合同归档可跳过，跳过直接 archived（Q13）。
6. **结果公示规则**：中标结果发 Notice(award) 公示。

---

## ⑥ Question

- **Q9** 候选人推荐几名？公示几名？可中标多名？（默认 1~3 推荐，公示全部，选 1 或多）
- **Q13** 合同归档跳过时流程如何终止？（默认直接 archived，合同字段空+标记未归档）
- 未中标供应商是否有正式通知？（需求未明确，默认仅中标通知）
- 中标结果公示期是否有异议窗口？（与 Objection 关联，待确认时长）
