# 业务对象：BidQuote（报价）

> 投标人的报价，含开标一览表与分项报价，询比价支持多轮。
> 字段由 Package.quoteFields（TenderDoc 发布配置）驱动，非写死。（P1-2）

---

## ① 业务对象

**定义**：投标人在某标段下的报价信息。招标类作为 BidFile 的 quoteSnapshot；询比价类作为独立 BidQuote（支持多轮）。字段模板来自 Package.quoteFields。

**字段**：

```
BidQuote {
  id*, packageId*, bidderId*
  round*        number        报价轮次（招标类=1；询比价可多轮）
  fields*       map<fieldKey, value>   报价字段（key 来自 Package.quoteFields）
  items*        QuoteItem[]   分项报价（名称/规格/数量/单位/单价/小计）
  totalPrice*   number        总价（= Σ items 小计，或 fields.totalPrice）
  status*       enum          draft | submitted
  submittedAt
}

QuoteItem { name*, spec*, quantity*, unit*, price*, subtotal* }
QuoteField { key*, label*, unit, required* }   // 来自 Package.quoteFields
```

**与 Package 的边界**：Package.quoteFields 是模板（招标方配置），BidQuote.fields 是实例（投标方填值）。

---

## ② 生命周期

招标类（单轮）：

```
draft → submitted（随 BidFile 提交冻结为 quoteSnapshot）
```

询比价类（多轮）：

```
round1: draft → submitted → (开启二轮) → round2: draft → submitted → ... → 确定
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 填写报价 | 字段来自 Package.quoteFields | draft | 投标人(owner) |
| draft | 提交（招标类） | 必填字段齐全；随 BidFile submit | submitted（冻结） | owner |
| draft | 提交（询比价 round N） | 报价窗口开放 | submitted | owner |
| round N submitted | 开启 round N+1 | 主持人决定二次报价 | round N+1 draft | 招标人 |
| 最终轮 submitted | 确定供应商 | - | (转 Award) | 招标人 |

---

## ③ Actor

| 动作 | 投标人 | 招标人/代理 | 监督 |
|---|---|---|---|
| 填写/提交报价 | ●(owner) | · | · |
| 查看自己报价 | ● | · | · |
| 查看报价企业数量（截止前） | · | ○(仅数量) | ○ |
| 多维比价/最低价标红（截止后） | · | ● | ○ |
| 开启二次报价 | · | ● | · |
| 确定供应商 | · | ● | · |

> **Q3**：报价过程中是否互相可见？默认：过程中不可见，轮次结束后对参与方可见金额。

---

## ④ Event

- `quoted` 填写报价
- `submitted` 提交（冻结）
- `round_reopened` 开启下一轮（询比价）
- `supplier_determined` 确定供应商

---

## ⑤ Rule

1. **字段驱动规则**：报价表单字段读 Package.quoteFields，非写死默认 4 项。（P1-2）
2. **冻结规则**：submitted 后 fields/items 冻结为 quoteSnapshot。
3. **可见性规则**：截止前只可见报价**数量**不可见金额；截止后可见金额，最低价标红。
4. **多轮规则**：询比价可多轮，每轮独立 BidQuote（round 递增）；招标类仅 1 轮。
5. **总价一致规则**：totalPrice 须与 Σ items.subtotal 一致（或取 fields.totalPrice），不一致校验提示。

---

## ⑥ Question

- **Q3** 二次报价是否所有供应商参与？金额是否互相可见？过程可见还是轮次结束可见？
- 报价字段模板（quoteFields）由谁配置、何时冻结？（默认：招标方在 TenderDoc 配置，发布冻结）
- 询比价最多几轮？（需求未明确，默认不设上限由主持人决定）
- 确定供应商可否多名？（Q9，默认可按分数量中标多名）
