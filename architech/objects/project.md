# 业务对象：Project（项目）

> 项目是容器，不是流程主体。流程主体是 Package（标段）。
> 一个 Project 含多个 Package，Project 状态由其所有 Package 状态聚合得出。

---

## ① 业务对象

**定义**：招标人发起的一次采购立项，承载项目级预算、类型、组织方式，下挂多个标段。本身不参与投标/开标流转。

**字段**：

```
Project {
  id*, name*, code*           string   项目编号
  type*        enum           project(工程) | goods(货物) | service(服务) | it(信息化)
  budget*      number         项目预算（万元）= 所有标段预算的上限
  organizeMode* enum          self(自行招标) | entrust(委托代理)
  agencyId     string         委托代理时，受托代理机构ID
  entrustContractId string    委托合同ID（委托代理时）
  requirementId string        关联采购需求（年度计划/临时申请单号，非必填）
  tendereeId*  string         招标人组织ID
  status*      enum           planning | active | archived | abnormal
  createdAt
}
```

**与 Package 的边界**：Project 管立项（预算/类型/组织方式），Package 管流转（投标/开标/评标/定标状态）。预算校验在 Project↔Package 间：Σ Package.budget ≤ Project.budget。

---

## ② 生命周期

状态链：

```
planning（立项中） → active（已发标，至少一个标段 bidding+） → archived（所有标段 archived） 
                                              ↘ abnormal
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 创建项目 | 仅招标人 | planning | 招标人 |
| planning | 委托代理 | 委托合同已审核 | planning | 代理(审核合同) |
| planning | 首个标段发标 | - | active | 招标人 |
| active | 所有标段 archived | - | archived | 系统（聚合） |
| active/planning | 标段全部异常 | - | abnormal | 系统（聚合） |

> Project 状态是**聚合态**，由 Package 状态推导，不直接由用户操作改变。

---

## ③ Actor

| 动作 | 招标人 | 代理 | 管理员 |
|---|---|---|---|
| 创建项目 | ● | · | · |
| 编辑项目（active 前） | ● | ●(受托) | · |
| 委托合同审核 | · | ● | · |
| 代理机构抽取 | ● | · | · |
| 查看项目 | ● | ●(受托) | ○ |

> 代理不可创建项目（已有规则），受托后可编辑受托项目。

---

## ④ Event

- `created` 创建
- `entrusted` 委托代理（合同审核通过）
- `activated` 首标段发标（→ active）
- `aggregated_archived` 所有标段归档（→ archived）
- `aggregated_abnormal` 所有标段异常（→ abnormal）

---

## ⑤ Rule

1. **创建权限**：仅招标人可创建项目；代理不可。
2. **预算上限规则**：Σ Package.budget ≤ Project.budget，超标阻断发标。（P1-6）
3. **聚合状态规则**：Project 状态由 Package 状态聚合，不独立设置。
4. **委托规则**：organizeMode=entrust 须有委托合同且代理已审核，才可发标。
5. **编辑窗口规则**：active 后项目级字段只读（标段级仍可按各自状态操作）。
6. **类型规则**：type 决定标段表单字段（工程/货物/服务差异化）。

---

## ⑥ Question

- **Q1** 多标段是否独立流转？（默认是，Project 为容器）
- 项目编号生成规则？（自动 or 手动）
- 委托合同是否必须在线审核，还是可跳过？（需求提到委托合同管理，待确认是否强制）
- 代理机构随机抽取的**抽取条件**是什么？（资质/地域/回避？需求未明确）
- 项目类型（工程/货物/服务）具体如何影响标段表单字段？（待明确字段差异）
