# 业务对象：Supplier（供应商/投标人机构）

> 供应商全生命周期：注册→准入审核→入库→冻结→黑名单→注销。
> 现状有 SupplierProfile/Organization 部分实现，缺黑名单/考核/状态链。

---

## ① 业务对象

**定义**：投标人/供应商机构，含企业资质、准入状态、考核记录、黑名单状态。是 BidFile.bidderId 的归属。

**字段**：

```
Supplier {
  id*, name*, unifiedCode*     统一社会信用代码
  contactName, phone, email, address
  legalPerson                  法人
  qualifications[]  Qualification[]   资质（营业执照/行业资质，含有效期）
  admissionStatus*  enum      pending(待审核) | approved(已入库) | rejected | frozen | blacklist | deregistered
  admissionAppliedAt, approvedAt
  assessments[]     Assessment[]      考核记录（评分/等级）
  blacklistReason   string            黑名单原因
  dataScope         enum              数据范围（本人/部门/企业/全部）
  orgId*            所属组织
  createdAt, updatedAt
}

Qualification { type*, fileRef*, validFrom, validTo, status: valid | expiring | expired }
Assessment { id*, score, grade, comment, assessedAt }
```

**与 Organization 的边界**：Organization 是组织树（部门/公司），Supplier 是供应商业务实体（资质/准入/考核）。一个 Supplier 归属一个 Organization。

---

## ② 生命周期

状态链：

```
pending（待审核） → approved（已入库） → frozen（冻结） → blacklist（黑名单） → deregistered（注销）
                  ↘ rejected（驳回，可修改重提）
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 注册申请 | 资料齐全；协议同意 | pending | 供应商(自) |
| pending | 审核通过 | 资质齐全有效 | approved | 管理员 |
| pending | 驳回 | 填驳回原因 | rejected | 管理员 |
| rejected | 修改重提 | 补齐材料 | pending | 供应商(自) |
| approved | 冻结 | 违规/考核差 | frozen | 管理员 |
| frozen | 解冻 | - | approved | 管理员 |
| approved/frozen | 加入黑名单 | blacklistReason 必填 | blacklist | 管理员 |
| blacklist | 移出黑名单 | - | approved | 管理员 |
| approved | 注销 | - | deregistered | 管理员 |

---

## ③ Actor

| 动作 | 供应商 | 管理员 | 招标人/代理 |
|---|---|---|---|
| 注册/维护企业档案 | ●(自) | · | · |
| 上传资质 | ●(自) | · | · |
| 提交准入申请 | ●(自) | · | · |
| 准入审核（通过/驳回/退回） | · | ● | · |
| 冻结/解冻 | · | ● | · |
| 黑名单（加/移） | · | ● | · |
| 考核 | · | ● | · |
| 查看档案 | ●(自) | ○ | ○(投标时只读) |

> 冻结/黑名单供应商：不可报名新项目；已投投标文件按状态处理。

---

## ④ Event

- `registered` 注册申请
- `admission_approved` / `admission_rejected` 准入审核
- `resubmitted` 修改重提
- `frozen` / `unfrozen` 冻结/解冻
- `blacklisted` / `unblacklisted` 黑名单
- `assessed` 考核
- `deregistered` 注销

---

## ⑤ Rule

1. **准入阻断规则**：admissionStatus≠approved 不可报名/投标。
2. **资质有效性规则**：资质过期（validTo<now）有警告；报名时校验项目所需资质类型，缺失阻断。
3. **黑名单规则**：blacklist 状态不可报名；新报名阻断并提示。
4. **冻结规则**：frozen 状态不可报名，但历史投标文件保留。
5. **数据范围规则**：dataScope 决定其业务数据可见范围（本人/部门/企业/全部）。（Q10）
6. **审核三态规则**：准入审核支持通过/驳回/退回修改三种操作，驳回/退回须填原因。

---

## ⑥ Question

- **Q10** 数据隔离粒度？（默认四档：本人/部门/企业/全部）
- 黑名单期限是永久还是有期？（需求未明确）
- 考核评分维度和等级标准？（需求提到考核管理/等级配置，未给维度）
- 资质过期是否自动阻断报名，还是仅警告？（默认：项目必需资质过期则阻断，非必需仅警告）
- 供应商注销后历史投标数据保留多久？（需求未明确）
