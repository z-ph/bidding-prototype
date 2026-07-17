# 06 - 模块架构与边界

> 本篇定义模块划分、依赖方向、前后端契约、store 治理规则。
> 目的：解决「数据散落组件、store 职责不清、跨页面数据不衔接」的架构问题。

---

## 1. 模块划分（对齐原始需求七大模块）

```
┌─────────────────────────────────────────────────────────────┐
│                     展示层：招投标门户                        │
│  Portal / Notice / News / Help / Downloads / Contact        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  业务层：招投标交易系统                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ 项目管理    │→│ 招标文件    │→│ 发标/公告           │   │
│  │ Project/Pkg │ │ TenderDoc   │ │ Notice              │   │
│  └─────────────┘ └─────────────┘ └──────────┬──────────┘   │
│                                              │              │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────▼──────────┐   │
│  │ 投标        │ │ 开标        │ │ 评标                │   │
│  │ BidFile/    │ │ Opening     │ │ Evaluation          │   │
│  │ BidQuote    │ │ Session     │ │ Committee/Score     │   │
│  └─────────────┘ └─────────────┘ └──────────┬──────────┘   │
│                                              │              │
│  ┌───────────────────────────────────────────▼──────────┐   │
│  │ 定标：AwardCandidate -> Award -> Contract            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  支撑层：辅助功能 / 数据分析 / 专家库 / 投标文件管理         │
│  Objection / Abnormal / Fee / ProjectTrack / Expert / Win   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  管理层：系统管理（组织/用户/字典/日志/供应商/权限）         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 依赖方向规则

**单向依赖，禁止环**：

```
门户 ──读──▶ 交易系统（公告数据）
交易系统 ──读──▶ 专家库（抽取）
交易系统 ──读/写──▶ 投标文件管理（BidFile）
交易系统 ──写──▶ 数据分析（中标清单）
辅助功能 ──读──▶ 交易系统（项目跟踪）
系统管理 ──配置──▶ 全模块（权限/字典/组织）

禁止：交易系统 ──依赖──▶ 系统管理的实现细节（只依赖配置）
禁止：开标大厅直接改 BidFile（只读引用，BidFile 由投标人写）
```

**关键依赖约束**：
- 开标大厅 `读` BidFile.submitStatus，`不写` BidFile（解密动作由投标人触发，开标大厅只更新 OpeningSession.decryptStatus）。
- 评标大厅 `读` TenderDoc.currentPublished.scoreItems，`不读` 草稿。
- 定标 `读` EvaluationResult.ranking，`不重算`。

---

## 3. Store 治理（核心架构改造）

### 3.1 现状问题

| 问题 | 影响 |
|---|---|
| BidFile 状态在组件 useState | 刷新丢失、跨页面不可读 |
| 标段信息平铺在 Project | 多标段无法独立流转 |
| OpeningSession 无 store | 签到/解密状态不持久 |
| Score 散在 EvaluationHall | 组长无法汇总 |
| 多个 store 互相直接读 | 耦合方向不清 |

### 3.2 目标 Store 清单

```
src/data/
├── projectStore.js          项目容器（轻量：id/name/budget/type/organizeMode/agencyId）
├── packageStore.js          ★ 新增：标段（流程主体，含状态机）
├── tenderDocStore.js        保留：版本链 + scoreItems + evaluationClauses
├── noticeStore.js           ★ 补全：生命周期 + structuredFields
├── bidFileStore.js          ★ 新增：投标文件状态链（P0 前置）
├── bidQuoteStore.js         ★ 新增：报价（含轮次）
├── paymentStore.js          ★ 新增：文件费/保证金/平台费
├── openingStore.js          ★ 新增：开标会（签到/解密状态）
├── evaluationStore.js       ★ 新增：委员会/任务/评分/结果
├── awardStore.js            ★ 新增：候选人/中标/合同
├── expertStore.js           保留 + 补 ExpertTask 链路
├── objectionStore.js        保留
├── abnormalStore.js         ★ 新增：异常公告
├── organizationStore.js     保留 + 数据范围
├── auditLogStore.js         ★ 新增：结构化操作日志
└── analysisStore.js         ★ 新增：中标清单/预警
```

### 3.3 Store 职责约定

1. **每个 store 只管一个聚合根**（见 `02` §4）。
2. **跨 store 读取走显式函数调用，不互相 import 内部状态**：
   - `openingStore.getDecryptList(packageId)` 内部读 `bidFileStore.getByPackage(packageId)`。
   - `evaluationStore.getScores(packageId)` 内部读 `expertStore.getTasks`。
3. **状态迁移函数集中在 store**，UI 只调用：
   - `bidFileStore.sign(bidFileId)` / `.encrypt(id, method)` / `.submit(id)`。
   - store 内校验状态合法性（`03` 状态机），非法迁移抛错。
4. **持久化统一 localStorage**，key 命名 `bidding-<entity>-v<n>`。
5. **种子数据**：每个 store 提供 `seed()`，演示环境首次加载时初始化。

### 3.4 Store API 契约示例（BidFile）

```js
bidFileStore = {
  getByPackage(packageId),           // 开标大厅/评标大厅读
  getByBidder(bidderId),             // 投标人工作台读
  create(packageId, bidderId),
  addFile(bidFileId, file),
  sign(bidFileId, fileName),         // 校验: state>=uploaded
  encrypt(bidFileId, fileName, method),  // 校验: signed
  submit(bidFileId),                 // 校验: ca加密 + 全签全密 (P0-3)
  withdraw(bidFileId),               // 校验: 截止前
  markDecrypted(bidFileId),          // 开标时由 owner 调用 (P0-1)
  getReceipt(bidFileId),
}
```

---

## 4. 前后端契约（原型 = 纯前端 Mock）

原型阶段 store 即「后端」。未来接真实后端时，store 函数签名映射为 REST/RPC：

| Store 方法 | 映射 | 说明 |
|---|---|---|
| `getByPackage(id)` | `GET /packages/:id/bid-files` | |
| `submit(id)` | `POST /bid-files/:id/submit` | 服务端复验加密 |
| `extractExperts(pkg, cond)` | `POST /packages/:id/expert-extraction` | |
| `summarize(pkgId)` | `POST /packages/:id/evaluation/summarize` | 组长专用 |

**契约约束**：store 函数签名稳定，未来替换为 HTTP 调用时 UI 层不动。

---

## 5. 前端分层

```
src/
├── views/          页面组件（只负责渲染 + 调 store/hook）
├── components/     通用组件（Layout/StatusTag/EmptyState...）
├── hooks/          业务 hook（useBidFile/useOpening/useEvaluation...）
├── data/           store 层（聚合根 + 状态机 + 持久化）
├── config/         permissions + actionPermissions + qualifications + 字典
├── routes/         TanStack 文件路由（只放路由元数据）
└── utils/          纯函数（价格分计算/哈希/校验）
```

**分层规则**：
- `views` 不直接 `localStorage`，必须经 `data/store`。
- `views` 不做状态机判断，调 store 函数，由 store 抛错、UI 捕获提示。
- 业务规则算法（价格分、串标判定）放 `utils/`，可单测。

---

## 6. 路由与菜单治理

现有路由已用 TanStack 文件路由。补充约束：

1. **开标大厅/评标大厅不作为顶级菜单**（已有），从项目跟踪/详情进入。
2. **动作型页面带 search 参数定位实体**：`/admin/opening-hall?packageId=X`，不用 `:id` 路径参数（因大厅是动作页非实体详情）。
3. **菜单按角色生成**：`Layout.useMenuItems` 依据 `PAGE_PERMISSIONS` + 当前角色过滤。

---

## 7. 外部服务沙箱

| 外部服务 | 原型策略 | 接口预留 |
|---|---|---|
| CA | 沙箱模拟 UKey 检测 + 模拟加密标记 | `caService.detect()` / `caService.encrypt()` |
| 短信 | 不发真实短信，写 SMS_LOG | `smsService.send()` 返回模拟结果 |
| 邮件 | 同短信 | `emailService.send()` |
| 支付 | 不接真实通道，缴费凭证上传+人工审核 | - |
| 电子签章 | 模拟签章状态标记 | `signService.sign()` |

沙箱服务集中在 `src/services/`，未来替换实现不改调用方。

---

## 8. 架构验收点

| # | 验收项 |
|---|---|
| - | BidFile 状态经 store 持久化，刷新不丢 |
| - | 开标大厅读 bidFileStore，不直接持有投标文件状态 |
| - | 评标评分页读 Package.scoreItems（发布快照），不读草稿 |
| - | store 间依赖单向无环 |
| - | 状态迁移集中在 store，UI 不判断状态合法性 |
