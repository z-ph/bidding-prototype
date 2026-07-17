# 业务对象：Payment（费用）

> 费用管理：招标文件费 / 保证金 / 平台使用费。需求明确为「线下缴纳，在线提交凭证待审核」。
> 连接 BidFile（缴费前置）与 Abnormal（终止退款）。原 `01` Q11 的载体。

---

## ① 业务对象

**定义**：投标人在某标段下的某类费用缴纳记录，含凭证与审核状态。

**字段**：

```
Payment {
  id*, packageId*, bidderId*
  type*   enum    filefee（招标文件费） | deposit（保证金） | platformfee（平台使用费）
  amount* number
  method* enum    offline_voucher（线下凭证）   // 原型仅此；线上支付预留
  voucherFile  FileRef            缴费凭证
  status* enum    pending（待审核） | verified（已核实） | rejected（已驳回） | refund_pending（待退还） | refunded（已退还）
  verifiedBy, verifiedAt
  rejectReason  string
  refundMarkedAt               终止异常时标记
  createdAt
}
```

**与 BidFile/Abnormal 的边界**：Payment 是缴费凭证记录；BidFile 的上传/提交可前置依赖 Payment(type) verified；Abnormal 终止时把 deposit Payment 标记 refund_pending。

---

## ② 生命周期

```
pending（待审核） → verified（已核实） 
                ↘ rejected（驳回，可重传）
       verified(deposit) → [异常终止] → refund_pending → refunded
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 提交凭证 | 凭证文件已传 | pending | 投标人(owner) |
| pending | 审核通过 | 金额/凭证合规 | verified | 招标人/代理 |
| pending | 驳回 | 填驳回原因 | rejected | 招标人/代理 |
| rejected | 重新提交 | 补凭证 | pending | 投标人(owner) |
| verified(deposit) | 标段异常终止 | Abnormal.type=terminate | refund_pending | 系统 |
| refund_pending | 标记已退 | - | refunded | 管理员 |

---

## ③ Actor

| 动作 | 投标人 | 招标人/代理 | 管理员 | 监督 |
|---|---|---|---|---|
| 缴费/传凭证 | ●(自) | · | · | · |
| 审核（通过/驳回） | · | ● | · | · |
| 标记退款（终止时） | · | · | ● | · |
| 查看缴费状态 | ●(自) | ○ | ○ | ○ |

---

## ④ Event

- `submitted` 提交凭证
- `verified` / `rejected` 审核
- `resubmitted` 重新提交
- `refund_marked` 标记待退（异常终止）
- `refunded` 已退还

---

## ⑤ Rule

1. **线下凭证规则**：原型仅 offline_voucher；线上支付通道预留不实现。
2. **费用前置规则（可配）**：filefee verified 前不可下载收费招标文件；deposit verified 前不可提交投标文件（是否前置待 Q11 确认）。
3. **审核三态规则**：通过/驳回，驳回须填原因，可重传。
4. **退款规则**：仅 deposit 在异常终止时 refund_pending→refunded；**仅状态记录，不实现真实退款通道**。（Q11）
5. **发票规则**：filefee 可申请发票（关联 BidderInvoices）。

---

## ⑥ Question

- **Q11** 保证金线上还是线下？退保证金流程？（默认线下凭证+线上审核；退还仅状态记录）
- 缴费是否为投标前置？（默认 filefee 前置下载、deposit 前置提交，可配）
- 平台使用费缴纳主体是投标人还是招标人？（需求写「投标人在线缴纳」，待确认）
- 发票申请范围？（仅 filefee 还是含其他）
