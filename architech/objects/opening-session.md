# 业务对象：OpeningSession（开标会）

> P0 对象。开标大厅的签到/解密状态承载实体。P0-1 解密权限隔离的载体。
> **现状缺口**：`OpeningHall.jsx` 全程 `useState` 写死数据（attendees/bidders/bids），无 store，无 owner 维度判定。

---

## ① 业务对象

**定义**：某标段的一次线上开标会，含主持人/监督确认、签到队列、解密队列、唱标记录。一个 Package 对应一个 OpeningSession（询比价走 CompareSession，另立）。

**字段**：

```
OpeningSession {
  id*, packageId*
  hostId*            string        主持人账号（招标人/代理）
  supervisorIds[]    string        监督人账号
  signInList*        SignIn[]      签到队列（各角色，self 签自己）
  decryptList*       DecryptItem[] 解密队列（引用 BidFile，只读）
  record*            object        开标记录/唱标结果
  state*             enum          prepared | signing | decrypt | singing | closed
  offline            bool          是否线下开标（线下录入）
  openedAt, closedAt
}

SignIn { role*, name*, accountId*, status: unsigned | signed, time, self }
DecryptItem { bidderId*, bidFileId*, status: locked | decrypted, time, self }
```

**与 BidFile 的边界**：OpeningSession 的 decryptList **只读引用** BidFile（bidFileId/bidderId/decryptStatus）；解密动作由投标人 owner 触发写 BidFile.decryptStatus，OpeningSession 反映状态变化。

---

## ② 生命周期

状态链：

```
prepared → signing → decrypt → singing → closed
```

迁移表（当前状态 -[事件]-> 新状态）：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 确认主持人/监督 | 标段状态=pre_open；主持人=招标人/代理 | prepared | 招标人 |
| prepared | 开始签到 | - | signing | 主持人 |
| signing | 各角色签到 | 每人签自己 | signing | 各角色(self) |
| signing | 进入开标(解密) | 全员签到 OR 缺员二次确认 | decrypt | 主持人 |
| decrypt | 投标人解密 | BidFile.bidderId=owner；标段=opening | decrypt（更新某项 decrypted） | 投标人(owner) |
| decrypt | 全部解密/废标处理 | - | singing | 主持人 |
| singing | 结束开标 | 生成开标记录 | closed | 主持人 |

> 标段 Package 状态联动：Package=opening ↔ OpeningSession 在 signing/decrypt/singing。

---

## ③ Actor（谁做什么）

| 动作 | 招标人/代理(主持人) | 投标人 | 监督 | 专家 |
|---|---|---|---|---|
| 确认主持人/监督、管理监督账号 | ● | · | · | · |
| 开始签到/进入开标/结束开标 | ● | · | · | · |
| 签到 | ●(签自己) | 自 | 自 | · |
| **解密投标文件** | · | **自**(仅decrypt状态) | · | · |
| 查看解密状态 | ○ | ○(仅自己) | ○ | · |
| 标记解密失败为废标 | ● | · | ◐(登记异常) | · |
| 查看唱标/导出记录 | ● | ○(仅自己) | ○ | · |
| 监督全过程 | ○ | ○ | ● | · |

> **核心**：解密按钮渲染条件 = `state===decrypt && decryptItem.bidderId===currentUser.orgId`。招标人/代理/监督**无解密按钮**，只有状态展示。（P0-1）

---

## ④ Event（事件清单）

- `host_confirmed` 确认主持人/监督
- `signing_started` 开始签到
- `signed_in` 签到（每人签自己）
- `opening_entered` 进入开标（解密阶段），缺员需二次确认
- `decrypted` 解密（owner 触发）
- `bid_invalidated` 解密失败标废
- `singing_started` 进入唱标
- `opening_closed` 结束开标（生成记录）

> 事件≠状态：`decrypted`（事件）触发某 decryptItem locked→decrypted（状态）。

---

## ⑤ Rule（业务规则）

1. **解密权限规则**：解密仅 `BidFile.bidderId===currentUser.orgId` 且 `state===decrypt`；招标人/代理/监督无解密按钮。（P0-1）
2. **签到自我规则**：每个账号只能签到自己（SignIn.accountId===currentUser）。
3. **缺员开标规则**：签到不全时，主持人「进入开标」须二次确认，显示未签到名单。
4. **解密前置规则**：解密的 BidFile 须 `submitStatus===submitted`（未提交不可解密）。
5. **废标规则**：解密失败可标记为废标（BidFile→invalidated），需主持人操作或监督登记异常。
6. **唱标可见性规则**：唱标阶段各投标人可见自己的开标信息；最低价标红（询比价）。
7. **状态只读引用规则**：OpeningSession 不写 BidFile，只读其 submitStatus/decryptStatus；解密写动作落在 BidFile/owner。
8. **持久化规则**：OpeningSession 经 `openingStore` 持久化，刷新不丢签到/解密状态。

---

## ⑥ Question（待确认）

- 线下开标录入是否复用 OpeningSession（offline=true）还是独立对象？（默认复用，offline 标记）
- 缺员开标后，未签到投标人的投标文件如何处理？（默认：标记但可补签，或按弃权）
- 解密失败的投标人是否有申诉通道？（需求未明确）
- 开标记录是否需要所有到场角色电子签名？（需求提到专家签名，开标主持人签名待确认）
- 询比价的 CompareSession 与 OpeningSession 字段差异（多轮报价），是否合并？（默认独立，另立 CompareSession）
