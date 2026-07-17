# 05 - 核心业务规则与算法

> 本篇定义需要**精确实现并验收**的业务规则。每条规则给出：输入、算法、输出、验收用例。
> 这些是平台「专业性」的体现，不能靠 UI 文案蒙混。

---

## 1. 评标办法与评分驱动 ★ P0-4

### 1.1 办法类型

| 办法 | 配置项 | 价格分计算 | 适用 |
|---|---|---|---|
| 综合评分法（最低价基准） | scoreItems[] + basePriceType=lowest | 最低价为基准，偏离扣分 | 招标类 |
| 综合评分法（平均价基准） | scoreItems[] + basePriceType=average | 有效报价均值为基准 | 招标类 |
| 经评审最低价法 | 仅资格审查 + 价格 | 最低价中标 | 货物类常用 |
| 手工输入 | 无自动计算 | 专家直接录入总分 | 兜底 |

### 1.2 评分项配置模型

```
ScoreItem {
  id*, name*, weight* (0-100), 
  type: business | tech | price,
  scoringRule: 描述性评分规则文本
}
约束: Σ weight = 100; type=price 的项必须且仅有一个（综合评分法）
```

### 1.3 配置->评分页 驱动链

```
招标文件编辑 (scoreItems 可改)
    │ 发布（status: editing -> published）
    ▼
scoreItems 冻结 → 快照写入 Package.scoreItems
    │ 启动评标
    ▼
专家评分页 读 Package.scoreItems（不是读草稿）
    │ 逐项打分
    ▼
专家提交 Score { itemId, score }
    │ 全部专家提交
    ▼
组长汇总：总分 = Σ(score/满分 × weight)
    │ 组长确认基准价
    ▼
价格分自动计算（见 1.4）→ 生成排名 → EvaluationResult
```

### 1.4 价格分算法（综合评分法）

```
输入：有效报价列表 prices[]，basePriceType
基准价 basePrice：
  - lowest:  basePrice = min(prices)
  - average: basePrice = avg(prices)  // 可配置去掉最高最低后取均

价格得分（线性扣分，扣分系数 k，默认 k=1）：
  score_price = 满分 - |price - basePrice| / basePrice × 100 × k
  下限为 0（不低于满分×50% 时取实际，否则取 50%）

输出：每个投标人的价格分
```

### 1.5 验收用例

| # | 操作 | 预期 |
|---|---|---|
| A4-1 | 招标文件配置评分项「商务40/技术30/价格30」并发布 | 专家评分页显示这 3 项，权重 40/30/30 |
| A4-2 | 发布后改评分项为「商务50/技术50」 | 专家页**不变化**（读的是发布快照） |
| A4-3 | 三家报价 100/110/120，平均价基准 | 基准价=110，100 偏低 9.09%，120 偏高 9.09%，价格分相同 |
| A4-4 | 专家评分后组长汇总 | 总分=Σ(归一化×权重)，排名生成 |
| A4-5 | 选经评审最低价法 | 专家页无评分项，仅资格审查+价格排序 |

---

## 2. 投标文件加密链 ★ P0-2 / P0-3

### 2.1 状态链规则（见 `03` §3）

```
uploaded -> signed -> encrypted -> submitted -> decrypted
```

### 2.2 加密方式与提交资格

| 加密方式 | 状态可达 | 可正式提交 | 生成回执 | 适用 |
|---|---|---|---|---|
| password | encrypted(draft) | **否** | 否 | 草稿/演示/无CA企业预填 |
| ca | encrypted | 是 | 是（含回执号） | 正式投标 |

### 2.3 规则约束（代码层）

```
submit(BidFile):
  if encryptMethod !== 'ca':
    reject("正式提交必须使用 CA 证书加密")
  if any item not encrypted:
    reject("存在未加密文件")
  if not all items signed:
    reject("存在未签章文件")
  BidFile.submitStatus = 'submitted'
  BidFile.submittedAt = now
  BidFile.receiptNo = generateReceiptNo()    // 仅此时生成
```

### 2.4 CA 沙箱模型（原型）

```
CA 检测：沙箱环境模拟 UKey 检测
  - 未检测到：提示「请插入 CA UKey」
  - 检测到：返回模拟证书信息（机构名、有效期）
CA 加密：模拟加密，标记 encryptMethod='ca'，不进行真实加密运算
解密：开标大厅模拟解密，校验 BidFile.encryptMethod==='ca' && submitStatus==='submitted'
```

### 2.5 验收用例

| # | 操作 | 预期 |
|---|---|---|
| A2-1 | 上传文件未签章直接加密 | 阻断，提示先签章 |
| A2-2 | 密码加密后点正式提交 | 阻断，提示需 CA 加密 |
| A2-3 | 密码加密保存草稿 | 成功，无回执号 |
| A2-4 | CA 加密全部文件后正式提交 | 成功，生成回执号 |
| A2-5 | 提交后刷新页面 | 状态保持 submitted（store 持久化） |
| A2-6 | 截止时间后撤回 | 阻断 |

---

## 3. 文件版本统一链 ★ P1-3

### 3.1 问题

现状：招标文件页附件版本、投标人下载页版本、专家查阅页版本**三处不一致**。

### 3.2 单一版本源规则

```
TenderDoc.versions[] 是唯一版本源
  ├─ currentPublished: 指向已发布版本（单一锚点）
  │
  ├─ 招标文件页：展示所有版本，编辑草稿版本
  ├─ 投标人下载页（BidDownload）：读 currentPublished 版本
  └─ 专家查阅页（ExpertProject）：读 currentPublished 版本
```

### 3.3 版本号规则

```
初始: V1.0
基于 V1.0 修订: V1.1
发重大变更（可选）: V2.0
currentPublished 始终指向最新的 status=published 版本
```

### 3.4 变更通知规则

```
招标文件发布变更（新 published 版本）→
  所有已报名投标人收到通知（消息中心）
  BidDownload 页显示「有新版本 V1.1」
  旧版本保留可查但标记「已变更」
```

### 3.5 验收用例

| # | 操作 | 预期 |
|---|---|---|
| B3-1 | 招标文件发新版本 | 下载页、专家查阅页都显示新版本号 |
| B3-2 | 三处读取版本号 | 完全一致 |
| B3-3 | 已报名投标人 | 收到版本变更通知 |

---

## 4. 串标围标预警 ★ P1-4

### 4.1 判定维度（⚠ 待确认，见 `01` Q4）

本设计提出三维度，阈值可配，演示环境用宽松值：

| 维度 | 数据来源 | 判定规则 | 预警级别 |
|---|---|---|---|
| IP/MAC 去重 | 投标上传时采集（沙箱模拟） | 同一 IP/MAC 出现 ≥2 家投标人 | 高危 |
| 文件哈希 | BidFile 文件清单 hash | ≥2 家投标文件存在相同 hash 的文件 | 高危 |
| 报价离散度 | BidQuote 报价 | 报价方差极小（偏离均值<2%）或呈规律性等差 | 中危 |
| 联系信息重复 | 投标人档案 | 联系电话/邮箱/法人重叠 | 中危 |

### 4.2 预警引擎

```
输入：某标段所有 BidFile + BidQuote + 投标人档案
处理：
  hits = []
  for each bidder pair (a, b):
    if sameIpOrMac(a, b): hits.push({type:'ip_mac', a, b, level:'high'})
    if sharedFileHash(a, b): hits.push({type:'hash', a, b, level:'high'})
    if quoteDeviation < 2%: hits.push({type:'quote', level:'mid'})
  ...
输出：预警报告 { packageId, hits[], generatedAt }
```

### 4.3 展示与处置

- 预警在「采购数据分析」模块展示，不自动废标。
- 高危预警推送给监督人 + 管理员，由人工处置（登记异常或忽略）。
- 留痕：预警生成与处置均写 AuditLog。

### 4.4 验收用例

| # | 场景 | 预期 |
|---|---|---|
| B4-1 | 两家投标人上传 IP 相同 | 生成高危预警 |
| B4-2 | 报价 100/101/102 | 生成中危预警（等差规律） |
| B4-3 | 正常三家报价差异大 | 无预警 |
| B4-4 | 监督人查看 | 可见预警列表并可处置 |

---

## 5. 专家抽取与回避 ★ P1-5

### 5.1 抽取算法

```
输入：{ packageId, fields[], count, avoidOrgs[] }
候选池 = Expert.filter(e => 
  fields.includes(e.field) &&
  !isAvoided(e)
)
isAvoided(e):
  avoidOrgs.includes(e.org)                      // 招标人/代理指定回避
  || e.avoidOrgs.some(o => avoidOrgs.includes(o)) // 专家主动回避
  || 本标段已报名投标人所属机构.includes(e.org)    // Q7 自动回避
不足时：从非回避专家中补足
随机：Fisher-Yates 洗牌后取前 count 名
输出：EvaluationCommittee { experts[], leaderId(随机指定或最大资深度) }
```

### 5.2 通知链路

```
抽取确认 →
  ExpertTask.status = 'notified'
  ExpertTask.notifiedAt = now
  短信通知（沙箱：写 SMS_LOG，不发真实短信）
专家登录 →
  工作台显示「待接受任务」
  ExpertTask.status: notified -> accepted | declined
接受后 →
  进入评标流程
```

### 5.3 验收用例

| # | 操作 | 预期 |
|---|---|---|
| B5-1 | 抽取时某专家属已报名投标人机构 | 被过滤，不出现 |
| B5-2 | 专家收到任务 | 工作台有待接受任务，含项目/抽取批次/时间 |
| B5-3 | 专家拒绝 | 状态 declined，记录原因 |
| B5-4 | 专家接受并进入评标 | 状态 accepted -> evaluating |

---

## 6. 标段预算联动校验 ★ P1-6

```
输入：Project.budget, Package[].budget
校验：
  Σ Package.budget <= Project.budget  → 否则阻断发标
  每个 Package 非空（name/budget/procurementMethod 必填） → 否则阻断
输出发标时：写校验通过记录
```

验收：标段合计 > 项目预算 -> 提示并禁用下一步；空白标段不可提交。

---

## 7. 报价字段继承 ★ P1-2

```
Package.quoteFields (招标文件发布时配置) 
  → BidUpload/BidQuote 读取作为报价表单字段
  → 缺失时回退默认字段（totalPrice/delivery/quality/payment）
  → 提交时 BidQuote.quoteSnapshot 冻结当前值
```

验收：招标文件配置报价字段为「总价/交货期/质保期」-> 投标人报价页显示这 3 项，非默认 4 项。

---

## 8. 规则汇总与验收映射

| 规则 | 优先级 | 验收文档 |
|---|---|---|
| 评标办法驱动评分 | P0 | `08-A4` |
| 加密链闭环 | P0 | `08-A2` |
| 加密规则一致性 | P0 | `08-A3` |
| 文件版本统一链 | P1 | `08-B3` |
| 串标预警 | P1 | `08-B4` |
| 专家抽取回避 | P1 | `08-B5` |
| 标段预算联动 | P1 | `08-B6` |
| 报价字段继承 | P1 | `08-B2` |
