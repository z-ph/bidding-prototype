# 业务对象：Expert（评标专家）

> 专家库实体，含专业领域、回避单位、资质审核状态。
> 是 ExpertTask.expertId 的归属。抽取算法在 Evaluation 卡 §5。

---

## ① 业务对象

**定义**：评标专家个人，含专业领域、所属单位、主动回避单位、资质审核状态。可自主注册或临时登录。

**字段**：

```
Expert {
  id*, name*, phone*
  field*         string[]      专业领域（电子信息/机械设备/工程造价/软件工程...）
  org*           string        所属单位
  avoidOrgs[]    string[]      主动回避单位
  qualificationStatus*  enum   pending | approved | rejected
  title, expertise           职称/专长
  signature      string        电子签名（采集）
  status*        enum          active | frozen | deregistered
  createdAt
}
```

**与 ExpertTask 的边界**：Expert 是专家档案；ExpertTask 是专家在某标段的评标任务（抽取→通知→接受→评标）。一个 Expert 可有多个 ExpertTask。

---

## ② 生命周期

```
pending（资质审核） → approved（在库） → frozen → deregistered
                    ↘ rejected（可补料重提）
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 注册 | 提交信息+资质 | pending | 专家(自) |
| pending | 审核通过 | 资质合规 | approved | 管理员 |
| pending | 驳回 | 填原因 | rejected | 管理员 |
| rejected | 补料重提 | - | pending | 专家(自) |
| approved | 冻结 | 违规 | frozen | 管理员 |
| frozen | 解冻 | - | approved | 管理员 |
| approved | 注销 | - | deregistered | 管理员 |

---

## ③ Actor

| 动作 | 专家 | 管理员 | 招标人/代理 |
|---|---|---|---|
| 注册/维护信息 | ●(自) | · | · |
| 资质审核 | · | ● | · |
| 工作台查任务 | ●(自) | · | · |
| 评分点配置 | · | ● | · |
| 抽取（读专家库） | · | · | ●(抽) |
| 冻结/解冻 | · | ● | · |

---

## ④ Event

- `registered` 注册
- `qualification_approved` / `rejected` 资质审核
- `frozen` / `unfrozen`
- `extracted` 被抽取（生成 ExpertTask）
- `deregistered` 注销

---

## ⑤ Rule

1. **在库规则**：qualificationStatus=approved 才可被抽取。
2. **回避规则**：抽取过滤 avoidOrgs；专家可维护主动回避单位。
3. **冻结规则**：frozen 不可被抽取。
4. **评分点配置规则**：管理员配置评分点及分值（字典层），供评标引用。

---

## ⑥ Question

- 专家专业领域字典是否固定还是可配？（需求提到评分点配置，领域字典待确认）
- 专家回避除主动回避单位外，是否自动回避同项目已报名投标人？（Q7，默认是，见 Evaluation 卡）
- 专家注册是否需要单位盖章/推荐？（需求未明确）
- 专家库容量和抽取比例（如 1:3）？（需求未明确）
- 临时专家登录机制？（需求提到"临时专家登录"，待确认）
