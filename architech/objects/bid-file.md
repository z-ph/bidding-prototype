# 业务对象：BidFile（投标文件）

> P0 对象。投标文件的签章/加密/提交状态链是 P0-2、P0-3 的载体。
> **现状最大缺口**：状态散落在 `BidUpload.jsx` 的 `useState`，刷新即丢、开标/评标大厅读不到。本卡要求它成为持久化实体并入共享 store。

---

## ① 业务对象

**定义**：投标人在某标段下提交的整套投标文件，含文件清单、签章状态、加密状态、提交状态、报价快照、评审条款关联。挂在**标段**下（非项目下），归属某投标人。

**字段**：

```
BidFile {
  id*               string
  packageId*        string        所属标段（挂标段，非项目）
  bidderId*         string        投标人组织ID（owner 判定依据）
  fileList*         BidFileItem[] 文件清单
  clauseLinks       map<clauseId, fileName>   评审条款关联
  quoteSnapshot*    object        提交时冻结的开标一览表/报价快照
  signStatus*       enum          unsigned | signed
  encryptMethod*    enum          none | password | ca
  submitStatus*     enum          draft | submitted | decrypted | invalidated
  submittedAt       datetime
  receiptNo         string        正式回执编号（仅 CA 加密提交生成）
  version*          number        版本号（支持截止前撤回重传）
  decryptStatus*    enum          locked | decrypted   （开标大厅解密状态，owner 触发）
  ip, mac, fileHash string[]      （串标预警采集，见 P1-4）
  createdAt, updatedAt
}

BidFileItem {
  name*, type*, size*, signed: bool, signTime,
  encrypted: bool, encryptMethod, encryptTime
}
```

**与 OpeningSession 的边界**：BidFile 由投标人写（上传/签章/加密/提交/解密）；OpeningSession 只**读** BidFile.submitStatus/decryptStatus，不写 BidFile。

---

## ② 生命周期

状态链：

```
文件上传 → uploaded → signed → encrypted → submitted → decrypted
                                              ↘ (密码加密) 只能 draft，不可 submitted
                                   (异常/废标) → invalidated
```

迁移表（当前状态 -[事件]-> 新状态）：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 上传文件 | 仅投标人本人；标段状态=bid_open；已报名 | uploaded | 投标人(owner) |
| uploaded | 签章 | 单个文件签；须先有文件 | signed | owner |
| signed | 加密 | 选方式（password/ca）；须已签章 | encrypted | owner |
| encrypted(password) | 正式提交 | **阻断**（P0-3） | (拒绝) | - |
| encrypted(password) | 保存草稿 | - | draft | owner |
| encrypted(ca) | 正式提交 | 全部文件已签已加密(CA)；投标截止前 | submitted | owner |
| submitted | 撤回 | 投标截止前；owner | uploaded（可重传） | owner |
| submitted | 解密 | 标段状态=opening；owner | decrypted | owner |
| submitted | 标段异常终止 | - | invalidated | 系统 |

---

## ③ Actor（谁做什么）

| 动作 | 投标人(owner) | 招标人/代理 | 专家 | 监督 |
|---|---|---|---|---|
| 上传/签章/加密 | ● | · | · | · |
| 保存草稿(密码加密) | ● | · | · | · |
| 正式提交(CA加密) | ● | · | · | · |
| 撤回(截止前) | ● | · | · | · |
| 解密 | ●(仅opening阶段) | · | · | · |
| 查看提交状态/回执 | ● | ○(不查内容) | · | · |
| 查阅投标文件内容 | · | ·(评标时读) | ○(reviewing) | ○ |

> **核心**：解密动作的合法主体是 `BidFile.bidderId === 当前用户orgId`，与角色无关，仅在标段 opening 状态（`OpeningSession.state=decrypt`）。这是 P0-1 的根。

---

## ④ Event（事件清单）

- `uploaded` 上传文件
- `signed` 签章
- `encrypted` 加密（password/ca）
- `draft_saved` 保存草稿
- `submitted` 正式提交（生成回执）
- `withdrawn` 撤回
- `decrypted` 解密（开标时 owner 触发）
- `invalidated` 废标（异常终止）

> 事件≠状态：`submitted`（事件）触发 encrypted -> submitted（状态）。

---

## ⑤ Rule（业务规则）

1. **状态链串行规则**：uploaded→signed→encrypted→submitted，缺环节阻断（未签不可加密、未加密不可提交）。（P0-2）
2. **加密方式与提交资格**：`encryptMethod=password` 不可正式提交、不生成回执；`encryptMethod=ca` 可正式提交、生成回执。（P0-3）
3. **提交前置规则**：submit 须满足「全部文件已签章 + 全部文件 CA 加密 + 报价一览表已填」。
4. **回执规则**：仅 CA 加密 + submitted 生成 receiptNo；密码加密 draft 无回执。
5. **截止时间规则**：投标截止后不可上传/撤回/修改；submitStatus 锁定。
6. **解密权限规则**：解密仅 owner + 标段 opening + OpeningSession.state=decrypt，三者同时满足。（P0-1）
7. **持久化规则**：所有状态经 `bidFileStore` 持久化 localStorage，刷新不丢。
8. **owner 校验规则**：所有写动作在 store 层校验 `bidderId === currentUser.orgId`，UI 只触发不判断。

---

## ⑥ Question（待确认）

- 投标文件版本号规则：撤回重传是新版本还是覆盖？（默认：version+1，保留历史）
- 报价快照冻结时机：submit 时还是 uploaded 时？（默认：submit 时冻结 quoteSnapshot）
- 未报名/未缴费是否阻断上传？（默认：已报名才可上传；缴费是否前置待确认）
- 串标采集字段（ip/mac/fileHash）是否实现真实采集还是沙箱模拟？（默认沙箱模拟）
- 废标(invalidated)后是否允许投标人查看自己的文件？（默认可查看）
