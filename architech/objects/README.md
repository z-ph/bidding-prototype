# 业务对象分析（对象中心化）

> 方法论：**不要围绕「页面/功能」思考，要围绕「业务对象」思考。**
> 页面和菜单是结果；对象、生命周期、Actor、事件、规则才是分析的骨架。
> 数据库、接口、状态机、权限、测试用例都围绕对象设计，不围绕页面设计。

## 六面模板（每张对象卡必须回答）

| 面 | 回答的问题 | 产出 |
|---|---|---|
| ① 业务对象 | 系统里有什么？字段是什么？ | 对象定义 + 字段清单 |
| ② 生命周期 | 对象一生经历什么状态？ | 状态链 + 迁移表 |
| ③ Actor | 谁在操作它？创建/修改/删除/审核/查看/通知 | 角色×动作矩阵（对本对象） |
| ④ Event | 什么事件触发状态变化？（事件≠状态） | 事件清单 |
| ⑤ Rule | 为什么能这样变化？guard 条件是什么？ | 业务规则清单 |
| ⑥ Question | 还有什么不知道？ | 待确认问题（不猜） |

> 五件事清楚（Object/Actor/Lifecycle/Rule/Question）再进入总体设计和详细设计，后面的设计顺理成章，不再边开发边补规则。

## 对象索引

| 对象 | 文件 | 状态 | 说明 |
|---|---|---|---|
| PortalContent | [portal-content.md](./portal-content.md) | ✅ | 门户内容（新闻/系统公告/法规），验证模板 |
| Package | [package.md](./package.md) | ✅ | 标段/包，流程主体，验证深度 |
| **BidFile** | [bid-file.md](./bid-file.md) | ✅ **P0** | 投标文件（签章/加密/提交链），P0-2/P0-3 载体 |
| **TenderDoc** | [tender-doc.md](./tender-doc.md) | ✅ **P0** | 招标文件（版本链+评分项冻结），P0-4 载体 |
| **OpeningSession** | [opening-session.md](./opening-session.md) | ✅ **P0** | 开标会（签到/解密），P0-1 载体 |
| **Evaluation** | [evaluation.md](./evaluation.md) | ✅ **P0** | 评标（委员会/任务/评分/结果），P0-4/P1-5 载体 |
| Project | [project.md](./project.md) | ✅ | 项目容器 |
| Notice | [notice.md](./notice.md) | ✅ | 交易公告（6 类） |
| BidQuote | [bid-quote.md](./bid-quote.md) | ✅ | 报价（含轮次） |
| Supplier | [supplier.md](./supplier.md) | ✅ | 供应商（准入/黑名单） |
| Expert | [expert.md](./expert.md) | ✅ | 评标专家 |
| Award | [award.md](./award.md) | ✅ | 中标/定标 |
| Objection | [objection.md](./objection.md) | ✅ | 异议/质疑 |
| Abnormal | [abnormal.md](./abnormal.md) | ✅ | 异常（终止/中止/重新招标） |
| Contract | [contract.md](./contract.md) | ✅ | 合同归档 |
| Payment | [payment.md](./payment.md) | ✅ | 费用（文件费/保证金/平台费） |
| 支撑对象 | [supporting-objects.md](./supporting-objects.md) | ✅ | Organization/User/AuditLog/Dictionary/WinRecord 等基础设施 |

> ExpertTask 作为 Evaluation 的子对象在 [evaluation.md](./evaluation.md) 内描述；Expert 抽取算法见 Evaluation 卡 §5。
> ProcurementRequirement（采购需求）非核心流转对象，作为 Project 的辅助关联（requirementId），暂不单列卡。
> BidderRegistration/Invitation/SupplierBlacklist/EntrustContract 作为相关核心对象的子概念或字段承载（见 02 实体表「对象卡」列），暂不单列；EntrustContract 待委托抽取条件确认后补。

## 与横向文档的关系

对象卡是**源头**，横向文档是**投影**：

- `02-domain-model.md` ← 各对象卡的「① 对象定义」汇总成 ER 图与字段表
- `03-state-machines.md` ← 各对象卡的「② 生命周期」汇总成状态机总览
- `04-role-state-action-matrix.md` ← 各对象卡的「③ Actor + ⑤ Rule」汇总成跨对象权限矩阵
- `05-core-business-rules.md` ← 各对象卡的「⑤ Rule」中跨对象的算法（评标/串标/回避）
- `role-action-matrix.md` ← 各对象卡的「③ Actor」汇总成需求级行为矩阵

**规则：先改对象卡，再同步投影。** 对象卡是 single source of truth。

## 推进方式

逐个对象写。每张卡写完后，对应的 `02`/`03`/`04`/`05` 投影同步更新。待全部对象卡完成，`03`/`04` 可由对象卡重新生成，消除冗余。
