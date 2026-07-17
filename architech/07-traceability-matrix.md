# 07 - 需求追溯矩阵

> 每个字段/按钮/菜单可回溯到需求条目；需求未明确的标记 ⚠ 待确认（见 `01`）。
> 本矩阵是「凭空增删字段」问题的直接对策。

---

## 1. 追溯链定义

```
需求条目(原始文档章节) -> 实体/字段(02) -> 状态(03) -> 角色×动作(04) -> 页面(views) -> 验收(08)
```

每行必须能从左走到右，任何一环断裂即标红。

---

## 2. 核心追溯矩阵

### 2.1 项目管理

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 项目创建 | Project+Package | draft | 招标人: create | ProjectCreate | P1-6 | 代理不可创建 |
| 标段(包)管理 | Package | draft | 招标人: edit | ProjectCreate | P1-6 | |
| 类型管理(工程/货物/服务) | Project.type | - | - | ProjectCreate | - | |
| 招标组织形式 | Project.organizeMode | - | 招标人 | ProjectCreate | - | 自行/委托 |
| 委托合同管理 | EntrustContract | - | 代理: 审核 | (新增) | ⚠ 待确认页面 | |
| 代理机构随机抽取 | - | - | 招标人 | (新增) | ⚠ 待确认规则 | Q: 抽取条件? |
| 标段预算联动 | Package.budget vs Project.budget | draft | 校验 | ProjectCreate | B6 | |
| 采购方式 | Package.procurementMethod | - | - | ProjectCreate | - | 4 种 |
| 需求编号字段 | ProcurementRequirement.reqNo | - | - | ProjectCreate | - | 非必填，有提示 |

### 2.2 招标文件

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 招标文件编制 | TenderDocVersion.catalog | editing | 招标人/代理: edit | TenderDoc | - | |
| 澄清修改管理 | TenderDocVersion + Notice(clarification) | published | 招标人: 发澄清 | TenderDoc | B3 | |
| 自定义开标一览表 | Package.quoteFields | editing | 招标人: 配置 | TenderDoc | B2 | 驱动报价 |
| 评标办法模板导入导出 | TenderDocVersion.scoreItems | editing | 招标人 | TenderDoc | - | |
| 评分办法配置 | TenderDocVersion.scoreMethod+scoreItems | editing->published 冻结 | 招标人 | TenderDoc | A4 | P0 |
| 招标文件质疑 | Objection(type=clarification) | - | 投标人: 提出 | TenderDoc/BidDownload | - | |
| 复核人字段 | - | - | - | - | - | ❌ 需求无依据，删除 |

### 2.3 发标/公告

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 招标公告发布 | Notice(tender) | draft->published | 招标人/代理 | NoticePublish | - | structuredFields |
| 变更公告 | Notice(change)+changeReason | published->changed | 招标人/代理 | NoticePublish | - | 必填原因 |
| 投标邀请书 | Invitation | - | 招标人: 发邀请 | ProjectCreate | - | 邀请招标 |
| 邀请变更 | Invitation | - | 招标人 | (新增) | - | |
| 公告列表 | Notice | - | - | NoticeList | - | |
| 中标候选人公示 | Notice(candidate) | - | 招标人 | AwardConfirm | - | 可跳过 |
| 中标公告 | Notice(award) | - | 招标人 | AwardNotice | - | |
| 异常公告 | Notice(abnormal)+Abnormal | - | 招标人/监督 | SupervisorAbnormal | - | Q12 |

### 2.4 投标（招标方视角）

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 报名企业审核 | BidderRegistration | registering | 招标人: 审核 | (ProjectList) | - | |
| 参与企业查看 | BidderRegistration | - | 招标人: 查看 | ProjectDetail | - | |
| 参与情况跟踪导出 | BidderReg+Payment+BidFile | - | 招标人 | ProjectTrack | - | 导出 |

### 2.5 投标（投标方视角）

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 项目报名 | BidderRegistration | bid_open | 投标人: register | BidRegister | - | |
| 邀请接收 | Invitation | - | 投标人: 接受 | BidderProjects | - | 邀请招标 |
| 招标文件缴费下载 | Payment(type=filefee)+TenderDoc | - | 投标人 | BidPayment/BidDownload | - | Q11 |
| 澄清文件下载 | TenderDocVersion | - | 投标人: 下载 | BidDownload | B3 | |
| 招标文件质疑 | Objection | - | 投标人: 提出 | BidDownload | - | |
| 缴纳保证金 | Payment(type=deposit) | - | 投标人: 凭证 | BidPayment | - | Q11 |
| 投标文件上传 | BidFile | uploaded->signed->encrypted->submitted | 投标人 | BidUpload | A2/A3 | P0 |
| 在线报价 | BidQuote | - | 投标人 | BidUpload/BidQuote | B2 | 询比价 |
| 参与项目查询 | BidFile/BidderReg | - | 投标人: 查看 | BidderProjects | - | |
| 发票申请 | (新增 Invoice) | - | 投标人 | BidderInvoices | - | |

### 2.6 开标

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 确认主持人/监督人 | OpeningSession.hostId/supervisorId | prepared | 招标人 | OpeningHall | - | |
| 线上开标大厅 | OpeningSession | signing->decrypt->singing | 各角色 | OpeningHall | - | |
| 在线签到 | SignIn | signing | 各角色: 签自己 | OpeningHall | - | |
| 在线解密 | BidFile.decrypted | decrypt | 投标人(owner): 解密 | OpeningHall | A1 | P0 |
| 唱标/导出记录 | OpeningSession.record | singing->closed | 招标人 | OpeningHall | - | |
| 监督开标 | - | 全程 | 监督: 查看 | SupervisorHall | - | Q5 |
| 线下开标录入 | OpeningSession(offline) | - | 招标人 | (新增) | - | |

### 2.7 比价大厅

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 报价企业查看 | BidQuote | compare | 招标人: 查看 | (新增) | - | Q3 |
| 多维比价/最低价标红 | BidQuote | - | 招标人 | (新增) | - | |
| 二次报价 | BidQuote(round) | compare | 投标人: 报价 | BidQuote | - | Q3 |
| 确定供应商 | Award | - | 招标人 | (新增) | - | Q9 |

### 2.8 评标

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 专家录入/抽取 | EvaluationCommittee+ExpertTask | extracting | 招标人/代理 | ExpertExtraction | B5 | |
| 短信通知 | ExpertTask.notified | notified | 系统 | - | - | 沙箱 |
| 采集专家签名 | ExpertTask.signature | - | 专家 | (新增) | - | |
| 启动评标 | Package | evaluating | 招标人 | ExpertExtraction | - | |
| 专家签到/选组长 | EvaluationCommittee.leaderId | accepted | 专家 | EvaluationHall | - | |
| 在线查阅资料 | TenderDoc+BidFile | reviewing | 专家: 读 | EvaluationHall | - | |
| 在线评分 | Score | scoring | 专家(owner): 评分 | EvaluationHall | A4 | P0 |
| 汇总得分 | EvaluationResult | summary | 组长: 汇总 | EvaluationHall | A4 | |
| 生成报告 | EvaluationResult.report | summary->closed | 组长 | EvaluationHall | - | |
| 电子签名 | ExpertTask.signature | closed | 专家 | EvaluationHall | - | |
| 标后数据归档 | Package | archived | 招标人 | ProjectDetail | - | |
| 中标候选人查看 | AwardCandidate | pre_award | 招标人 | AwardConfirm | - | |
| 监督评标 | - | 全程 | 监督: 查看 | SupervisorHall | - | |
| 线下评标录入 | EvaluationResult(offline) | - | 招标人 | (新增) | - | |

### 2.9 定标

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 中标候选人公示 | Notice(candidate) | pre_award | 招标人 | AwardConfirm | - | 可跳过 |
| 确认中标人 | Award | awarded | 招标人 | AwardConfirm | - | Q9 |
| 中标结果公示 | Notice(award) | awarded | 招标人 | AwardNotice | - | |
| 中标通知书 | Award.noticeSentAt | awarded | 招标人 | AwardNotice | - | |
| 中标合同管理 | Contract | archived | 招标人 | ContractArchive | - | 可跳过 Q13 |

### 2.10 投标文件管理

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 上传投标文件 | BidFile | uploaded | 投标人 | BidUpload | A2 | |
| 关联评标条款页码 | BidFile.clauseLinks | - | 投标人 | BidUpload | B1 | P1 |
| 设置报价一览表 | BidFile.quoteSnapshot | - | 投标人 | BidUpload | B2 | |
| 加密/签章/签名 | BidFile.signStatus/encryptMethod | signed->encrypted | 投标人 | BidUpload | A2/A3 | P0 |
| 多种加密方式 | BidFile.encryptMethod | - | 投标人 | BidUpload | A3 | 密码=草稿 |

### 2.11 专家库管理

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 专家注册/审核 | Expert | - | 专家/管理员 | ExpertProfile | - | |
| 专家工作台 | ExpertTask | - | 专家 | ExpertTasks | B5 | P1 |
| 专家抽取 | EvaluationCommittee | - | 招标人 | ExpertExtraction | B5 | |
| 短信通知 | ExpertTask.notified | - | 系统 | - | - | |
| 专家信息管理 | Expert | - | 管理员 | (新增) | - | |
| 评分点配置 | ScoreItem | - | 管理员 | AdminDictionary | - | |

### 2.12 辅助功能

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| CA绑定/一键登录 | User.caBound | - | 用户 | Login | - | 沙箱 |
| 异议管理 | Objection | - | 投标人/招标人 | ObjectionManage | - | |
| 招标异常 | Abnormal | - | 招标人/监督 | SupervisorAbnormal | - | Q12 |
| 费用管理 | Payment | - | 招标人/投标 | FeeManage | - | Q11 |
| 项目跟踪 | Package.status | 全程 | 各角色 | ProjectTrack | - | 按角色过滤 |
| 控制面板/开标月历 | - | - | 各角色 | Dashboard | - | |

### 2.13 数据分析

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 中标清单管理 | WinRecord | - | 管理员 | (新增) | - | |
| 中标日历匹配 | WinRecord+Notice(award) | - | 管理员 | (新增) | - | |
| 数据分析分类汇总 | WinRecord | - | 管理员 | (新增) | - | |
| 串标围标预警 | analysisStore.warning | - | 监督/管理员 | (新增) | B4 | P1 ⚠ Q4 |

### 2.14 系统管理

| 需求条目 | 实体/字段 | 状态 | 角色×动作 | 页面 | 验收 | 备注 |
|---|---|---|---|---|---|---|
| 系统参数/注册类型/邮件/标室/公告 | Dictionary | - | 管理员 | AdminDictionary | - | |
| 参数字典(树形) | Dictionary(tree) | - | 管理员 | AdminDictionary | - | |
| 邀请书/通知书模板 | Template | - | 管理员 | AdminDictionary | - | |
| 用户参数配置 | UserParam | - | 管理员 | AdminDictionary | - | |
| 模块菜单/权限 | PagePerm+ActionPerm | - | 管理员 | AdminUsers | - | |
| 用户管理 | Organization+User | - | 管理员 | AdminUsers/Organization | - | |
| 日志记录 | AuditLog | - | 管理员 | AdminLogs | - | |
| 注册审核 | Organization.status | - | 管理员 | AdminSupplierAudit | - | |
| 数据隔离 | Organization.dataScope | - | 管理员 | Organization | - | Q10 |
| 供应商管理/黑名单/考核 | SupplierBlacklist | - | 管理员 | (新增) | - | |

---

## 3. 断链项汇总（需补实现或确认）

| 需求条目 | 断链原因 | 处置 |
|---|---|---|
| 委托合同管理 | 无实体无页面 | `02` 新增 EntrustContract，⚠ 页面待确认 |
| 代理机构随机抽取 | 无规则 | ⚠ Q: 抽取条件待确认 |
| 比价大厅 | 无独立页面/状态机 | `03` 补 compare 状态，新增页面 |
| 线下开标/评标录入 | 无页面 | 新增（原型可简化） |
| 串标预警 | 无规则无页面 | `05` 给规则，⚠ Q4 待确认 |
| 数据分析模块 | 无实体无页面 | 新增 analysisStore + 页面 |
| 供应商黑名单/考核 | 无实体 | 新增 SupplierBlacklist |
| 保证金退还 | 需求空白 | ⚠ Q11 |
| 合同归档跳过终止 | 需求模糊 | ⚠ Q13 |

---

## 4. 无依据字段清理（来自评审反思）

| 字段 | 处置 | 原因 |
|---|---|---|
| 复核人(confirmer) | 删除 | 原始需求无此角色/字段 |
| 采购方式「单一来源」 | 删除 | 原始需求仅 4 种，无单一来源 |
| 评标固定商务30/技术40/价格30 | 改为配置驱动 | 需求要求评分办法可配置 |

---

## 5. 追溯矩阵维护规则

1. 新增字段/按钮/菜单时，必须在本矩阵登记对应需求条目；无对应条目的进入 `01` 待澄清。
2. 矩阵每行必须可从需求走到验收；断链即标红并列入 §3。
3. `⚠ 待确认` 项在需求方确认后转为正式条目。
