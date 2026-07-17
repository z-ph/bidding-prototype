# 支撑对象（Platform Infrastructure）

> 这些对象支撑平台运行，但**非核心招投标业务流转对象**，业务生命周期简单（多为 CRUD + 启停）。
> 此处给出精简模型与范围界定，不展开完整六面卡。核心业务对象见其他卡。

---

## 范围界定

| 类别 | 对象 | 是否建模 | 说明 |
|---|---|---|---|
| 组织权限 | Organization, User | 精简 | 组织树+账号+角色，CRUD 为主 |
| 审计 | AuditLog | 精简 | 全操作留痕，只追加 |
| 配置 | Dictionary, Template | 精简 | 字典/模板，CRUD |
| 分析 | WinRecord, CollusionAlert | 精简 | 串标预警见 `05` §4，WinRecord 是中标成交清单 |
| 会话 | LoginSession | 精简 | 登录/CA 绑定，非业务实体 |

> 这些对象的核心规则已在相关文档定义（权限见 `04`、数据范围见 Supplier 卡 Q10、串标见 `05` §4），此处只补字段与极简生命周期。

---

## Organization（组织机构）

```
Organization {
  id*, name*, type: tenderee|agent|bidder|expert|admin
  parentId       string         组织树父节点
  dataScope*     enum           self|dept|company|all   // 数据隔离（Q10）
  admissionStatus enum          pending|approved|rejected  // 注册审核
  departments[], roles[]
}
```
- 生命周期：pending → approved → (frozen) → deregistered（同 Supplier 模式）。
- Rule：注册审核由管理员；数据范围作用于项目/公告列表过滤。
- Actor：管理员维护；招标人/代理/投标人在其组织内操作。

## User（用户账号）

```
User {
  id*, username*, name*, orgId*, role*
  phone, email, caBound: bool
  status: active|disabled
  subAccounts[]   // 子账号
}
```
- 生命周期：active ↔ disabled。
- Rule：角色决定页面权限（`permissions.js` PAGE_PERMISSIONS）；CA 绑定后可一键登录（沙箱）。
- Actor：管理员管理账号；用户改自己密码/绑 CA。

## AuditLog（操作日志）

```
AuditLog {
  id*, userId*, role*, action*, entityType, entityId
  fromState, toState   // 状态迁移留痕
  detail, ip, createdAt
}
```
- 生命周期：只追加（append-only），无修改。
- Rule：**所有状态迁移 + 敏感操作**写日志；管理员可查；短信/邮件发送记录同此。
- Actor：各角色操作触发；管理员/监督查看。

## Dictionary / Template（参数字典/模板）

```
Dictionary { id*, type: tree|list, key*, label*, parentId }   // 树形：标段分类/资质类别/项目类型
Template  { id*, type: invitation|award_notice|receipt, name*, content* }
```
- 生命周期：CRUD。
- Rule：字典供各对象下拉引用；模板供邀请书/通知书/回执生成。
- Actor：管理员维护。

## WinRecord（中标成交清单）/ CollusionAlert（串标预警）

```
WinRecord { id*, packageId*, winnerBidderId*, amount*, winDate, category, matchedFromNotice: bool }
CollusionAlert { id*, packageId*, type: ip_mac|hash|quote|contact, level: high|mid, bidders[], detail, status: open|handled, handledBy }
```
- 生命周期：WinRecord 由 Award 归档时生成；CollusionAlert 由串标引擎生成（`05` §4）→ open → handled。
- Rule：WinRecord 按中标日历匹配；可分类汇总导出；CollusionAlert 推送监督+管理员，人工处置。
- Actor：管理员查看/导出；监督处置预警。

## LoginSession（登录会话）

```
LoginSession { id*, userId*, loginMethod: account|phone|ca, loginAt, expireAt }
```
- 生命周期：创建 → 过期/登出。
- Rule：支持账号/手机验证码/CA 三方式；CA 沙箱模拟 UKey 检测。
- Actor：各角色登录。

---

## 与核心对象的关系

- Organization ←→ Supplier/Expert（归属）
- Organization.dataScope → 作用于 Project/Notice 列表过滤
- AuditLog ← 所有核心对象状态迁移（跨切关注点）
- Dictionary → 供 Package/Project/Supplier 下拉引用
- WinRecord ← Award；CollusionAlert ← BidFile/BidQuote（串标引擎读）
- LoginSession ← User

## 待确认

- 数据隔离粒度（Q10，默认四档）
- 串标规则（Q4，见 `05` §4，🔴）
- 日志保留期限？（需求未明确）
- 字典分类是否需多级树？（默认支持多级）
